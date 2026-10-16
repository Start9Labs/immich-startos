import { z } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { dropDependentKeys, withDb, withDependentKeyLock } from '../utils'

const { InputSpec, Value } = sdk

export const revokeAccess = sdk.Action.withInput(
  'revoke-access',

  async () => ({
    name: i18n('Revoke Access'),
    description: i18n(
      "Delete the requesting service's API key, or withdraw its pending request",
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'hidden',
    access: 'dependent',
  }),

  InputSpec.of({
    keyHash: Value.hidden(z.string().nullish()),
  }),

  async () => null,

  async ({ effects, input, caller }) => {
    if (!caller) throw new Error(i18n('Only a service can revoke its access'))

    await withDependentKeyLock(() =>
      withDb(effects, (pgSub, pgEnv) =>
        dropDependentKeys(
          effects,
          pgSub,
          (k) =>
            k.packageId === caller &&
            (!input.keyHash || k.keyHash === input.keyHash),
          pgEnv,
        ),
      ),
    )

    return null
  },
)
