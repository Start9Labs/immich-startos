import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.6:1',
  releaseNotes: {
    en_US:
      "Immich now sees only Nextcloud's user files, not its configuration.",
    es_ES:
      'Immich ahora solo ve los archivos de usuario de Nextcloud, no su configuración.',
    de_DE:
      'Immich sieht jetzt nur noch die Benutzerdateien von Nextcloud, nicht dessen Konfiguration.',
    pl_PL:
      'Immich widzi teraz tylko pliki użytkowników Nextcloud, a nie jego konfigurację.',
    fr_FR:
      'Immich ne voit désormais que les fichiers utilisateur de Nextcloud, et non sa configuration.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
