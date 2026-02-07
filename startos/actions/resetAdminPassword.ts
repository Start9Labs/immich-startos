import { sdk } from '../sdk'
import {
  getRandomPassword,
  getPostgresEnv,
  dbMounts,
  withTempApiKey,
  immichApi,
} from '../utils'

export const resetAdminPassword = sdk.Action.withoutInput(
  'reset-admin-password',

  async ({ effects }) => ({
    name: 'Reset Admin Password',
    description:
      'Reset the admin password to a new randomly generated password',
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
      title: 'Password Reset',
      message: 'The admin password has been reset',
      result: {
        type: 'single',
        name: 'New Password',
        description: null,
        value: newPassword,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
