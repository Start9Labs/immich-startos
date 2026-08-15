import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

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

  async ({ effects }) => {
    const exposed = await storeJson.read((s) => s.exposedSources).once()
    return {
      filebrowser: !!exposed?.filebrowser,
      nextcloud: !!exposed?.nextcloud,
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
