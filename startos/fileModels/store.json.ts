import { FileHelper, smtpShape, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  postgresPassword: z.string().optional().catch(undefined),
  primaryUrl: z.string().optional().catch(undefined),
  smtp: smtpShape,
  // Which dependency volumes are mounted read-only into Immich so its admin can
  // build external libraries against them (in this UI or Immich's own). Set by
  // the Connect Photo Sources action. Independent of `externalLibraries`: a
  // source can be exposed with no library configured. See `sourceExposed`.
  exposedSources: z
    .object({
      filebrowser: z.boolean(),
      nextcloud: z.boolean(),
    })
    .optional()
    .catch(undefined),
  // A long-lived Immich API key (named 'startos-managed') minted and validated
  // by the ensure-api-key oneshot. Lets the Manage External Libraries action —
  // including the owner dropdown built at form-render time — call the Immich API
  // with a plain fetch, no per-call DB container. Less sensitive than the
  // postgres password already stored here.
  apiKey: z.string().optional().catch(undefined),
  // Nextcloud usernames discovered by listing /mnt/nextcloud/data/*/files on
  // startup (the cache-nextcloud-users oneshot). Powers the Nextcloud-user
  // dropdown, which can't read the mount at form-render time. Stale-tolerant:
  // the dropdown also unions in users referenced by existing libraries.
  nextcloudUsers: z.array(z.string()).optional().catch(undefined),
  externalLibraries: z
    .array(
      z.object({
        name: z.string(),
        source: z.discriminatedUnion('selection', [
          z.object({
            selection: z.literal('nextcloud'),
            value: z.object({
              user: z.string(),
              path: z.string(),
            }),
          }),
          z.object({
            selection: z.literal('filebrowser'),
            value: z.object({
              path: z.string(),
            }),
          }),
        ]),
      }),
    )
    .optional()
    .catch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: './store.json' },
  shape,
)
