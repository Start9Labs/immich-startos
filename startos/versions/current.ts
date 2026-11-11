import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.4.0:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.4.0.

- Adds JPEG XL support and workflow filters for OCR text and missing or present EXIF metadata.
- Fixes security issues involving shared links, partner access, email templates, and storage paths.
- Improves sync and search performance and fixes duplicate loading of machine-learning models.

Requires StartOS 0.4.2 or later. Back up before updating. The first startup builds new database indexes; large libraries may take longer to start and need additional database disk space.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.4.0)`,
    es_ES: `Actualiza Immich a 3.4.0.

- Añade compatibilidad con JPEG XL y filtros de flujos de trabajo para texto OCR y metadatos EXIF presentes o ausentes.
- Corrige problemas de seguridad en enlaces compartidos, acceso de socios, plantillas de correo y rutas de almacenamiento.
- Mejora el rendimiento de la sincronización y las búsquedas y corrige la carga duplicada de modelos de aprendizaje automático.

Requiere StartOS 0.4.2 o posterior. Haz una copia de seguridad antes de actualizar. El primer arranque crea nuevos índices de base de datos; las bibliotecas grandes pueden tardar más en arrancar y necesitar espacio adicional en disco para la base de datos.

[Notas completas de la versión](https://github.com/immich-app/immich/releases/tag/v3.4.0)`,
    de_DE: `Aktualisiert Immich auf 3.4.0.

- Fügt JPEG-XL-Unterstützung und Workflow-Filter für OCR-Text sowie fehlende oder vorhandene EXIF-Metadaten hinzu.
- Behebt Sicherheitsprobleme bei Freigabelinks, Partnerzugriffen, E-Mail-Vorlagen und Speicherpfaden.
- Verbessert die Synchronisierungs- und Suchleistung und behebt das doppelte Laden von Modellen für maschinelles Lernen.

Erfordert StartOS 0.4.2 oder neuer. Vor dem Update ein Backup erstellen. Beim ersten Start werden neue Datenbankindizes erstellt; große Bibliotheken können länger zum Starten brauchen und zusätzlichen Speicherplatz für die Datenbank benötigen.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.4.0)`,
    pl_PL: `Aktualizuje Immich do wersji 3.4.0.

- Dodaje obsługę JPEG XL oraz filtry przepływów pracy dla tekstu OCR i obecnych lub brakujących metadanych EXIF.
- Naprawia problemy bezpieczeństwa związane z linkami udostępniania, dostępem partnerów, szablonami wiadomości i ścieżkami przechowywania.
- Poprawia wydajność synchronizacji i wyszukiwania oraz naprawia podwójne ładowanie modeli uczenia maszynowego.

Wymaga StartOS 0.4.2 lub nowszego. Przed aktualizacją wykonaj kopię zapasową. Pierwsze uruchomienie tworzy nowe indeksy bazy danych; duże biblioteki mogą uruchamiać się dłużej i wymagać dodatkowego miejsca na dysku dla bazy danych.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.4.0)`,
    fr_FR: `Met à jour Immich vers la version 3.4.0.

- Ajoute la prise en charge de JPEG XL et des filtres de flux de travail pour le texte OCR et les métadonnées EXIF présentes ou absentes.
- Corrige des problèmes de sécurité liés aux liens de partage, aux accès des partenaires, aux modèles de courriel et aux chemins de stockage.
- Améliore les performances de synchronisation et de recherche et corrige le double chargement des modèles d'apprentissage automatique.

Nécessite StartOS 0.4.2 ou une version ultérieure. Effectuez une sauvegarde avant la mise à jour. Le premier démarrage crée de nouveaux index de base de données ; les grandes bibliothèques peuvent démarrer plus lentement et nécessiter davantage d'espace disque pour la base de données.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.4.0)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
