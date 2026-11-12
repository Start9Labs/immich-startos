import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.4.1:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.4.1. Improves shared-link performance and fixes recognition of .hif images, job queue status, and workflow field defaults.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.4.1)`,
    es_ES: `Actualiza Immich a 3.4.1. Mejora el rendimiento de los enlaces compartidos y corrige el reconocimiento de imágenes .hif, el estado de la cola de trabajos y los valores predeterminados de los campos de flujos de trabajo.

[Notas completas de la versión](https://github.com/immich-app/immich/releases/tag/v3.4.1)`,
    de_DE: `Aktualisiert Immich auf 3.4.1. Verbessert die Leistung von Freigabelinks und behebt Probleme bei der Erkennung von .hif-Bildern, beim Status der Auftragswarteschlange und bei Standardwerten von Workflow-Feldern.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.4.1)`,
    pl_PL: `Aktualizuje Immich do wersji 3.4.1. Poprawia wydajność linków udostępniania i naprawia rozpoznawanie obrazów .hif, stan kolejki zadań oraz domyślne wartości pól przepływów pracy.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.4.1)`,
    fr_FR: `Met à jour Immich vers la version 3.4.1. Améliore les performances des liens de partage et corrige la reconnaissance des images .hif, l'état de la file de tâches et les valeurs par défaut des champs des flux de travail.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.4.1)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
