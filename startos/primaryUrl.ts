import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiHostId, uiInterfaceId } from './utils'

export const primaryUrl = sdk.setupPrimaryUrl({
  id: 'set-primary-url',
  hostId: uiHostId,
  interfaceId: uiInterfaceId,
  metadata: {
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose which of your Immich URLs should be advertised as the external domain. Immich uses this URL when generating public share links for albums and assets. Immich restarts automatically to apply the change.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  field: { name: i18n('URL'), description: null },
  get: storeJson.read((s) => s.primaryUrl),
  set: (effects, url) => storeJson.merge(effects, { primaryUrl: url }),
})
