import { sdk } from '../sdk'
import { dbMounts, deleteUserApiKey, getPostgresEnv } from '../utils'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

export const deleteApiKey = sdk.Action.withInput(
  'delete-api-key',

  async () => ({
    name: i18n('Delete API Key'),
    description: i18n(
      "Delete an Immich user's API key that can only view their library and edit the details of their photos and videos, for a service that disconnects from their account",
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
    keyId: Value.text({
      name: i18n('API Key ID'),
      required: true,
      default: null,
    }),
  }),

  async () => null,

  async ({ effects, input }) => {
    // A malformed id would otherwise pass as a key that is already gone.
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        input.keyId,
      )
    ) {
      throw new Error(
        i18n('Not an API key ID: ${keyId}', { keyId: input.keyId }),
      )
    }

    const postgresEnv = await getPostgresEnv(effects)
    const deleted = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'postgres' },
      dbMounts,
      'delete-api-key-pg',
      (pgSub) => deleteUserApiKey(pgSub, input, postgresEnv),
    )
    if (!deleted) {
      throw new Error(
        i18n(
          'Key ${keyId} belongs to another Immich user, or has permissions a dependent service cannot request',
          { keyId: input.keyId },
        ),
      )
    }

    return null
  },
)
