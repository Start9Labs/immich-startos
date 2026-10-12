import { sdk } from '../sdk'
import { dbMounts, getPostgresEnv, listImmichUsers } from '../utils'
import { i18n } from '../i18n'

export const listUsers = sdk.Action.withoutInput(
  'list-users',

  async () => ({
    name: i18n('List Users'),
    description: i18n(
      'List Immich users and their IDs, for a service that connects to an Immich account',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'hidden',
    access: 'dependent',
  }),

  async ({ effects }) => {
    const postgresEnv = await getPostgresEnv(effects)
    const users = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'postgres' },
      dbMounts,
      'list-users-pg',
      (pgSub) => listImmichUsers(pgSub, postgresEnv),
    )

    return {
      version: '1',
      title: i18n('Immich Users'),
      message: null,
      result: {
        type: 'group',
        value: users.map((u) => ({
          type: 'single',
          name: u.email,
          description: u.name || null,
          value: u.id,
          masked: false,
          copyable: true,
          qr: false,
          launchable: false,
        })),
      },
    }
  },
)
