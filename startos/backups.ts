import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'
import { POSTGRES_DB, POSTGRES_PATH, POSTGRES_USER } from './utils'

const PGDATA = `${POSTGRES_PATH}/data`

// TODO: Re-enable withPgDump once the SDK supports a `pgOptions` parameter.
// The immich postgres image requires shared_preload_libraries=vchord, which
// pg_ctl doesn't load without explicit config, causing pg_dump to fail.
//
// export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
//   sdk.Backups.withPgDump({
//     imageId: 'postgres',
//     dbVolume: 'db',
//     pgdata: PGDATA,
//     database: POSTGRES_DB,
//     user: POSTGRES_USER,
//     password: async () => {
//       const password = await storeJson.read((s) => s.postgresPassword).once()
//       if (!password) throw new Error('No postgresPassword found in store.json')
//       return password
//     },
//     initdbArgs: ['--data-checksums'],
//   })
//     .addVolume('startos')
//     .addVolume('upload'),
// )

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('startos', 'db', 'upload'),
)
