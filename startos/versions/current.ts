import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.2:1',
  releaseNotes: {
    en_US: `NextExplorer, the recommended file server, can now be connected as a photo source and used for external libraries, mounted read-only at /mnt/nextexplorer. Turn it on under **Connect Photo Sources**.

Updated Immich to 3.2.2. Reassigning faces now skips faces belonging to other users.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
    es_ES: `NextExplorer, el servidor de archivos recomendado, ahora puede conectarse como fuente de fotos y usarse para bibliotecas externas, montado en solo lectura en /mnt/nextexplorer. Actívalo en **Conectar fuentes de fotos**.

Actualiza Immich a 3.2.2. La reasignación de rostros ahora omite los rostros que pertenecen a otros usuarios.

[Notas completas de la versión](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
    de_DE: `NextExplorer, der empfohlene Dateiserver, kann jetzt als Fotoquelle verbunden und für externe Bibliotheken genutzt werden, schreibgeschützt eingebunden unter /mnt/nextexplorer. Aktivieren Sie ihn unter **Fotoquellen verbinden**.

Aktualisiert Immich auf 3.2.2. Beim Neuzuweisen von Gesichtern werden nun Gesichter anderer Benutzer übersprungen.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
    pl_PL: `NextExplorer, zalecany serwer plików, można teraz podłączyć jako źródło zdjęć i używać w bibliotekach zewnętrznych, zamontowany tylko do odczytu w /mnt/nextexplorer. Włącz go w **Połącz źródła zdjęć**.

Aktualizuje Immich do wersji 3.2.2. Podczas ponownego przypisywania twarzy pomijane są teraz twarze należące do innych użytkowników.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
    fr_FR: `NextExplorer, le serveur de fichiers recommandé, peut désormais être connecté comme source de photos et utilisé pour les bibliothèques externes, monté en lecture seule sur /mnt/nextexplorer. Activez-le dans **Connecter des sources de photos**.

Met à jour Immich vers la version 3.2.2. La réattribution des visages ignore désormais ceux appartenant à d'autres utilisateurs.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.2.2)`,
  },
  migrations: {},
})
