import { T } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'
import {
  filebrowserDescription,
  nextcloudDescription,
  nextexplorerDescription,
} from './manifest/i18n'
import { sdk } from './sdk'

const exposed =
  (source: 'nextexplorer' | 'filebrowser' | 'nextcloud') =>
  async ({ effects }: { effects: T.Effects }) =>
    (await storeJson.read((s) => s.exposedSources?.[source]).const(effects)) ??
    false

export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.optional('nextexplorer', {
      description: nextexplorerDescription,
      metadata: {
        title: 'NextExplorer',
        icon: 'https://raw.githubusercontent.com/Start9Labs/nextexplorer-startos/04f7ecbfc31ad2205e0222dd7568fb881aa06c79/icon.svg',
      },
      versionRange: '>=2.2.7:0',
      kind: 'exists',
      enabled: exposed('nextexplorer'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('filebrowser', {
      description: filebrowserDescription,
      metadata: {
        title: 'FileBrowser Quantum',
        icon: 'https://raw.githubusercontent.com/Start9Labs/filebrowser-quantum-startos/e936a6c85a97b930b43cad5e9c0dd4898a2df567/icon.svg',
      },
      versionRange: '>=2.63.18:3',
      kind: 'exists',
      enabled: exposed('filebrowser'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('nextcloud', {
      description: nextcloudDescription,
      metadata: {
        title: 'Nextcloud',
        icon: 'https://raw.githubusercontent.com/Start9Labs/nextcloud-startos/f5025c524301aebe62d9a79ad720223b053e1bf2/icon.svg',
      },
      versionRange: '>=33.0.6:1',
      kind: 'exists',
      enabled: exposed('nextcloud'),
    }),
  )
