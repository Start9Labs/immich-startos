import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.3:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.0.3, a maintenance release on the 3.0 line.

This release also migrates the package to start-sdk 2.0 (requires StartOS 0.4.0-beta.10 or later).

Full release notes: https://github.com/immich-app/immich/releases/tag/v3.0.3`,
    es_ES: `Actualiza Immich a 3.0.3, una versión de mantenimiento de la línea 3.0.

Esta versión también migra el paquete a start-sdk 2.0 (requiere StartOS 0.4.0-beta.10 o posterior).

Notas de la versión completas: https://github.com/immich-app/immich/releases/tag/v3.0.3`,
    de_DE: `Aktualisiert Immich auf 3.0.3, eine Wartungsversion der 3.0-Reihe.

Diese Version stellt das Paket außerdem auf start-sdk 2.0 um (erfordert StartOS 0.4.0-beta.10 oder neuer).

Vollständige Versionshinweise: https://github.com/immich-app/immich/releases/tag/v3.0.3`,
    pl_PL: `Aktualizuje Immich do 3.0.3, wydania konserwacyjnego linii 3.0.

Ta wersja przenosi też pakiet na start-sdk 2.0 (wymaga StartOS 0.4.0-beta.10 lub nowszego).

Pełne informacje o wydaniu: https://github.com/immich-app/immich/releases/tag/v3.0.3`,
    fr_FR: `Met à jour Immich vers 3.0.3, une version de maintenance de la série 3.0.

Cette version fait également passer le paquet à start-sdk 2.0 (nécessite StartOS 0.4.0-beta.10 ou une version ultérieure).

Notes de version complètes : https://github.com/immich-app/immich/releases/tag/v3.0.3`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
