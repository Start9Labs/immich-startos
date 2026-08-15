import { z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import {
  FILEBROWSER_MOUNTPOINT,
  getOrMintApiKey,
  immichApi,
  NEXTCLOUD_MOUNTPOINT,
} from '../utils'

const { InputSpec, Value, List, Variants } = sdk

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
type ExposedSources =
  { filebrowser: boolean; nextcloud: boolean } | null | undefined

// The variant set is chosen at render time, so the form infers `source` as
// `{ selection: string; value: any }`. Parsing narrows it back.
const sourceValue = z.discriminatedUnion('selection', [
  z.object({
    selection: z.literal('filebrowser'),
    value: z.object({ folders: z.array(z.string()) }),
  }),
  z.object({
    selection: z.literal('nextcloud'),
    value: z.object({ user: z.string(), folders: z.array(z.string()) }),
  }),
  z.object({
    selection: z.literal('custom'),
    value: z.object({ paths: z.array(z.string()) }),
  }),
])
type SourceValue = z.infer<typeof sourceValue>

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

// Anything that isn't wholly a connected source's folders falls through to
// custom, verbatim, so a round-trip never loses a path.
function parseLibrary(
  importPaths: string[],
  exposed: ExposedSources,
): SourceValue {
  const fbPrefix = `${FILEBROWSER_MOUNTPOINT}/`
  const ncRoot = `${NEXTCLOUD_MOUNTPOINT}/data/`

  if (importPaths.length > 0 && exposed?.filebrowser) {
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

  if (importPaths.length > 0 && exposed?.nextcloud) {
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

// `minLength: null` so a freshly-switched variant starts with zero rows —
// an auto-created row inherits the value of the sibling row it replaced.
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
    // The startup-cached list, unioned with users any existing library
    // references, so a library whose user is not cached does not lose it.
    user: Value.dynamicSelect(async ({ effects }) => {
      const apiKey = await getOrMintApiKey(effects)
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
  // The library ids Immich had when this form was rendered. Deletion is scoped
  // to these, so a library created in Immich's own UI (or another session)
  // after the form opened isn't destroyed by a save that never showed it.
  knownIds: Value.hidden(z.array(z.string()).nullish()),
  externalLibraries: Value.list(
    sdk.List.obj(
      { name: i18n('External Libraries') },
      {
        displayAs: '{{name}}',
        spec: InputSpec.of({
          // Null on a newly added row, which is what makes it a create on save.
          id: Value.hidden(z.string().nullish()),
          owner: Value.dynamicSelect(async ({ effects }) => {
            const apiKey = await getOrMintApiKey(effects)
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
          // Custom paths is always offered, so every library maps to a variant.
          source: Value.dynamicUnion(async ({ effects }) => {
            const exposed = await storeJson.read((s) => s.exposedSources).once()

            const variants: Record<string, { name: string; spec: any }> = {}
            if (exposed?.filebrowser) variants.filebrowser = filebrowserVariant
            if (exposed?.nextcloud) variants.nextcloud = nextcloudVariant
            variants.custom = customVariant

            return {
              name: i18n('Source'),
              default: exposed?.filebrowser
                ? 'filebrowser'
                : exposed?.nextcloud
                  ? 'nextcloud'
                  : 'custom',
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

  async ({ effects }) => {
    const apiKey = await getOrMintApiKey(effects)
    if (!apiKey) return { knownIds: [], externalLibraries: [] }

    const exposed = await storeJson.read((s) => s.exposedSources).once()
    const libs = await immichApi<ImmichLibrary[]>('/libraries', apiKey)
    return {
      knownIds: libs.map((l) => l.id),
      externalLibraries: libs.map((lib) => ({
        id: lib.id,
        owner: lib.ownerId,
        name: lib.name,
        source: parseLibrary(lib.importPaths, exposed),
      })),
    }
  },

  // Correlate by id: create (no id), update in place (existing id), delete
  // (any rendered library the user removed).
  async ({ effects, input }) => {
    const submitted = input.externalLibraries || []

    const apiKey = await getOrMintApiKey(effects)
    if (!apiKey) {
      throw new Error('Immich is not ready yet (no administrator account).')
    }

    const current = await immichApi<ImmichLibrary[]>('/libraries', apiKey)

    const submittedIds = new Set<string>()
    for (const row of submitted) {
      const importPaths = buildImportPaths(sourceValue.parse(row.source))
      if (row.id) {
        // Immich fixes a library's owner at creation, so it isn't sent.
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

    // Scoped to what the form rendered, so a library created in Immich while it
    // was open is not deleted by a save that never showed it.
    const rendered = new Set(input.knownIds ?? [])
    for (const lib of current) {
      if (submittedIds.has(lib.id) || !rendered.has(lib.id)) continue
      await immichApi(`/libraries/${lib.id}`, apiKey, { method: 'DELETE' })
    }

    return null
  },
)
