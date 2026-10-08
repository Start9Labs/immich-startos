export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Immich': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 6,
  'The Immich web interface for managing your photo library': 7,

  // actions/externalLibraries.ts
  'A folder within the source, written relative to its top level, such as Photos or Photos/2024.': 9,
  'Must be a valid file path': 10,
  'External Libraries': 11,
  Name: 12,
  Source: 14,
  Nextcloud: 16,
  'Nextcloud User': 17,
  'The Nextcloud user account that owns the files.': 18,
  'FileBrowser Quantum': 20,
  'Configure external photo libraries from NextExplorer, FileBrowser Quantum or Nextcloud': 21,
  'Manage External Libraries': 25,
  'Immich User': 41,
  'The Immich user who owns this library — their timeline shows the photos. Defaults to the admin and cannot be changed after the library is created.': 42,
  'Removing a library here deletes it from Immich (its photo records — not the source files). The owner is set when the library is created and cannot be changed afterward.': 43,
  Folders: 44,
  'Custom paths': 45,
  'Import Paths': 46,
  "Where the photos are. A service appears here once it is turned on in Connect Photo Sources.\n- NextExplorer: folders in NextExplorer\n- FileBrowser Quantum: folders in FileBrowser Quantum\n- Nextcloud: folders in one Nextcloud user's files\n- Custom paths: any other location, as full paths": 47,
  NextExplorer: 48,
  'Full paths inside Immich. Connected sources are under /mnt/nextexplorer, /mnt/filebrowser and /mnt/nextcloud.': 50,

  // actions/resetAdminPassword.ts
  'Reset Admin Password': 26,
  'Reset the admin password to a new randomly generated password': 27,
  'Password Reset': 28,
  'The admin password has been reset': 29,
  'New Password': 30,
  'Replaces the Immich admin password with a new random one. The current password stops working, and the new one is shown only once.': 51,

  // actions/configureSmtp.ts
  'Configure SMTP': 22,
  'Use system or custom SMTP credentials for Immich email notifications': 23,

  // actions/connectSources.ts
  'Connect Photo Sources': 35,
  'Choose which other StartOS services Immich may read photos and videos from. Turning a source on mounts its files into Immich (read-only) so you can add them as an external library — here or in the Immich admin UI. Immich restarts automatically to apply the change.': 36,
  'Allow Immich to read photos and videos stored in NextExplorer.': 49,
  'Allow Immich to read photos and videos stored in FileBrowser Quantum.': 37,
  'Allow Immich to read photos and videos stored in Nextcloud.': 38,

  // primaryUrl.ts
  URL: 31,
  'Set Primary URL': 32,
  'Choose which of your Immich URLs should be advertised as the external domain. Immich uses this URL when generating public share links for albums and assets. Immich restarts automatically to apply the change.': 33,

  // init/primaryUrlTask.ts
  'Primary URL removed. Select a new primary URL.': 34,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
