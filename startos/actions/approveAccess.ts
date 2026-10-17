import { T } from '@start9labs/start-sdk'
import { randomUUID } from 'crypto'
import { DependentKey, storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  accessRequestId,
  dropDependentKeys,
  insertDependentKey,
  listImmichUsers,
  requesterName,
  withDb,
  withDependentKeyLock,
} from '../utils'

const { InputSpec, Value, Variants } = sdk

async function accountOptions(effects: T.Effects) {
  const keys = (
    (await storeJson.read((s) => s.dependentKeys).once()) ?? []
  ).filter((k) => k.keyId)
  return (await withDb(effects, listImmichUsers)).map((u) => {
    const account = u.name ? `${u.name} (${u.email})` : u.email
    const holders = keys.filter((k) => k.userId === u.id).map(requesterName)
    return [
      u.id,
      holders.length
        ? `${account} · ${i18n('has a key from ${services}', { services: holders.join(', ') })}`
        : account,
    ] as const
  })
}

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

  async ({ caller }) => {
    if (caller !== null) {
      throw new Error(i18n('Only the user can approve access'))
    }
    return InputSpec.of({
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
              accessRequestId(k),
              `${requesterName(k)}: ${k.permissions.join(', ')}`,
            ]),
          ),
          default: null,
        }
      }),
      decision: Value.union({
        name: i18n('Decision'),
        description: i18n(
          'If the chosen account already has a key from this service, approving replaces it',
        ),
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
                values: Object.fromEntries(await accountOptions(effects)),
                default: null,
              })),
            }),
          },
          deny: { name: i18n('Deny'), spec: InputSpec.of({}) },
        }),
      }),
    })
  },

  async () => null,

  async ({ effects, input, caller }) => {
    if (caller !== null) {
      throw new Error(i18n('Only the user can approve access'))
    }
    return withDependentKeyLock(async () => {
      const request = (
        (await storeJson.read((s) => s.dependentKeys).once()) ?? []
      ).find((k) => accessRequestId(k) === input.request && !k.keyId)
      if (!request) throw new Error(i18n('That request is no longer pending'))

      const replaced = await withDb(effects, async (pgSub, pgEnv) => {
        if (input.decision.selection === 'deny') {
          await dropDependentKeys(
            effects,
            pgSub,
            (k) => accessRequestId(k) === input.request,
            pgEnv,
          )
          return false
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
                  accessRequestId(k) === input.request ? { ...k, ...grant } : k,
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

        const replaces = (k: DependentKey) =>
          k.packageId === request.packageId &&
          k.userId === userId &&
          !!k.keyId &&
          k.keyHash !== request.keyHash
        const replacing = (
          (await storeJson.read((s) => s.dependentKeys).once()) ?? []
        ).some(replaces)
        await dropDependentKeys(effects, pgSub, replaces, pgEnv)
        return replacing
      })

      return replaced
        ? {
            version: '1',
            title: i18n('Access Approved'),
            message: i18n(
              'This replaced the key ${packageId} already had in this account.',
              { packageId: request.packageId },
            ),
            result: null,
          }
        : null
    })
  },
)
