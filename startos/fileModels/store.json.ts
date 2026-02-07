import { matches, FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const { object, string, arrayOf, oneOf, literal } = matches

const shape = object({
  postgresPassword: string.optional().onMismatch(undefined),
  smtp: sdk.inputSpecConstants.smtpInputSpec.validator.onMismatch({
    selection: 'disabled',
    value: {},
  }),
  externalLibraries: arrayOf(
    object({
      name: string,
      source: oneOf(
        object({
          selection: literal('nextcloud'),
          value: object({
            user: string,
            path: string,
          }),
        }),
        object({
          selection: literal('filebrowser'),
          value: object({
            path: string,
          }),
        }),
      ),
    }),
  )
    .optional()
    .onMismatch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: './store.json' },
  shape,
)
