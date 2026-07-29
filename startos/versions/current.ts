import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.1.0:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.1.0.

- Workflows can now filter assets by their file path on the server and by EXIF metadata.
- The web uploader holds a wakelock so the screen no longer dims mid-upload, and archiving assets can be undone from the confirmation toast.
- OAuth logins now re-check the role claim on every sign-in, so admin rights stay in sync, and a list of roles is accepted.
- Resetting the admin password from the command line can now sign out all existing sessions.
- Many fixes, including zero-byte image uploads, locked-folder permissions, and video playback under the default content security policy.
- Note: the Immich mobile app has dropped support for iOS 14.

Full release notes: https://github.com/immich-app/immich/releases/tag/v3.1.0`,
    es_ES: `Actualiza Immich a 3.1.0.

- Los flujos de trabajo ya pueden filtrar archivos por su ruta en el servidor y por metadatos EXIF.
- La subida desde el navegador mantiene la pantalla encendida durante el proceso, y ahora se puede deshacer el archivado desde la notificación de confirmación.
- Los inicios de sesión con OAuth vuelven a comprobar el rol en cada acceso, de modo que los permisos de administrador se mantienen sincronizados, y se admite una lista de roles.
- Al restablecer la contraseña de administrador desde la línea de comandos ya es posible cerrar todas las sesiones abiertas.
- Numerosas correcciones, entre ellas las subidas de imágenes de cero bytes, los permisos de carpetas bloqueadas y la reproducción de vídeo con la política de seguridad de contenido predeterminada.
- Nota: la aplicación móvil de Immich ha dejado de admitir iOS 14.

Notas de la versión completas: https://github.com/immich-app/immich/releases/tag/v3.1.0`,
    de_DE: `Aktualisiert Immich auf 3.1.0.

- Workflows können Dateien jetzt nach ihrem Pfad auf dem Server und nach EXIF-Metadaten filtern.
- Der Web-Upload hält den Bildschirm während des Vorgangs wach, und das Archivieren lässt sich direkt über die Bestätigungsmeldung rückgängig machen.
- OAuth-Anmeldungen prüfen die Rollenangabe bei jeder Anmeldung erneut, sodass Administratorrechte synchron bleiben, und akzeptieren eine Liste von Rollen.
- Beim Zurücksetzen des Administratorkennworts über die Kommandozeile lassen sich nun alle bestehenden Sitzungen abmelden.
- Zahlreiche Fehlerbehebungen, unter anderem bei Uploads von Bildern mit null Byte, bei Berechtigungen für gesperrte Ordner und bei der Videowiedergabe unter der standardmäßigen Content Security Policy.
- Hinweis: Die mobile Immich-App unterstützt iOS 14 nicht mehr.

Vollständige Versionshinweise: https://github.com/immich-app/immich/releases/tag/v3.1.0`,
    pl_PL: `Aktualizuje Immich do 3.1.0.

- Przepływy pracy mogą teraz filtrować pliki według ścieżki na serwerze oraz według metadanych EXIF.
- Przesyłanie przez przeglądarkę utrzymuje ekran włączony, a archiwizację można cofnąć z poziomu powiadomienia o powodzeniu.
- Logowanie OAuth ponownie sprawdza rolę przy każdym logowaniu, dzięki czemu uprawnienia administratora pozostają zsynchronizowane, i obsługuje listę ról.
- Resetowanie hasła administratora z wiersza poleceń pozwala teraz wylogować wszystkie istniejące sesje.
- Wiele poprawek, w tym przesyłanie obrazów o zerowym rozmiarze, uprawnienia zablokowanych folderów oraz odtwarzanie wideo przy domyślnej polityce bezpieczeństwa treści.
- Uwaga: aplikacja mobilna Immich nie obsługuje już systemu iOS 14.

Pełne informacje o wydaniu: https://github.com/immich-app/immich/releases/tag/v3.1.0`,
    fr_FR: `Met à jour Immich vers 3.1.0.

- Les flux de travail peuvent désormais filtrer les fichiers selon leur chemin sur le serveur et selon les métadonnées EXIF.
- L'envoi depuis le navigateur maintient l'écran allumé pendant l'opération, et l'archivage peut être annulé depuis la notification de confirmation.
- Les connexions OAuth revérifient le rôle à chaque connexion, afin que les droits d'administrateur restent synchronisés, et acceptent une liste de rôles.
- La réinitialisation du mot de passe administrateur en ligne de commande permet maintenant de déconnecter toutes les sessions existantes.
- De nombreuses corrections, notamment sur les envois d'images de zéro octet, les permissions des dossiers verrouillés et la lecture vidéo avec la politique de sécurité du contenu par défaut.
- Remarque : l'application mobile Immich ne prend plus en charge iOS 14.

Notes de version complètes : https://github.com/immich-app/immich/releases/tag/v3.1.0`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
