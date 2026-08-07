import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sourceExposed } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  filebrowser: Value.toggle({
    name: i18n('File Browser'),
    default: false,
    description: i18n(
      'Allow Immich to read photos and videos stored in File Browser.',
    ),
  }),
  nextcloud: Value.toggle({
    name: i18n('Nextcloud'),
    default: false,
    description: i18n(
      'Allow Immich to read photos and videos stored in Nextcloud.',
    ),
  }),
})

export const connectSources = sdk.Action.withInput(
  'connect-sources',

  async ({ effects }) => ({
    name: i18n('Connect Photo Sources'),
    description: i18n(
      'Choose which other StartOS services Immich may read photos and videos from. Turning a source on mounts its files into Immich (read-only) so you can add them as an external library — here or in the Immich admin UI. Immich restarts automatically to apply the change.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('External Libraries'),
    visibility: 'enabled',
  }),

  inputSpec,

  // Reflect the effective state: a source reads as "on" when explicitly exposed
  // OR when a configured library uses it, so existing installs (which carry no
  // explicit flag) don't show their in-use sources as off.
  async ({ effects }) => {
    const store = await storeJson.read().once()
    const libs = store?.externalLibraries || []
    const exposed = store?.exposedSources
    return {
      filebrowser: sourceExposed('filebrowser', exposed, libs),
      nextcloud: sourceExposed('nextcloud', exposed, libs),
    }
  },

  async ({ effects, input }) =>
    storeJson.merge(effects, {
      exposedSources: {
        filebrowser: input.filebrowser,
        nextcloud: input.nextcloud,
      },
    }),
)
