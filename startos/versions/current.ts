import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.4.1:2',
  releaseNotes: {
    en_US: `Immich's bundled Valkey cache accepts connections from Immich alone, and is updated to 9.2.0.`,
    es_ES: `La caché Valkey incluida en Immich solo acepta conexiones de Immich, y se actualiza a 9.2.0.`,
    de_DE: `Der mitgelieferte Valkey-Cache von Immich nimmt nur Verbindungen von Immich an und wird auf 9.2.0 aktualisiert.`,
    pl_PL: `Dołączona pamięć podręczna Valkey przyjmuje połączenia wyłącznie od Immich i została zaktualizowana do wersji 9.2.0.`,
    fr_FR: `Le cache Valkey intégré à Immich n'accepte les connexions que d'Immich, et passe à la version 9.2.0.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
