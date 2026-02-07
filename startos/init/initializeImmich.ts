import { sdk } from '../sdk'
import { getRandomPassword, getPostgresSub, getPostgresEnv } from '../utils'
import { storeJson } from '../fileModels/store.json'

export const initializeImmich = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.write(effects, {
    postgresPassword: getRandomPassword(),
    smtp: { selection: 'disabled', value: {} },
  })

  const postgresSub = await getPostgresSub(effects)
  const postgresEnv = await getPostgresEnv(effects)

  await sdk.Daemons.of(effects)
    .addDaemon('postgres', {
      subcontainer: postgresSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: postgresEnv,
      },
      ready: {
        display: null,
        fn: async () => {
          const { exitCode } = await postgresSub.exec([
            'pg_isready',
            '-U',
            postgresEnv.POSTGRES_USER,
            '-h',
            'localhost',
          ])
          if (exitCode !== 0) {
            return { result: 'loading', message: null }
          }
          return { result: 'success', message: null }
        },
      },
      requires: [],
    })
    .runUntilSuccess(600_000)
})
