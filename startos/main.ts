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
  withAdminApiKey,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Immich'))

  const postgresEnv = await getPostgresEnv(effects)

  // Projected, not whole-store: the oneshots below write `apiKey` and
  // `nextcloudUsers`, and a const spanning those restarts the stack on each.
  // A projection, never the whole store: the ensure-api-key and
  // cache-nextcloud-users oneshots write apiKey and nextcloudUsers, so a
  // .const() spanning those keys would restart the whole stack on each of
  // their own writes. Add a key here only if changing it should restart Immich.
  const store = await storeJson
    .read((s) => ({
      exposedSources: s.exposedSources,
      primaryUrl: s.primaryUrl,
      smtp: s.smtp,
    }))
    .const(effects)
  if (!store) throw new Error('store.json not found')

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

  let serverMounts = sdk.Mounts.of().mountVolume({
    volumeId: 'upload',
    mountpoint: '/usr/src/app/upload',
    readonly: false,
    subpath: null,
  })

  if (exposed?.filebrowser) {
    serverMounts = serverMounts.mountDependency<typeof filebrowserManifest>({
      dependencyId: 'filebrowser',
      volumeId: 'data',
      subpath: null,
      mountpoint: FILEBROWSER_MOUNTPOINT,
      readonly: true,
    })
  }
  if (exposed?.nextcloud) {
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
      // Writes system_metadata[system-config] directly rather than through
      // Immich's API, which is admin-key-gated and so unusable before sign-up.
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
      // The action context can't see the mount, so the usernames are cached here
      // for its dropdown. Ordered after ensure-api-key: concurrent merges into
      // store.json can drop each other's key.
      .addOneshot('cache-nextcloud-users', {
        subcontainer: serverSub,
        exec: {
          fn: async () => {
            if (!exposed?.nextcloud) {
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
      // A "disabled" SMTP selection deliberately leaves Immich's existing
      // credentials in place rather than clearing them.
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
