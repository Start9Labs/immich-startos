import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_6_3_0 = VersionInfo.of({
  version: '2.6.3:0',
  releaseNotes: {
    en_US: 'Fix machine learning (smart search, auto-upload) by correctly routing ML requests to localhost',
    es_ES: 'Corrección del aprendizaje automático (búsqueda inteligente, carga automática) enrutando correctamente las solicitudes al localhost',
    de_DE: 'Behebung des maschinellen Lernens (intelligente Suche, automatischer Upload) durch korrekte Weiterleitung der ML-Anfragen an localhost',
    pl_PL: 'Naprawa uczenia maszynowego (inteligentne wyszukiwanie, automatyczne przesyłanie) przez poprawne kierowanie żądań ML do localhost',
    fr_FR: "Correction de l'apprentissage automatique (recherche intelligente, téléchargement automatique) en routant correctement les requêtes ML vers localhost",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
