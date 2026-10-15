import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { accessTaskId, dependentKeyPermissions } from '../utils'
import { approveAccess } from './approveAccess'

const { InputSpec, Value } = sdk

export const requestAccess = sdk.Action.withInput(
  'request-access',

  async () => ({
    name: i18n('Request Access'),
    description: i18n(
      'Ask to read one Immich account with an API key the requesting service generated',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
    access: 'dependent',
  }),

  InputSpec.of({
    keyHash: Value.text({
      name: i18n('Key Hash'),
      description: i18n('SHA-256 of the API key, in lowercase hex'),
      required: true,
      default: null,
      patterns: [
        {
          regex: '^[0-9a-f]{64}$',
          description: i18n('Must be 64 lowercase hex characters'),
        },
      ],
    }),
    permissions: Value.multiselect({
      name: i18n('Permissions'),
      default: [],
      values: dependentKeyPermissions,
    }),
  }),

  async () => null,

  async ({ effects, input, caller }) => {
    if (!caller) throw new Error(i18n('Only a service can request access'))
    if (!input.permissions.length) {
      throw new Error(i18n('Choose at least one permission'))
    }

    const existing = (
      (await storeJson.read((s) => s.dependentKeys).once()) ?? []
    ).find((k) => k.keyHash === input.keyHash)
    if (existing) {
      if (
        existing.packageId !== caller ||
        existing.permissions.length !== input.permissions.length ||
        !input.permissions.every((p) => existing.permissions.includes(p))
      ) {
        throw new Error(i18n('This key was already requested'))
      }
      return null
    }

    await storeJson.update(
      effects,
      (s) =>
        s && {
          ...s,
          dependentKeys: [
            ...s.dependentKeys,
            {
              packageId: caller,
              keyHash: input.keyHash,
              permissions: input.permissions,
              userId: null,
              keyId: null,
            },
          ],
        },
    )
    await sdk.action.createOwnTask(effects, approveAccess, 'important', {
      reason: i18n('${packageId} is asking to read an Immich account', {
        packageId: caller,
      }),
      replayId: accessTaskId(input.keyHash),
      when: { condition: 'input-not-matches', once: true },
      input: {
        kind: 'partial',
        accept: [{ request: input.keyHash }],
        set: { request: input.keyHash },
      },
    })

    return null
  },
)
