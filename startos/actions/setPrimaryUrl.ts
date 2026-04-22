import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getNonLocalUrls } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const urls = await getNonLocalUrls(effects)

    return {
      name: i18n('URL'),
      values: urls.reduce(
        (obj, url) => ({ ...obj, [url]: url }),
        {} as Record<string, string>,
      ),
      default: '',
    }
  }),
})

export const setPrimaryUrl = sdk.Action.withInput(
  // id
  'set-primary-url',

  // metadata
  async ({ effects }) => ({
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose which of your Immich URLs should be advertised as the external domain. Immich uses this URL when generating public share links for albums and assets. Changes apply on next restart.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => ({
    url: (await storeJson.read((s) => s.primaryUrl).once()) || undefined,
  }),

  // the execution function
  async ({ effects, input }) =>
    storeJson.merge(effects, { primaryUrl: input.url }),
)
