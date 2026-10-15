import { FileHelper, smtpShape, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const dependentKey = z.looseObject({
  packageId: z.string(),
  keyHash: z.string(),
  permissions: z.array(z.string()),
  userId: z.string().nullable(),
  keyId: z.string().nullable(),
})
export type DependentKey = z.infer<typeof dependentKey>

const shape = z.looseObject({
  postgresPassword: z.string().optional().catch(undefined),
  primaryUrl: z.string().optional().catch(undefined),
  smtp: smtpShape,
  // Sole authority for which dependency volumes main mounts. externalLibraries
  // is superseded and read only by the 3.1.0:1 migration — never a source of truth.
  exposedSources: z
    .looseObject({
      nextexplorer: z.boolean().catch(false),
      filebrowser: z.boolean(),
      nextcloud: z.boolean(),
    })
    .optional()
    .catch(undefined),
  // The 'startos-managed' Immich API key, in plaintext — Immich stores only its hash.
  apiKey: z.string().optional().catch(undefined),
  nextcloudUsers: z.array(z.string()).optional().catch(undefined),
  // A null keyId is a request the user has not yet approved.
  dependentKeys: z.array(dependentKey).catch([]),
  // Superseded by `exposedSources`; read only by 3.1.0:1's migration.
  externalLibraries: z
    .array(
      z.looseObject({
        name: z.string(),
        source: z.discriminatedUnion('selection', [
          z.looseObject({
            selection: z.literal('nextcloud'),
            value: z.looseObject({
              user: z.string(),
              path: z.string(),
            }),
          }),
          z.looseObject({
            selection: z.literal('filebrowser'),
            value: z.looseObject({
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
