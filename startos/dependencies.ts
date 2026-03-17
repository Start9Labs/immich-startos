import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const libs =
    (await storeJson.read((s) => s.externalLibraries).const(effects)) || []

  const deps: T.CurrentDependenciesResult<any> = {}

  if (libs.some((l) => l.source.selection === 'filebrowser')) {
    deps['filebrowser'] = {
      kind: 'exists',
      versionRange: '>=2.62.1:0-beta.0',
    }
  }
  if (libs.some((l) => l.source.selection === 'nextcloud')) {
    deps['nextcloud'] = {
      kind: 'exists',
      versionRange: '>=33.0.0:0-beta.0',
    }
  }

  return deps
})
