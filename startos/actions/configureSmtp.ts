import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

const { InputSpec } = sdk

const inputSpec = InputSpec.of({
  smtp: sdk.inputSpecConstants.smtpInputSpec,
})

export const configureSmtp = sdk.Action.withInput(
  'configure-smtp',

  async ({ effects }) => ({
    name: i18n('Configure SMTP'),
    description: i18n(
      'Use system or custom SMTP credentials for Immich email notifications',
    ),
    warning: i18n('SMTP settings will be applied on next restart'),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const smtp = await storeJson.read((s) => s.smtp).const(effects)
    if (!smtp || smtp.selection === 'disabled') return {}
    return { smtp } as any
  },

  async ({ effects, input }) =>
    storeJson.merge(effects, { smtp: input.smtp }),
)
