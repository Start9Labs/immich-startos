import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const exposed = await storeJson.read((s) => s.exposedSources).const(effects)

  const deps: T.CurrentDependenciesResult<any> = {}

  if (exposed?.filebrowser) {
    deps['filebrowser'] = {
      kind: 'exists',
      versionRange: '>=2.63.18:3',
    }
  }
  if (exposed?.nextcloud) {
    deps['nextcloud'] = {
      kind: 'exists',
      versionRange: '>=33.0.6:1',
    }
  }

  return deps
})
