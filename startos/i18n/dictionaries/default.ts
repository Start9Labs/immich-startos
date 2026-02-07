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
  'Folder Path': 8,
  'The path to the folder containing your photos and videos.': 9,
  'Must be a valid file path': 10,
  'External Libraries': 11,
  'Name': 12,
  'A unique name to identify this library (e.g. "Family Photos")': 13,
  'Source': 14,
  'The service where your photos and videos are stored': 15,
  'Nextcloud': 16,
  'Nextcloud User': 17,
  'The Nextcloud user account that owns the files.': 18,
  'May only contain alphanumeric characters, hyphens, and periods.': 19,
  'File Browser': 20,
  'Configure external photo libraries from Nextcloud or File Browser': 21,
  'Manage External Libraries': 25,

  // actions/resetAdminPassword.ts
  'Reset Admin Password': 26,
  'Reset the admin password to a new randomly generated password': 27,
  'Password Reset': 28,
  'The admin password has been reset': 29,
  'New Password': 30,

  // actions/configureSmtp.ts
  'Configure SMTP': 22,
  'Use system or custom SMTP credentials for Immich email notifications': 23,
  'SMTP settings will be applied on next restart': 24,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
