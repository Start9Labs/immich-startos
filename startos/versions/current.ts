import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.4.1:1',
  releaseNotes: {
    en_US: `Immich's database dump setting now stays the way you set it across restarts, updates and StartOS backups.`,
    es_ES: `La configuración de volcados de la base de datos de Immich ahora se mantiene como la dejó tras reinicios, actualizaciones y copias de seguridad de StartOS.`,
    de_DE: `Die Einstellung für Datenbank-Dumps von Immich bleibt jetzt bei Neustarts, Updates und StartOS-Backups so, wie Sie sie festgelegt haben.`,
    pl_PL: `Ustawienie zrzutów bazy danych Immich pozostaje teraz takie, jak je ustawiono, po ponownym uruchomieniu, aktualizacji i kopii zapasowej StartOS.`,
    fr_FR: `Le réglage des sauvegardes de la base de données d'Immich reste désormais tel que vous l'avez choisi après un redémarrage, une mise à jour ou une sauvegarde StartOS.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
