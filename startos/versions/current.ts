import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.5:5',
  releaseNotes: {
    en_US: "Fixes 'Invalid API key' log noise caused by an upstream change to how Immich stores API keys.",
    es_ES: "Corrige el ruido en los registros por 'Invalid API key' causado por un cambio del upstream en la forma en que Immich almacena las claves de API.",
    de_DE: 'Behebt die durch eine Upstream-Änderung an der API-Schlüsselspeicherung von Immich verursachten „Invalid API key“-Meldungen im Log.',
    pl_PL: "Naprawia spam komunikatów 'Invalid API key' w logach spowodowany zmianą w upstreamie sposobu, w jaki Immich przechowuje klucze API.",
    fr_FR: "Corrige le bruit dans les logs « Invalid API key » causé par un changement en amont dans la façon dont Immich stocke les clés d'API.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
