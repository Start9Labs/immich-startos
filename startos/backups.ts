import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'
import { POSTGRES_DB, POSTGRES_PATH, POSTGRES_USER } from './utils'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withPgDump({
    imageId: 'postgres',
    dbVolume: 'db',
    mountpoint: POSTGRES_PATH,
    pgdataPath: '/data',
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: async () => {
      const password = await storeJson.read((s) => s.postgresPassword).once()
      if (!password) throw new Error('No postgresPassword found in store.json')
      return password
    },
    initdbArgs: ['--data-checksums'],
    pgOptions: '-c shared_preload_libraries=vchord',
  })
    .addVolume('startos')
    .addVolume('upload'),
)
