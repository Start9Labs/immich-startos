import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { manifest as nextcloudManifest } from 'nextcloud-startos/startos/manifest'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  buildCoreDaemons,
  createCoreSubs,
  enforceSystemConfigDefaults,
  ensureApiKey,
  FILEBROWSER_MOUNTPOINT,
  getPostgresEnv,
  immichApi,
  NEXTCLOUD_MOUNTPOINT,
  sourceExposed,
  withAdminApiKey,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Immich'))

  const postgresEnv = await getPostgresEnv(effects)

  // Project to the keys main actually uses: the oneshots below merge `apiKey`
  // and `nextcloudUsers` into this same file, and a const over the whole store
  // would tear down and restart the entire stack on every one of those writes.
  const store = await storeJson
    .read((s) => ({
      externalLibraries: s.externalLibraries,
      exposedSources: s.exposedSources,
      primaryUrl: s.primaryUrl,
      smtp: s.smtp,
    }))
    .const(effects)
  if (!store) throw new Error('store.json not found')

  const libs = store.externalLibraries || []
  const exposed = store.exposedSources
  const primaryUrl = store.primaryUrl
  const smtpStore = store.smtp

  let smtpCreds: {
    host: string
    port: number
    from: string
    username: string
    password: string | null | undefined
    secure: boolean
  } | null = null
  if (smtpStore && smtpStore.selection === 'system') {
    const sys = await sdk.getSystemSmtp(effects).const()
    if (sys)
      smtpCreds = {
        host: sys.host,
        port: sys.port,
        from: smtpStore.value.customFrom || sys.from,
        username: sys.username,
        password: sys.password,
        secure: sys.security === 'tls',
      }
  } else if (smtpStore && smtpStore.selection === 'custom') {
    const p = smtpStore.value.provider.value
    smtpCreds = {
      host: p.host,
      port: Number(p.security.value.port),
      from: p.from,
      username: p.username,
      password: p.password,
      secure: p.security.selection === 'tls',
    }
  }

  // Build server mounts: always mount upload volume, then mount each exposed
  // source's volume read-only. Exposure is driven by the Connect Photo Sources
  // action OR any configured library (see `sourceExposed`) — so mounting is no
  // longer a side effect of configuring a library: a source can be exposed for
  // self-service in the Immich admin UI with no StartOS library at all.
  let serverMounts = sdk.Mounts.of().mountVolume({
    volumeId: 'upload',
    mountpoint: '/usr/src/app/upload',
    readonly: false,
    subpath: null,
  })

  if (sourceExposed('filebrowser', exposed, libs)) {
    serverMounts = serverMounts.mountDependency<typeof filebrowserManifest>({
      dependencyId: 'filebrowser',
      volumeId: 'data',
      subpath: null,
      mountpoint: FILEBROWSER_MOUNTPOINT,
      readonly: true,
    })
  }
  if (sourceExposed('nextcloud', exposed, libs)) {
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
      // Ensure a long-lived Immich API key exists (minting/repairing it on
      // each startup once an admin exists). The Manage External Libraries
      // action uses it to call the Immich API with a plain fetch — crucially in
      // the owner dropdown, which is built at form-render time and fetches the
      // user list live, so newly added users appear without a restart.
      .addOneshot('ensure-api-key', {
        subcontainer: serverSub,
        exec: {
          fn: async () => {
            await ensureApiKey(effects, postgresSub)
            return null
          },
        },
        requires: ['immich-server'],
      })
      // Cache the Nextcloud usernames (folders under /mnt/nextcloud/data that
      // contain a `files` dir) so the Manage External Libraries Nextcloud-user
      // dropdown can read them cheaply at form-render time — the action context
      // can't see the mount, only the server container can.
      //
      // Ordered after ensure-api-key because both merge into store.json, and
      // concurrent read-modify-write merges can drop each other's key.
      .addOneshot('cache-nextcloud-users', {
        subcontainer: serverSub,
        exec: {
          fn: async () => {
            if (!sourceExposed('nextcloud', exposed, libs)) {
              await storeJson.merge(effects, { nextcloudUsers: [] })
              return null
            }
            const res = await serverSub.exec([
              'sh',
              '-c',
              'for d in /mnt/nextcloud/data/*/files; do [ -d "$d" ] && basename "$(dirname "$d")"; done',
            ])
            const users = res.stdout
              .toString()
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
            await storeJson.merge(effects, { nextcloudUsers: users })
            return null
          },
        },
        requires: ['immich-server', 'ensure-api-key'],
      })
      // External libraries are NOT reconciled here. They live in Immich's DB
      // (which persists across restarts and is captured in backups) and are
      // managed live, by id, through the Manage External Libraries action. The
      // old per-restart re-apply correlated by name, which duplicated libraries
      // on rename and orphaned them on removal — see actions/externalLibraries.ts.
      //
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
                        secure: smtpCreds.secure,
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
