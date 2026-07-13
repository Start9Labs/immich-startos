import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.2:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.0.2.

- Adds a date filter to workflows and configurable HLS variants for video streaming.
- Makes database restore user-agnostic, so a dump restores regardless of the database user that created it.
- Wraps database migrations in a transaction.
- Fixes OAuth account linking, live transcoding from shared links, audio downmixing to stereo, and several web search and timeline issues.

Full release notes: https://github.com/immich-app/immich/releases/tag/v3.0.2`,
    es_ES: `Actualiza Immich a 3.0.2.

- Añade un filtro de fecha a los flujos de trabajo y variantes HLS configurables para la transmisión de vídeo.
- Hace que la restauración de la base de datos sea independiente del usuario, de modo que un volcado se restaura sin importar el usuario de base de datos que lo creó.
- Envuelve las migraciones de la base de datos en una transacción.
- Corrige la vinculación de cuentas OAuth, la transcodificación en directo desde enlaces compartidos, la mezcla de audio a estéreo y varios problemas de búsqueda y de la cronología en la web.

Notas de la versión completas: https://github.com/immich-app/immich/releases/tag/v3.0.2`,
    de_DE: `Aktualisiert Immich auf 3.0.2.

- Fügt Workflows einen Datumsfilter und konfigurierbare HLS-Varianten für das Video-Streaming hinzu.
- Macht die Datenbankwiederherstellung benutzerunabhängig, sodass ein Dump unabhängig von dem Datenbankbenutzer wiederhergestellt wird, der ihn erstellt hat.
- Kapselt Datenbankmigrationen in einer Transaktion.
- Behebt die OAuth-Kontoverknüpfung, das Live-Transcoding aus geteilten Links, das Heruntermischen von Audio auf Stereo sowie mehrere Probleme bei der Websuche und der Zeitleiste.

Vollständige Versionshinweise: https://github.com/immich-app/immich/releases/tag/v3.0.2`,
    pl_PL: `Aktualizuje Immich do 3.0.2.

- Dodaje filtr daty do przepływów pracy oraz konfigurowalne warianty HLS dla strumieniowania wideo.
- Uniezależnia przywracanie bazy danych od użytkownika, dzięki czemu zrzut przywraca się niezależnie od użytkownika bazy, który go utworzył.
- Opakowuje migracje bazy danych w transakcję.
- Naprawia łączenie kont OAuth, transkodowanie na żywo z udostępnionych linków, miksowanie dźwięku do stereo oraz kilka problemów z wyszukiwaniem i osią czasu w interfejsie webowym.

Pełne informacje o wydaniu: https://github.com/immich-app/immich/releases/tag/v3.0.2`,
    fr_FR: `Met à jour Immich vers 3.0.2.

- Ajoute un filtre de date aux workflows et des variantes HLS configurables pour la diffusion vidéo.
- Rend la restauration de la base de données indépendante de l'utilisateur, afin qu'un export soit restauré quel que soit l'utilisateur de base de données qui l'a créé.
- Encapsule les migrations de la base de données dans une transaction.
- Corrige la liaison des comptes OAuth, le transcodage en direct depuis les liens partagés, le mixage audio en stéréo, ainsi que plusieurs problèmes de recherche et de chronologie dans l'interface web.

Notes de version complètes : https://github.com/immich-app/immich/releases/tag/v3.0.2`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
