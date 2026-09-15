import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.1:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.2.1. Fixes sync connection-pool exhaustion and issues with search, shared partner assets, merging people, archives, and password state.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.2.1)`,
    es_ES: `Actualiza Immich a 3.2.1. Corrige el agotamiento del grupo de conexiones durante la sincronización y problemas con la búsqueda, los recursos compartidos por socios, la fusión de personas, los archivos y el estado de las contraseñas.

[Notas completas de la versión](https://github.com/immich-app/immich/releases/tag/v3.2.1)`,
    de_DE: `Aktualisiert Immich auf 3.2.1. Behebt die Erschöpfung des Verbindungspools bei der Synchronisierung sowie Probleme mit der Suche, geteilten Inhalten von Partnern, dem Zusammenführen von Personen, Archiven und dem Passwortstatus.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.2.1)`,
    pl_PL: `Aktualizuje Immich do wersji 3.2.1. Naprawia wyczerpywanie puli połączeń podczas synchronizacji oraz problemy z wyszukiwaniem, zasobami udostępnianymi przez partnerów, scalaniem osób, archiwami i stanem hasła.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.2.1)`,
    fr_FR: `Met à jour Immich vers la version 3.2.1. Corrige l'épuisement du pool de connexions lors de la synchronisation ainsi que des problèmes liés à la recherche, aux ressources partagées par les partenaires, à la fusion des personnes, aux archives et à l'état des mots de passe.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.2.1)`,
  },
  migrations: {},
})
