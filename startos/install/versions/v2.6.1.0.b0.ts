import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_6_1_0_b0 = VersionInfo.of({
  version: '2.6.1:0-beta.0',
  releaseNotes: {
    en_US: 'Update Immich to v2.6.1',
    es_ES: 'Actualización de Immich a v2.6.1',
    de_DE: 'Update von Immich auf v2.6.1',
    pl_PL: 'Aktualizacja Immich do v2.6.1',
    fr_FR: 'Mise à jour de Immich vers v2.6.1',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
