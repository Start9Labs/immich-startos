import { sdk } from '../sdk'
import {
  createUserApiKey,
  dbMounts,
  dependentKeyPermissions,
  getPostgresEnv,
} from '../utils'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

export const createApiKey = sdk.Action.withInput(
  'create-api-key',

  async () => ({
    name: i18n('Create API Key'),
    description: i18n(
      'Create an API key for an Immich user that can only view their library and edit the details of their photos and videos, for a service that connects to their account',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'hidden',
    access: 'dependent',
  }),

  InputSpec.of({
    userId: Value.text({
      name: i18n('Immich User ID'),
      required: true,
      default: null,
    }),
    name: Value.text({
      name: i18n('Name'),
      required: true,
      default: null,
    }),
    permissions: Value.multiselect({
      name: i18n('Permissions'),
      default: [],
      values: dependentKeyPermissions,
    }),
  }),

  async () => null,

  async ({ effects, input }) => {
    if (!input.name.trim()) throw new Error(i18n('Enter a name for the key'))
    if (!input.permissions.length) {
      throw new Error(i18n('Choose at least one permission'))
    }

    const postgresEnv = await getPostgresEnv(effects)
    const key = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'postgres' },
      dbMounts,
      'create-api-key-pg',
      (pgSub) => createUserApiKey(pgSub, input, postgresEnv),
    )
    if (!key) {
      throw new Error(
        i18n('No Immich user has the ID ${userId}, or that user was deleted', {
          userId: input.userId,
        }),
      )
    }

    return {
      version: '1',
      title: i18n('API Key Created'),
      message: null,
      // Dependents read these members by name, so the names are not translated.
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: 'secret',
            description: null,
            value: key.secret,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: 'id',
            description: null,
            value: key.id,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
