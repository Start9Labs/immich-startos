import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  postgresPassword: z.string().optional().catch(undefined),
  smtp: sdk.inputSpecConstants.smtpInputSpec.validator.catch({
    selection: 'disabled' as const,
    value: {},
  }),
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
