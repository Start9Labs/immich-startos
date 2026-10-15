import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.3:0',
  releaseNotes: {
    en_US:
      'Updated Immich to 3.3.3. Improves people-query performance on the Explore page and fixes memory dates in the mobile app across languages. Full release notes: https://github.com/immich-app/immich/releases/tag/v3.3.3',
    es_ES:
      'Actualiza Immich a 3.3.3. Mejora el rendimiento de las consultas de personas en la página Explorar y corrige las fechas de los recuerdos en la aplicación móvil en todos los idiomas. Notas completas: https://github.com/immich-app/immich/releases/tag/v3.3.3',
    de_DE:
      'Aktualisiert Immich auf 3.3.3. Verbessert die Leistung der Personenabfragen auf der Entdecken-Seite und korrigiert die Datumsanzeige von Erinnerungen in der mobilen App in allen Sprachen. Vollständige Versionshinweise: https://github.com/immich-app/immich/releases/tag/v3.3.3',
    pl_PL:
      'Aktualizuje Immich do wersji 3.3.3. Poprawia wydajność zapytań o osoby na stronie Odkrywaj i wyświetlanie dat wspomnień w aplikacji mobilnej we wszystkich językach. Pełne informacje o wydaniu: https://github.com/immich-app/immich/releases/tag/v3.3.3',
    fr_FR:
      "Met à jour Immich vers la version 3.3.3. Améliore les performances des requêtes de personnes sur la page Explorer et corrige les dates des souvenirs dans l'application mobile dans toutes les langues. Notes de version complètes : https://github.com/immich-app/immich/releases/tag/v3.3.3",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
