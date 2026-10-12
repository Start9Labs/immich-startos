import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:2',
  releaseNotes: {
    en_US:
      "Other services can now connect to an Immich account with an API key that can only view that account's library and edit the details of its photos and videos. Such keys are listed under Account Settings → API Keys in Immich, where they can be revoked.",
    es_ES:
      'Otros servicios ahora pueden conectarse a una cuenta de Immich con una clave API que solo puede ver la biblioteca de esa cuenta y editar los detalles de sus fotos y vídeos. Estas claves aparecen en Ajustes de la cuenta → Claves API en Immich, donde se pueden revocar.',
    de_DE:
      'Andere Dienste können sich jetzt mit einem Immich-Konto verbinden, über einen API-Schlüssel, mit dem sich nur die Mediathek dieses Kontos ansehen und die Details seiner Fotos und Videos bearbeiten lassen. Solche Schlüssel stehen in Immich unter Kontoeinstellungen → API-Schlüssel und lassen sich dort widerrufen.',
    pl_PL:
      'Inne usługi mogą teraz łączyć się z kontem Immich za pomocą klucza API, który pozwala tylko przeglądać bibliotekę tego konta i edytować szczegóły jego zdjęć i filmów. Takie klucze są widoczne w Immich w Ustawienia konta → Klucze API, gdzie można je unieważnić.',
    fr_FR:
      "D'autres services peuvent désormais se connecter à un compte Immich avec une clé API qui permet seulement de consulter la bibliothèque de ce compte et de modifier les détails de ses photos et vidéos. Ces clés figurent dans Paramètres du compte → Clés d'API dans Immich, où elles peuvent être révoquées.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
