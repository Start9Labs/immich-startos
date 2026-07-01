import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { sourceExposed } from './utils'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const store = await storeJson.read().const(effects)
  const libs = store?.externalLibraries || []
  const exposed = store?.exposedSources

  const deps: T.CurrentDependenciesResult<any> = {}

  if (sourceExposed('filebrowser', exposed, libs)) {
    deps['filebrowser'] = {
      kind: 'exists',
      versionRange: '>=2.63.18:3',
    }
  }
  if (sourceExposed('nextcloud', exposed, libs)) {
    deps['nextcloud'] = {
      kind: 'exists',
      versionRange: '>=33.0.6:1',
    }
  }

  return deps
})
