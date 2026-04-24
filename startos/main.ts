import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { manifest as nextcloudManifest } from 'nextcloud-startos/startos/manifest'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  buildCoreDaemons,
  createCoreSubs,
  enforceSystemConfigDefaults,
  getPostgresEnv,
  immichApi,
  withAdminApiKey,
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

  const subs = await createCoreSubs(effects, serverMounts)
  const { postgresSub, serverSub } = subs

  return (
    buildCoreDaemons(effects, subs, postgresEnv, {
      name: i18n('Web Interface'),
      success: i18n('The web interface is ready'),
      failure: i18n('The web interface is not ready'),
    })
      // Enforce StartOS-authoritative defaults via direct write to
      // system_metadata[system-config] — this bypasses Immich's API (which
      // requires an admin API key) so it works on a fresh install before the
      // user has completed sign-up.
      //
      //   newVersionCheck.enabled = false
      //     StartOS owns updates, so the "new version available" modal is noise.
      //   backup.database.enabled = false
      //     StartOS backs up the DB via pg_dump. Immich's scheduled internal
      //     dump is duplicate work that slowly fills the upload volume.
      //
      // See CLAUDE.md for the version-bump checklist.
      .addOneshot('enforce-defaults', {
        subcontainer: postgresSub,
        exec: {
          fn: async () => {
            await enforceSystemConfigDefaults(postgresSub)
            return null
          },
        },
        requires: ['postgres'],
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

            await withAdminApiKey(
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
      // Apply user-configurable settings that depend on the Immich API:
      //
      //   server.externalDomain = <primaryUrl>
      //     Immich embeds this in public share links. User picks which URL via
      //     the Set Primary URL action.
      //   notifications.smtp = <credentials>
      //     Only applied when the SMTP action is configured (system/custom).
      //     When "disabled", SMTP is left untouched — we don't forcibly clear
      //     whatever the user had previously.
      //
      // Enforced defaults (newVersionCheck, backup.database) live in the
      // enforce-defaults oneshot above — direct DB write, no admin needed.
      .addOneshot('apply-system-config', {
        subcontainer: serverSub,
        exec: {
          fn: async () => {
            if (!primaryUrl && !smtpCreds) return null

            await withAdminApiKey(
              postgresSub,
              'startos-system-config',
              async ({ token }) => {
                const config = await immichApi<{
                  server?: { externalDomain?: string }
                  notifications?: { smtp?: unknown }
                }>('/system-config', token)

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
