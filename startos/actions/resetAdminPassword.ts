import { sdk } from '../sdk'
import {
  getRandomPassword,
  getPostgresEnv,
  dbMounts,
  withTempApiKey,
  immichApi,
} from '../utils'
import { i18n } from '../i18n'

export const resetAdminPassword = sdk.Action.withoutInput(
  'reset-admin-password',

  async ({ effects }) => ({
    name: i18n('Reset Admin Password'),
    description: i18n(
      'Reset the admin password to a new randomly generated password',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const newPassword = getRandomPassword()
    const postgresEnv = await getPostgresEnv(effects)

    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'postgres' },
      dbMounts,
      'reset-pw-pg',
      async (pgSub) => {
        await withTempApiKey(
          pgSub,
          'startos-reset-pw',
          async ({ token, adminId }) => {
            await immichApi(`/admin/users/${adminId}`, token, {
              method: 'PUT',
              body: { password: newPassword },
            })
          },
          postgresEnv,
        )
      },
    )

    return {
      version: '1',
      title: i18n('Password Reset'),
      message: i18n('The admin password has been reset'),
      result: {
        type: 'single',
        name: i18n('New Password'),
        description: null,
        value: newPassword,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
