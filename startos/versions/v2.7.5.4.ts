import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v_2_7_5_4 = VersionInfo.of({
  version: '2.7.5:4',
  releaseNotes: {
    en_US: 'Fixes a bug that caused database backups to be empty.',
    es_ES: 'Corrige un error que provocaba que las copias de seguridad de la base de datos estuvieran vacías.',
    de_DE: 'Behebt einen Fehler, durch den Datenbank-Backups leer waren.',
    pl_PL: 'Naprawia błąd powodujący, że kopie zapasowe bazy danych były puste.',
    fr_FR: 'Corrige un bug qui rendait les sauvegardes de base de données vides.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
