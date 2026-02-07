import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

const { InputSpec, Value, List, Variants } = sdk

const path = Value.text({
  name: i18n('Folder Path'),
  required: true,
  default: null,
  description: i18n(
    'The path to the folder containing your photos and videos.',
  ),
  placeholder: 'e.g. Photos',
  patterns: [
    {
      regex:
        '^(\\.|[a-zA-Z0-9_ -][a-zA-Z0-9_ .-]*|([a-zA-Z0-9_ .-][a-zA-Z0-9_ -]+\\.*)+)(/[a-zA-Z0-9_ -][a-zA-Z0-9_ .-]*|/([a-zA-Z0-9_ .-][a-zA-Z0-9_ -]+\\.*)+)*/?$',
      description: i18n('Must be a valid file path'),
    },
  ],
})

export const inputSpec = InputSpec.of({
  externalLibraries: Value.list(
    List.obj(
      { name: i18n('External Libraries') },
      {
        displayAs: '{{name}}',
        uniqueBy: { all: ['name'] },
        spec: InputSpec.of({
          name: Value.text({
            name: i18n('Name'),
            description: i18n(
              'A unique name to identify this library (e.g. "Family Photos")',
            ),
            placeholder: 'My Photos',
            required: true,
            default: null,
          }),
          source: Value.union({
            name: i18n('Source'),
            default: 'filebrowser',
            description: i18n(
              'The service where your photos and videos are stored',
            ),
            variants: Variants.of({
              nextcloud: {
                name: i18n('Nextcloud'),
                spec: InputSpec.of({
                  user: Value.text({
                    name: i18n('Nextcloud User'),
                    required: true,
                    default: 'admin',
                    description: i18n(
                      'The Nextcloud user account that owns the files.',
                    ),
                    placeholder: 'e.g. admin',
                    patterns: [
                      {
                        regex: '^[a-zA-Z0-9-.]+$',
                        description: i18n(
                          'May only contain alphanumeric characters, hyphens, and periods.',
                        ),
                      },
                    ],
                  }),
                  path,
                }),
              },
              filebrowser: {
                name: i18n('File Browser'),
                spec: InputSpec.of({
                  path,
                }),
              },
            }),
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
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    externalLibraries:
      (await storeJson.read((s) => s.externalLibraries).once()) || [],
  }),

  async ({ effects, input }) =>
    storeJson.merge(effects, {
      externalLibraries: input.externalLibraries,
    }),
)
