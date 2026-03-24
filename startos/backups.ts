import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'
import { POSTGRES_DB, POSTGRES_PATH, POSTGRES_USER } from './utils'

const PGDATA = POSTGRES_PATH

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withPgDump({
    imageId: 'postgres',
    dbVolume: 'db',
    pgdata: PGDATA,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: async () => {
      const password = await storeJson.read((s) => s.postgresPassword).once()
      if (!password) throw new Error('No postgresPassword found in store.json')
      return password
    },
    initdbArgs: ['--data-checksums'],
  })
    .addVolume('startos')
    .addVolume('upload'),
)
