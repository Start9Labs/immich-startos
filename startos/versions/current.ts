import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.5:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.3.5. Updates trusted root certificates in response to a certificate-authority compromise, improves people-query performance, and fixes a missing translation.

Back up before updating. The first startup backfills face metadata and builds a new database index; large libraries may take longer to start and need additional database disk space.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.3.5)`,
    es_ES: `Actualiza Immich a 3.3.5. Actualiza los certificados raíz de confianza en respuesta al compromiso de una autoridad de certificación, mejora el rendimiento de las consultas de personas y corrige una traducción ausente.

Haz una copia de seguridad antes de actualizar. El primer arranque rellena los metadatos de los rostros y crea un nuevo índice de base de datos; las bibliotecas grandes pueden tardar más en arrancar y necesitar espacio adicional en disco para la base de datos.

[Notas completas de la versión](https://github.com/immich-app/immich/releases/tag/v3.3.5)`,
    de_DE: `Aktualisiert Immich auf 3.3.5. Aktualisiert die vertrauenswürdigen Stammzertifikate als Reaktion auf die Kompromittierung einer Zertifizierungsstelle, verbessert die Leistung von Personenabfragen und ergänzt eine fehlende Übersetzung.

Vor dem Update ein Backup erstellen. Beim ersten Start werden Gesichtsmetadaten nachgetragen und ein neuer Datenbankindex erstellt; große Bibliotheken können länger zum Starten brauchen und zusätzlichen Speicherplatz für die Datenbank benötigen.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.3.5)`,
    pl_PL: `Aktualizuje Immich do wersji 3.3.5. Aktualizuje zaufane certyfikaty główne w odpowiedzi na przejęcie urzędu certyfikacji, poprawia wydajność zapytań dotyczących osób i uzupełnia brakujące tłumaczenie.

Przed aktualizacją wykonaj kopię zapasową. Pierwsze uruchomienie uzupełnia metadane twarzy i tworzy nowy indeks bazy danych; duże biblioteki mogą uruchamiać się dłużej i wymagać dodatkowego miejsca na dysku dla bazy danych.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.3.5)`,
    fr_FR: `Met à jour Immich vers la version 3.3.5. Met à jour les certificats racines de confiance à la suite de la compromission d'une autorité de certification, améliore les performances des requêtes sur les personnes et ajoute une traduction manquante.

Effectuez une sauvegarde avant la mise à jour. Le premier démarrage complète les métadonnées des visages et crée un nouvel index de base de données ; les grandes bibliothèques peuvent démarrer plus lentement et nécessiter davantage d'espace disque pour la base de données.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.3.5)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
