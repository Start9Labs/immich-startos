import { FileHelper, smtpShape, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  postgresPassword: z.string().optional().catch(undefined),
  primaryUrl: z.string().optional().catch(undefined),
  smtp: smtpShape,
  // Sole authority for which dependency volumes main mounts.
  exposedSources: z
    .object({
      filebrowser: z.boolean(),
      nextcloud: z.boolean(),
    })
    .optional()
    .catch(undefined),
  // The 'startos-managed' Immich API key, in plaintext — Immich stores only its hash.
  apiKey: z.string().optional().catch(undefined),
  nextcloudUsers: z.array(z.string()).optional().catch(undefined),
  // Superseded by `exposedSources`; read only by 3.1.0:1's migration.
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
