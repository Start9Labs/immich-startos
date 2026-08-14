export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Immich': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'Database is ready': 4,
  'Cache is ready': 5,

  // interfaces.ts
  'Web UI': 6,
  'The Immich web interface for managing your photo library': 7,

  // actions/externalLibraries.ts
  'The path to the folder containing your photos and videos.': 9,
  'Must be a valid file path': 10,
  'External Libraries': 11,
  Name: 12,
  'A unique name to identify this library (e.g. "Family Photos")': 13,
  Source: 14,
  Nextcloud: 16,
  'Nextcloud User': 17,
  'The Nextcloud user account that owns the files.': 18,
  'File Browser': 20,
  'Configure external photo libraries from Nextcloud or File Browser': 21,
  'Manage External Libraries': 25,
  'Immich User': 41,
  'The Immich user who owns this library — their timeline shows the photos. Defaults to the admin and cannot be changed after the library is created.': 42,
  'Removing a library here deletes it from Immich (its photo records — not the source files). The owner is set when the library is created and cannot be changed afterward.': 43,
  Folders: 44,
  'Custom paths': 45,
  'Import Paths': 46,
  'Where the photos are. Connect File Browser or Nextcloud first (Connect Photo Sources) to pick them here; use Custom paths for anything else.': 47,

  // actions/resetAdminPassword.ts
  'Reset Admin Password': 26,
  'Reset the admin password to a new randomly generated password': 27,
  'Password Reset': 28,
  'The admin password has been reset': 29,
  'New Password': 30,

  // actions/configureSmtp.ts
  'Configure SMTP': 22,
  'Use system or custom SMTP credentials for Immich email notifications': 23,

  // actions/connectSources.ts
  'Connect Photo Sources': 35,
  'Choose which other StartOS services Immich may read photos and videos from. Turning a source on mounts its files into Immich (read-only) so you can add them as an external library — here or in the Immich admin UI. Immich restarts automatically to apply the change.': 36,
  'Allow Immich to read photos and videos stored in File Browser.': 37,
  'Allow Immich to read photos and videos stored in Nextcloud.': 38,

  // actions/setPrimaryUrl.ts
  URL: 31,
  'Set Primary URL': 32,
  'Choose which of your Immich URLs should be advertised as the external domain. Immich uses this URL when generating public share links for albums and assets. Immich restarts automatically to apply the change.': 33,

  // init/taskSetPrimaryUrl.ts
  'Primary URL removed. Select a new primary URL.': 34,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
