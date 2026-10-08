import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.4:1',
  releaseNotes: {
    en_US: `- Reset Admin Password asks for confirmation before replacing the admin password.
- Open UI prefers your primary URL when your connection can reach it.
- While no primary URL is chosen, Immich uses your public domain if you have one, HTTPS first, and otherwise the .local address.
- If the primary URL's address moves to another port or scheme, Immich follows it instead of asking you to choose again.
- Manage External Libraries explains each photo source and how to write folder paths.`,
    es_ES: `- Restablecer contraseña de administrador pide confirmación antes de sustituir la contraseña del administrador.
- Abrir interfaz prefiere su URL principal cuando su conexión puede alcanzarla.
- Mientras no se haya elegido una URL principal, Immich usa su dominio público si lo tiene, HTTPS primero, y si no, la dirección .local.
- Si la dirección de la URL principal pasa a otro puerto o esquema, Immich la sigue en lugar de pedirle que elija de nuevo.
- Gestionar bibliotecas externas explica cada fuente de fotos y cómo escribir las rutas de las carpetas.`,
    de_DE: `- Admin-Passwort zurücksetzen fragt vor dem Ersetzen des Admin-Passworts nach einer Bestätigung.
- Oberfläche öffnen bevorzugt Ihre primäre URL, wenn Ihre Verbindung sie erreichen kann.
- Solange keine primäre URL gewählt ist, verwendet Immich Ihre öffentliche Domain, falls vorhanden, HTTPS zuerst, und andernfalls die .local-Adresse.
- Wechselt die Adresse der primären URL zu einem anderen Port oder Schema, folgt Immich ihr, statt Sie erneut wählen zu lassen.
- Externe Bibliotheken verwalten erklärt jede Fotoquelle und wie Ordnerpfade anzugeben sind.`,
    pl_PL: `- Zresetuj hasło administratora prosi o potwierdzenie przed zastąpieniem hasła administratora.
- Otwórz interfejs preferuje główny adres URL, gdy połączenie może do niego dotrzeć.
- Dopóki nie wybrano głównego adresu URL, Immich używa domeny publicznej, jeśli ją masz, najpierw HTTPS, a w przeciwnym razie adresu .local.
- Jeśli adres głównego URL przejdzie na inny port lub schemat, Immich podąża za nim, zamiast prosić o ponowny wybór.
- Zarządzaj bibliotekami zewnętrznymi wyjaśnia każde źródło zdjęć i sposób zapisu ścieżek folderów.`,
    fr_FR: `- Réinitialiser le mot de passe administrateur demande une confirmation avant de remplacer le mot de passe administrateur.
- Ouvrir l'interface privilégie votre URL principale lorsque votre connexion peut l'atteindre.
- Tant qu'aucune URL principale n'est choisie, Immich utilise votre domaine public si vous en avez un, HTTPS d'abord, et sinon l'adresse .local.
- Si l'adresse de l'URL principale passe à un autre port ou schéma, Immich la suit au lieu de vous demander de choisir à nouveau.
- Gérer les bibliothèques externes explique chaque source de photos et comment écrire les chemins de dossiers.`,
  },
  migrations: {},
})
