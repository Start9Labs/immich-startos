import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.1:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.0.1, the first v3 release. Highlights:

- Workflows (preview) — automate library actions with triggers, filters, and actions.
- Integrity checks — surface missing, untracked, or corrupted files.
- HLS and real-time video transcoding (preview), plus a new web video player.
- Non-destructive photo editing, a Recently Added page, and OCR on mobile.
- Faster timeline browsing for months with many assets.

Machine learning (smart search, facial recognition) now needs an x86-64-v2 CPU on x86 hosts — on older hardware the ML container won't start, though the rest of Immich keeps working. Also fixes SMTP setup, which broke under v3's stricter validation.

Full release notes: https://github.com/immich-app/immich/releases/tag/v3.0.1`,
    es_ES: `Immich actualizado a 3.0.1, la primera versión v3. Novedades:

- Flujos de trabajo (vista previa) — automatiza acciones de la biblioteca con disparadores, filtros y acciones.
- Comprobaciones de integridad — detecta archivos ausentes, no registrados o dañados.
- Transcodificación de vídeo HLS y en tiempo real (vista previa), además de un nuevo reproductor de vídeo web.
- Edición de fotos no destructiva, una página de Añadidos recientemente y OCR en el móvil.
- Navegación por la línea de tiempo más rápida en meses con muchos elementos.

El aprendizaje automático (búsqueda inteligente, reconocimiento facial) ahora requiere una CPU x86-64-v2 en equipos x86 — en hardware más antiguo el contenedor de ML no arrancará, aunque el resto de Immich seguirá funcionando. También corrige la configuración de SMTP, que dejó de funcionar con la validación más estricta de v3.

Notas completas: https://github.com/immich-app/immich/releases/tag/v3.0.1`,
    de_DE: `Immich auf 3.0.1 aktualisiert, die erste v3-Version. Highlights:

- Workflows (Vorschau) — Bibliotheksaktionen mit Auslösern, Filtern und Aktionen automatisieren.
- Integritätsprüfungen — fehlende, nicht erfasste oder beschädigte Dateien aufspüren.
- HLS- und Echtzeit-Video-Transcoding (Vorschau) sowie ein neuer Web-Videoplayer.
- Nicht-destruktive Fotobearbeitung, eine Seite „Kürzlich hinzugefügt“ und OCR in der mobilen App.
- Schnelleres Blättern in der Zeitleiste bei Monaten mit vielen Objekten.

Maschinelles Lernen (intelligente Suche, Gesichtserkennung) benötigt auf x86-Hosts jetzt eine x86-64-v2-CPU — auf älterer Hardware startet der ML-Container nicht, der Rest von Immich funktioniert aber weiter. Behebt außerdem die SMTP-Einrichtung, die unter der strengeren Validierung von v3 nicht mehr funktionierte.

Vollständige Versionshinweise: https://github.com/immich-app/immich/releases/tag/v3.0.1`,
    pl_PL: `Zaktualizowano Immich do 3.0.1, pierwszego wydania v3. Najważniejsze zmiany:

- Przepływy pracy (podgląd) — automatyzacja akcji biblioteki za pomocą wyzwalaczy, filtrów i akcji.
- Kontrole integralności — wykrywanie brakujących, nieśledzonych lub uszkodzonych plików.
- Transkodowanie wideo HLS i w czasie rzeczywistym (podgląd) oraz nowy odtwarzacz wideo w przeglądarce.
- Nieniszcząca edycja zdjęć, strona „Ostatnio dodane” i OCR w aplikacji mobilnej.
- Szybsze przeglądanie osi czasu w miesiącach z dużą liczbą elementów.

Uczenie maszynowe (inteligentne wyszukiwanie, rozpoznawanie twarzy) wymaga teraz procesora x86-64-v2 na hostach x86 — na starszym sprzęcie kontener ML nie uruchomi się, choć reszta Immich działa dalej. Naprawia też konfigurację SMTP, która przestała działać przy surowszej walidacji w v3.

Pełne informacje o wydaniu: https://github.com/immich-app/immich/releases/tag/v3.0.1`,
    fr_FR: `Immich mis à jour vers 3.0.1, la première version v3. Nouveautés :

- Workflows (aperçu) — automatisez les actions de la bibliothèque avec des déclencheurs, des filtres et des actions.
- Contrôles d'intégrité — repérez les fichiers manquants, non suivis ou corrompus.
- Transcodage vidéo HLS et en temps réel (aperçu), ainsi qu'un nouveau lecteur vidéo web.
- Édition de photos non destructive, une page « Ajoutés récemment » et l'OCR sur mobile.
- Navigation dans la chronologie plus rapide pour les mois comptant de nombreux éléments.

L'apprentissage automatique (recherche intelligente, reconnaissance faciale) nécessite désormais un processeur x86-64-v2 sur les hôtes x86 — sur du matériel plus ancien, le conteneur ML ne démarre pas, mais le reste d'Immich continue de fonctionner. Corrige également la configuration SMTP, qui ne fonctionnait plus avec la validation plus stricte de v3.

Notes de version complètes : https://github.com/immich-app/immich/releases/tag/v3.0.1`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
