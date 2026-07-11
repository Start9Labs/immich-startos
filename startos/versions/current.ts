import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.1:1',
  releaseNotes: {
    en_US:
      'Fixes unreliable machine learning on servers with integrated AMD graphics. The AMD GPU (ROCm) variant is now installed only on discrete AMD GPUs; hosts whose only AMD graphics are integrated (such as the Radeon 680M in many Ryzen mini-PCs) now use the reliable CPU variant instead.',
    es_ES:
      'Corrige el aprendizaje automático poco fiable en servidores con gráficos AMD integrados. La variante de GPU AMD (ROCm) ahora se instala solo en GPU AMD dedicadas; los equipos cuyos únicos gráficos AMD son integrados (como la Radeon 680M de muchos mini-PC Ryzen) ahora usan la variante de CPU, más fiable.',
    de_DE:
      'Behebt unzuverlässiges maschinelles Lernen auf Servern mit integrierter AMD-Grafik. Die AMD-GPU-Variante (ROCm) wird jetzt nur noch auf dedizierten AMD-GPUs installiert; Hosts, deren einzige AMD-Grafik integriert ist (etwa die Radeon 680M in vielen Ryzen-Mini-PCs), nutzen nun die zuverlässige CPU-Variante.',
    pl_PL:
      'Naprawia niestabilne uczenie maszynowe na serwerach ze zintegrowaną grafiką AMD. Wariant GPU AMD (ROCm) jest teraz instalowany tylko na dedykowanych układach AMD; hosty, których jedyna grafika AMD jest zintegrowana (np. Radeon 680M w wielu mini-PC Ryzen), korzystają teraz z niezawodnego wariantu CPU.',
    fr_FR:
      "Corrige un apprentissage automatique peu fiable sur les serveurs dotés d'un GPU AMD intégré. La variante GPU AMD (ROCm) n'est désormais installée que sur les GPU AMD dédiés ; les hôtes dont la seule puce graphique AMD est intégrée (comme la Radeon 680M de nombreux mini-PC Ryzen) utilisent maintenant la variante CPU, plus fiable.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
