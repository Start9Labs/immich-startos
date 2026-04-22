import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { manifest as nextcloudManifest } from 'nextcloud-startos/startos/manifest'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  getImmichEnv,
  getPostgresEnv,
  getPostgresSub,
  immichApi,
  uiPort,
  withTempApiKey,
} from './utils'

const FILEBROWSER_MOUNTPOINT = '/mnt/filebrowser'
const NEXTCLOUD_MOUNTPOINT = '/mnt/nextcloud'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Immich'))

  const postgresEnv = await getPostgresEnv(effects)

  const store = await storeJson.read().const(effects)
  if (!store) throw new Error('store.json not found')

  const libs = store.externalLibraries || []
  const primaryUrl = store.primaryUrl
  const smtpStore = store.smtp

  let smtpCreds: {
    host: string
    port: number
    from: string
    username: string
    password: string | null | undefined
  } | null = null
  if (smtpStore && smtpStore.selection === 'system') {
    smtpCreds = await sdk.getSystemSmtp(effects).const()
    if (smtpCreds && smtpStore.value.customFrom)
      smtpCreds.from = smtpStore.value.customFrom
  } else if (smtpStore && smtpStore.selection === 'custom') {
    const p = smtpStore.value.provider.value
    smtpCreds = {
      host: p.host,
      port: Number(p.security.value.port),
      from: p.from,
      username: p.username,
      password: p.password,
    }
  }

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

  return (
    sdk.Daemons.of(effects)
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
                const existing = await immichApi<Library[]>('/libraries', token)

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
      // Apply every StartOS-authoritative Immich setting in one /system-config
      // round trip. We use the API rather than IMMICH_CONFIG_FILE because that
      // env var locks the *entire* admin settings UI — the API approach leaves
      // everything else UI-editable.
      //
      //   newVersionCheck.enabled = false
      //     StartOS owns updates, so the "new version available" modal is noise.
      //   backup.database.enabled = false
      //     StartOS backs up the DB via pg_dump. Immich's scheduled internal
      //     dump is duplicate work that slowly fills the upload volume.
      //   server.externalDomain = <primaryUrl>
      //     Immich embeds this in public share links. User picks which URL via
      //     the Set Primary URL action.
      //   notifications.smtp = <credentials>
      //     Only applied when the SMTP action is configured (system/custom).
      //     When "disabled", SMTP is left untouched — we don't forcibly clear
      //     whatever the user had previously.
      .addOneshot('apply-system-config', {
        subcontainer: serverSub,
        exec: {
          fn: async () => {
            await withTempApiKey(
              postgresSub,
              'startos-system-config',
              async ({ token }) => {
                const config = await immichApi<{
                  newVersionCheck?: { enabled?: boolean }
                  backup?: { database?: { enabled?: boolean } }
                  server?: { externalDomain?: string }
                  notifications?: { smtp?: unknown }
                }>('/system-config', token)

                config.newVersionCheck = {
                  ...config.newVersionCheck,
                  enabled: false,
                }
                config.backup = {
                  ...config.backup,
                  database: {
                    ...config.backup?.database,
                    enabled: false,
                  },
                }
                if (primaryUrl) {
                  config.server = {
                    ...config.server,
                    externalDomain: primaryUrl,
                  }
                }
                if (smtpCreds) {
                  config.notifications = {
                    ...config.notifications,
                    smtp: {
                      enabled: true,
                      from: smtpCreds.from,
                      replyTo: smtpCreds.from,
                      transport: {
                        host: smtpCreds.host,
                        port: smtpCreds.port,
                        username: smtpCreds.username,
                        password: smtpCreds.password || '',
                        ignoreCert: false,
                      },
                    },
                  }
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
  )
})
