import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.6:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.3.6. Disables anonymous machine-learning telemetry sent to Microsoft.

Requires StartOS 0.4.1 or later.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.3.6)`,
    es_ES: `Actualiza Immich a 3.3.6. Desactiva el envío a Microsoft de telemetría anónima del aprendizaje automático.

Requiere StartOS 0.4.1 o posterior.

[Notas completas de la versión](https://github.com/immich-app/immich/releases/tag/v3.3.6)`,
    de_DE: `Aktualisiert Immich auf 3.3.6. Deaktiviert die Übermittlung anonymer Telemetriedaten des maschinellen Lernens an Microsoft.

Erfordert StartOS 0.4.1 oder neuer.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.3.6)`,
    pl_PL: `Aktualizuje Immich do wersji 3.3.6. Wyłącza wysyłanie do Microsoftu anonimowych danych telemetrycznych uczenia maszynowego.

Wymaga StartOS 0.4.1 lub nowszego.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.3.6)`,
    fr_FR: `Met à jour Immich vers la version 3.3.6. Désactive l'envoi à Microsoft de données de télémétrie anonymes de l'apprentissage automatique.

Nécessite StartOS 0.4.1 ou une version ultérieure.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.3.6)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
