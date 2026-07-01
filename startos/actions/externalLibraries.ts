import { z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import {
  FILEBROWSER_MOUNTPOINT,
  getOrMintApiKey,
  immichApi,
  NEXTCLOUD_MOUNTPOINT,
  sourceExposed,
} from '../utils'

const { InputSpec, Value, List, Variants } = sdk

// ── Immich API shapes ───────────────────────────────────────────────────────
type ImmichLibrary = {
  id: string
  ownerId: string
  name: string
  importPaths: string[]
}
type ImmichUser = {
  id: string
  email: string
  name?: string
  isAdmin?: boolean
}

// Folder/path Lists live INSIDE the source variant (hierarchical). The List has
// `minLength: null` so a freshly-switched variant starts with ZERO rows — there
// is no auto-created row for StartOS to bleed a sibling row's value into; you
// click Add to make a fresh empty row.
type SourceValue =
  | { selection: 'filebrowser'; value: { folders: string[] } }
  | { selection: 'nextcloud'; value: { user: string; folders: string[] } }
  | { selection: 'custom'; value: { paths: string[] } }

type ExposedFlags =
  { filebrowser?: boolean; nextcloud?: boolean } | null | undefined
type LegacyLibs = ReadonlyArray<{ source: { selection: string } }>

type LibraryRow = {
  id?: string
  owner: string
  name: string
  source: SourceValue
}

function buildImportPaths(source: SourceValue): string[] {
  if (source.selection === 'filebrowser') {
    return source.value.folders
      .filter(Boolean)
      .map((f) => `${FILEBROWSER_MOUNTPOINT}/${f}`)
  }
  if (source.selection === 'nextcloud') {
    const base = `${NEXTCLOUD_MOUNTPOINT}/data/${source.value.user}/files`
    return source.value.folders.filter(Boolean).map((f) => `${base}/${f}`)
  }
  return source.value.paths.filter(Boolean)
}

// Map a library's import paths to a source variant. Friendly types require a
// connected source AND that every path is a specific folder under it (a
// whole-dir or odd path falls through to custom, preserved verbatim), so
// nothing is dropped and a round-trip never loses a path.
function parseLibrary(
  importPaths: string[],
  exposed: ExposedFlags,
  legacyLibs: LegacyLibs,
): SourceValue {
  const fbPrefix = `${FILEBROWSER_MOUNTPOINT}/`
  const ncRoot = `${NEXTCLOUD_MOUNTPOINT}/data/`

  if (
    importPaths.length > 0 &&
    sourceExposed('filebrowser', exposed, legacyLibs)
  ) {
    if (
      importPaths.every(
        (p) => p.startsWith(fbPrefix) && p.length > fbPrefix.length,
      )
    ) {
      return {
        selection: 'filebrowser',
        value: {
          folders: importPaths.map((p) => p.slice(fbPrefix.length)),
        },
      }
    }
  }

  if (
    importPaths.length > 0 &&
    sourceExposed('nextcloud', exposed, legacyLibs)
  ) {
    const parsed = importPaths.map((p) => {
      if (!p.startsWith(ncRoot)) return null
      const m = p.slice(ncRoot.length).match(/^([^/]+)\/files\/(.+)$/)
      return m ? { user: m[1], folder: m[2] } : null
    })
    if (
      parsed.every((x) => x !== null) &&
      parsed.every((x) => x!.user === parsed[0]!.user)
    ) {
      return {
        selection: 'nextcloud',
        value: {
          user: parsed[0]!.user,
          folders: parsed.map((x) => x!.folder),
        },
      }
    }
  }

  return { selection: 'custom', value: { paths: importPaths } }
}

// ── Form spec ────────────────────────────────────────────────────────────────
// A fresh folder List per variant. `minLength: null` → a freshly-switched
// variant starts with ZERO rows (no auto-created row to bleed into); you click
// Add for a clean empty row.
function foldersBox() {
  return Value.list(
    List.text(
      {
        name: i18n('Folders'),
        default: [],
        minLength: null,
        maxLength: null,
        description: i18n(
          'The path to the folder containing your photos and videos.',
        ),
      },
      {
        patterns: [
          {
            regex:
              '^(\\.|[a-zA-Z0-9_ -][a-zA-Z0-9_ .-]*|([a-zA-Z0-9_ .-][a-zA-Z0-9_ -]+\\.*)+)(/[a-zA-Z0-9_ -][a-zA-Z0-9_ .-]*|/([a-zA-Z0-9_ .-][a-zA-Z0-9_ -]+\\.*)+)*/?$',
            description: i18n('Must be a valid file path'),
          },
        ],
        placeholder: 'e.g. Photos',
      },
    ),
  )
}

const filebrowserVariant = {
  name: i18n('File Browser'),
  spec: InputSpec.of({ folders: foldersBox() }),
}

const nextcloudVariant = {
  name: i18n('Nextcloud'),
  spec: InputSpec.of({
    // Dropdown of Nextcloud users: the startup-cached list UNIONed with users
    // any existing library references (keeps a library whose user isn't cached
    // from disappearing).
    user: Value.dynamicSelect(async ({ effects }) => {
      const apiKey = await storeJson.read((s) => s.apiKey).once()
      const cached =
        (await storeJson.read((s) => s.nextcloudUsers).once()) || []
      const users = new Set<string>(cached)
      if (apiKey) {
        try {
          const libs = await immichApi<ImmichLibrary[]>('/libraries', apiKey)
          const ncRoot = `${NEXTCLOUD_MOUNTPOINT}/data/`
          for (const lib of libs) {
            for (const p of lib.importPaths) {
              if (!p.startsWith(ncRoot)) continue
              const m = p.slice(ncRoot.length).match(/^([^/]+)\/files/)
              if (m) users.add(m[1])
            }
          }
        } catch {}
      }
      const list = [...users].sort()
      const values: Record<string, string> = {}
      for (const u of list) values[u] = u
      return {
        name: i18n('Nextcloud User'),
        values,
        default: list.includes('admin') ? 'admin' : (list[0] ?? ''),
        description: i18n('The Nextcloud user account that owns the files.'),
      }
    }),
    folders: foldersBox(),
  }),
}

const customVariant = {
  name: i18n('Custom paths'),
  spec: InputSpec.of({
    paths: Value.list(
      List.text(
        {
          name: i18n('Import Paths'),
          default: [],
          minLength: null,
          maxLength: null,
        },
        {
          patterns: [],
          placeholder: '/mnt/nextcloud/data/<user>/files/Photos',
        },
      ),
    ),
  }),
}

export const inputSpec = InputSpec.of({
  externalLibraries: Value.list(
    sdk.List.obj(
      { name: i18n('External Libraries') },
      {
        displayAs: '{{name}}',
        spec: InputSpec.of({
          // Immich library id. A newly added row sends null (→ create on save);
          // populated by getInput for rows read back from Immich.
          id: Value.hidden(z.string().nullish()),
          // Live dropdown of Immich users (value = user id → ownerId).
          owner: Value.dynamicSelect(async ({ effects }) => {
            const apiKey = await storeJson.read((s) => s.apiKey).once()
            const values: Record<string, string> = {}
            let adminId = ''
            if (apiKey) {
              try {
                const users = await immichApi<ImmichUser[]>(
                  '/admin/users',
                  apiKey,
                )
                for (const u of users) {
                  values[u.id] = u.name ? `${u.name} (${u.email})` : u.email
                }
                adminId = users.find((u) => u.isAdmin)?.id ?? users[0]?.id ?? ''
              } catch {}
            }
            return {
              name: i18n('Immich User'),
              values,
              default: adminId,
              description: i18n(
                'The Immich user who owns this library — their timeline shows the photos. Defaults to the admin and cannot be changed after the library is created.',
              ),
            }
          }),
          name: Value.text({
            name: i18n('Name'),
            description: i18n(
              'A unique name to identify this library (e.g. "Family Photos")',
            ),
            placeholder: 'My Photos',
            required: true,
            default: null,
          }),
          // Source type + its folders (or, for Custom, full paths). Connected
          // File Browser / Nextcloud are offered; Custom paths is the always-on
          // catch-all so every library maps to something.
          source: Value.dynamicUnion(async ({ effects }) => {
            const store = await storeJson.read().once()
            const libs = store?.externalLibraries || []
            const exposed = store?.exposedSources
            const fbOn = sourceExposed('filebrowser', exposed, libs)
            const ncOn = sourceExposed('nextcloud', exposed, libs)

            const variants: Record<string, { name: string; spec: any }> = {}
            if (fbOn) variants.filebrowser = filebrowserVariant
            if (ncOn) variants.nextcloud = nextcloudVariant
            variants.custom = customVariant

            return {
              name: i18n('Source'),
              default: fbOn ? 'filebrowser' : ncOn ? 'nextcloud' : 'custom',
              description: i18n(
                'Where the photos are. Connect File Browser or Nextcloud first (Connect Photo Sources) to pick them here; use Custom paths for anything else.',
              ),
              variants: Variants.of(variants),
              disabled: false,
            }
          }),
        }),
      },
    ),
  ),
})

export const externalLibraries = sdk.Action.withInput(
  'external-libraries',

  async ({ effects }) => ({
    name: i18n('Manage External Libraries'),
    description: i18n(
      'Configure external photo libraries from Nextcloud or File Browser',
    ),
    warning: i18n(
      'Removing a library here deletes it from Immich (its photo records — not the source files). The owner is set when the library is created and cannot be changed afterward.',
    ),
    allowedStatuses: 'only-running',
    group: i18n('External Libraries'),
    visibility: 'enabled',
  }),

  inputSpec,

  // Read the live library list from Immich. Every library maps to a variant,
  // so none are dropped.
  async ({ effects }) => {
    const store = await storeJson.read().once()
    const exposed = store?.exposedSources
    const legacyLibs = store?.externalLibraries || []

    const apiKey = await getOrMintApiKey(effects)
    if (!apiKey) return { externalLibraries: [] }

    const libs = await immichApi<ImmichLibrary[]>('/libraries', apiKey)
    const out: LibraryRow[] = libs.map((lib) => ({
      id: lib.id,
      owner: lib.ownerId,
      name: lib.name,
      source: parseLibrary(lib.importPaths, exposed, legacyLibs),
    }))
    return { externalLibraries: out }
  },

  // Apply the form back to Immich, correlating by id: create (no id), update
  // in place (existing id), delete (any current library the user removed).
  async ({ effects, input }) => {
    const submitted = input.externalLibraries || []

    const apiKey = await getOrMintApiKey(effects)
    if (!apiKey) {
      throw new Error('Immich is not ready yet (no administrator account).')
    }

    const current = await immichApi<ImmichLibrary[]>('/libraries', apiKey)

    const submittedIds = new Set<string>()
    for (const row of submitted) {
      const importPaths = buildImportPaths(row.source as unknown as SourceValue)
      if (row.id) {
        // Update in place — owner is immutable, so it isn't sent.
        submittedIds.add(row.id)
        await immichApi(`/libraries/${row.id}`, apiKey, {
          method: 'PUT',
          body: { name: row.name, importPaths },
        })
        await immichApi(`/libraries/${row.id}/scan`, apiKey, { method: 'POST' })
      } else {
        const ownerId = row.owner
        if (!ownerId) {
          throw new Error('Select an Immich user to own this library.')
        }
        const created = await immichApi<ImmichLibrary>('/libraries', apiKey, {
          method: 'POST',
          body: { ownerId, name: row.name, importPaths },
        })
        await immichApi(`/libraries/${created.id}/scan`, apiKey, {
          method: 'POST',
        })
      }
    }

    // Delete any Immich library the user removed from the form.
    for (const lib of current) {
      if (!submittedIds.has(lib.id)) {
        await immichApi(`/libraries/${lib.id}`, apiKey, { method: 'DELETE' })
      }
    }

    return null
  },
)
