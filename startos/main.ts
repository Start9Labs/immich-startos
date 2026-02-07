import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import {
  uiPort,
  getPostgresSub,
  getPostgresEnv,
  getImmichEnv,
  withTempApiKey,
  immichApi,
} from './utils'
import { storeJson } from './fileModels/store.json'
import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { manifest as nextcloudManifest } from 'nextcloud-startos/startos/manifest'

const FILEBROWSER_MOUNTPOINT = '/mnt/filebrowser'
const NEXTCLOUD_MOUNTPOINT = '/mnt/nextcloud'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Immich'))

  const postgresEnv = await getPostgresEnv(effects)
  const libs =
    (await storeJson.read((s) => s.externalLibraries).const(effects)) || []

  // Build server mounts: always mount upload volume, conditionally mount external libraries
  let serverMounts = sdk.Mounts.of().mountVolume({
    volumeId: 'upload',
    mountpoint: '/usr/src/app/upload',
    readonly: false,
    subpath: null,
  })

  if (libs.some((l) => l.source.selection === 'filebrowser')) {
    serverMounts = serverMounts.mountDependency<typeof filebrowserManifest>({
      dependencyId: 'filebrowser',
      volumeId: 'data',
      subpath: null,
      mountpoint: FILEBROWSER_MOUNTPOINT,
      readonly: true,
    })
  }
  if (libs.some((l) => l.source.selection === 'nextcloud')) {
    serverMounts = serverMounts.mountDependency<typeof nextcloudManifest>({
      dependencyId: 'nextcloud',
      volumeId: 'nextcloud',
      subpath: null,
      mountpoint: NEXTCLOUD_MOUNTPOINT,
      readonly: true,
    })
  }

  const valkeySub = await sdk.SubContainer.of(
    effects,
    { imageId: 'valkey' },
    sdk.Mounts.of(),
    'valkey',
  )

  const postgresSub = await getPostgresSub(effects)

  const mlSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'immich-ml' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'model-cache',
      mountpoint: '/cache',
      readonly: false,
      subpath: null,
    }),
    'immich-ml',
  )

  const serverSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'immich-server' },
    serverMounts,
    'immich-server',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('postgres', {
      subcontainer: postgresSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: postgresEnv,
      },
      ready: {
        display: null,
        fn: async () => {
          const { exitCode } = await postgresSub.exec([
            'pg_isready',
            '-U',
            postgresEnv.POSTGRES_USER,
            '-h',
            'localhost',
          ])
          if (exitCode !== 0) {
            return { result: 'loading', message: null }
          }
          return { result: 'success', message: null }
        },
      },
      requires: [],
    })
    .addDaemon('valkey', {
      subcontainer: valkeySub,
      exec: { command: 'valkey-server' },
      ready: {
        display: null,
        fn: async () => {
          const res = await valkeySub.exec(['valkey-cli', 'ping'])
          return res.stdout.toString().trim() === 'PONG'
            ? { message: '', result: 'success' }
            : { message: res.stdout.toString().trim(), result: 'failure' }
        },
      },
      requires: [],
    })
    .addDaemon('immich-ml', {
      subcontainer: mlSub,
      exec: {
        command: sdk.useEntrypoint(),
        runAsInit: true,
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 3003, {
            successMessage: '',
            errorMessage: '',
          }),
      },
      requires: [],
    })
    .addDaemon('immich-server', {
      subcontainer: serverSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: getImmichEnv(postgresEnv),
        runAsInit: true,
      },
      ready: {
        display: i18n('Web Interface'),
        gracePeriod: 40000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['postgres', 'valkey', 'immich-ml'],
    })
    .addOneshot('configure-libraries', {
      subcontainer: serverSub,
      exec: {
        fn: async () => {
          if (!libs.length) return null

          // Compute import paths for each configured library
          const libraryConfigs = libs.map((lib) => {
            const importPath =
              lib.source.selection === 'filebrowser'
                ? `${FILEBROWSER_MOUNTPOINT}/${lib.source.value.path}`
                : `${NEXTCLOUD_MOUNTPOINT}/data/${lib.source.value.user}/files/${lib.source.value.path}`
            return { name: lib.name, importPaths: [importPath] }
          })

          await withTempApiKey(
            postgresSub,
            'startos-libs',
            async ({ token, adminId }) => {
              type Library = { id: string; name: string }
              const existing = await immichApi<Library[]>(
                '/libraries',
                token,
              )

              for (const cfg of libraryConfigs) {
                let lib = existing.find((e) => e.name === cfg.name)
                if (!lib) {
                  lib = await immichApi<Library>('/libraries', token, {
                    method: 'POST',
                    body: {
                      ownerId: adminId,
                      name: cfg.name,
                      importPaths: cfg.importPaths,
                    },
                  })
                } else {
                  await immichApi(`/libraries/${lib.id}`, token, {
                    method: 'PUT',
                    body: { importPaths: cfg.importPaths },
                  })
                }
                await immichApi(`/libraries/${lib.id}/scan`, token, {
                  method: 'POST',
                })
              }
            },
          )

          return null
        },
      },
      requires: ['immich-server'],
    })
    .addOneshot('configure-smtp', {
      subcontainer: serverSub,
      exec: {
        fn: async () => {
          const store = await storeJson.read((s) => s.smtp).const(effects)
          if (!store || store.selection === 'disabled') return null

          let creds: T.SmtpValue | null = null
          if (store.selection === 'system') {
            creds = await sdk.getSystemSmtp(effects).const()
            if (creds && store.value.customFrom)
              creds.from = store.value.customFrom
          } else if (store.selection === 'custom') {
            creds = store.value
          }
          if (!creds) return null

          await withTempApiKey(
            postgresSub,
            'startos-smtp',
            async ({ token }) => {
              const config = await immichApi<{
                notifications?: { smtp?: unknown }
              }>('/system-config', token)

              config.notifications = {
                ...config.notifications,
                smtp: {
                  enabled: true,
                  from: creds.from,
                  replyTo: creds.from,
                  transport: {
                    host: creds.server,
                    port: creds.port,
                    username: creds.login,
                    password: creds.password || '',
                    ignoreCert: false,
                  },
                },
              }

              await immichApi('/system-config', token, {
                method: 'PUT',
                body: config,
              })
            },
          )

          return null
        },
      },
      requires: ['immich-server'],
    })
})
