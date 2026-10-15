import { randomUUID } from 'crypto'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  dropDependentKeys,
  insertDependentKey,
  listImmichUsers,
  withDb,
} from '../utils'

const { InputSpec, Value, Variants } = sdk

export const approveAccess = sdk.Action.withInput(
  'approve-access',

  async () => ({
    name: i18n('Approve Access'),
    description: i18n(
      "Let a service read one Immich account's library with the permissions it asked for, or deny its request",
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'hidden',
  }),

  InputSpec.of({
    request: Value.dynamicSelect(async () => {
      const pending = (
        (await storeJson.read((s) => s.dependentKeys).once()) ?? []
      ).filter((k) => !k.keyId)
      return {
        name: i18n('Request'),
        description: i18n(
          'The service asking, and what it would be allowed to read',
        ),
        values: Object.fromEntries(
          pending.map((k) => [
            k.keyHash,
            `${k.packageId}: ${k.permissions.join(', ')}`,
          ]),
        ),
        default: null,
      }
    }),
    decision: Value.union({
      name: i18n('Decision'),
      default: 'approve',
      variants: Variants.of({
        approve: {
          name: i18n('Approve'),
          spec: InputSpec.of({
            user: Value.dynamicSelect(async ({ effects }) => ({
              name: i18n('Immich Account'),
              description: i18n(
                'The account whose library the service can read',
              ),
              values: Object.fromEntries(
                (await withDb(effects, listImmichUsers)).map((u) => [
                  u.id,
                  u.name ? `${u.name} (${u.email})` : u.email,
                ]),
              ),
              default: null,
            })),
          }),
        },
        deny: { name: i18n('Deny'), spec: InputSpec.of({}) },
      }),
    }),
  }),

  async () => null,

  async ({ effects, input }) => {
    const request = (
      (await storeJson.read((s) => s.dependentKeys).once()) ?? []
    ).find((k) => k.keyHash === input.request && !k.keyId)
    if (!request) throw new Error(i18n('That request is no longer pending'))

    await withDb(effects, async (pgSub, pgEnv) => {
      if (input.decision.selection === 'deny') {
        await dropDependentKeys(
          effects,
          pgSub,
          (k) => k.keyHash === request.keyHash,
          pgEnv,
        )
        return
      }

      const userId = input.decision.value.user
      const keyId = randomUUID()
      // Recorded first, so a key never exists without a service owning it.
      const setGrant = (grant: {
        userId: string | null
        keyId: string | null
      }) =>
        storeJson.update(
          effects,
          (s) =>
            s && {
              ...s,
              dependentKeys: s.dependentKeys.map((k) =>
                k.keyHash === request.keyHash ? { ...k, ...grant } : k,
              ),
            },
        )
      await setGrant({ userId, keyId })
      let inserted = false
      try {
        inserted = await insertDependentKey(
          pgSub,
          { ...request, userId, keyId },
          pgEnv,
        )
      } finally {
        if (!inserted) await setGrant({ userId: null, keyId: null })
      }
      if (!inserted) {
        throw new Error(
          i18n('No Immich account has the ID ${userId}, or it was deleted', {
            userId,
          }),
        )
      }

      await dropDependentKeys(
        effects,
        pgSub,
        (k) =>
          k.packageId === request.packageId &&
          k.userId === userId &&
          !!k.keyId &&
          k.keyHash !== request.keyHash,
        pgEnv,
      )
    })

    return null
  },
)
