import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.2:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.2.2. Reassigning faces now skips faces belonging to other users.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
    es_ES: `Actualiza Immich a 3.2.2. La reasignación de rostros ahora omite los rostros que pertenecen a otros usuarios.

[Notas completas de la versión](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
    de_DE: `Aktualisiert Immich auf 3.2.2. Beim Neuzuweisen von Gesichtern werden nun Gesichter anderer Benutzer übersprungen.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
    pl_PL: `Aktualizuje Immich do wersji 3.2.2. Podczas ponownego przypisywania twarzy pomijane są teraz twarze należące do innych użytkowników.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
    fr_FR: `Met à jour Immich vers la version 3.2.2. La réattribution des visages ignore désormais ceux appartenant à d'autres utilisateurs.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
  },
  migrations: {},
})
