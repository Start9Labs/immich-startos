import { sdk } from '../sdk'
import {
  buildCoreDaemons,
  createCoreSubs,
  enforceSystemConfigDefaults,
  getPostgresEnv,
  getRandomPassword,
  serverMounts,
} from '../utils'
import { storeJson } from '../fileModels/store.json'

export const initializeImmich = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') {
    await storeJson.merge(effects, {})
    return
  }

  await storeJson.merge(effects, {
    postgresPassword: getRandomPassword(),
  })

  // Spin up the full Immich stack during install so that Immich runs its
  // database migrations (creating `system_metadata` and the rest of the
  // schema) before our first `main` execution. This lets us write the
  // StartOS-enforced defaults into the DB before Immich reads config for
  // the first time in user-facing main, so the suppressed settings take
  // effect immediately on first boot rather than on the second start.
  const subs = await createCoreSubs(effects, serverMounts)
  const postgresEnv = await getPostgresEnv(effects)

  await buildCoreDaemons(effects, subs, postgresEnv, null)
    .addOneshot('enforce-defaults', {
      subcontainer: subs.postgresSub,
      exec: {
        fn: async () => {
          await enforceSystemConfigDefaults(subs.postgresSub)
          return null
        },
      },
      requires: ['immich-server'],
    })
    .runUntilSuccess(600_000)
})
