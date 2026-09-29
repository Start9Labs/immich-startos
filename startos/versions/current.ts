import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.4:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.2.4. Fixes a memory leak and a blank mobile sync status page when the counts query fails.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.2.4)`,
    es_ES: `Actualiza Immich a 3.2.4. Corrige una fuga de memoria y la página en blanco del estado de sincronización móvil cuando falla la consulta de recuentos.

[Notas completas de la versión](https://github.com/immich-app/immich/releases/tag/v3.2.4)`,
    de_DE: `Aktualisiert Immich auf 3.2.4. Behebt ein Speicherleck und eine leere Statusseite für die mobile Synchronisierung, wenn die Abfrage der Anzahl fehlschlägt.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.2.4)`,
    pl_PL: `Aktualizuje Immich do wersji 3.2.4. Naprawia wyciek pamięci i pustą stronę stanu synchronizacji mobilnej, gdy zapytanie o liczby zakończy się niepowodzeniem.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.2.4)`,
    fr_FR: `Met à jour Immich vers la version 3.2.4. Corrige une fuite de mémoire et l'affichage d'une page vide pour l'état de synchronisation mobile lorsque la requête des compteurs échoue.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.2.4)`,
  },
  migrations: {},
})
