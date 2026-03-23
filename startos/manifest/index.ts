import { setupManifest } from '@start9labs/start-sdk'
import {
  filebrowserDescription,
  installAlert,
  long,
  nextcloudDescription,
  short,
} from './i18n'

export const manifest = setupManifest({
  id: 'immich',
  title: 'Immich',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/Start9Labs/immich-startos/tree/update/040',
  upstreamRepo: 'https://github.com/immich-app/immich',
  marketingUrl: 'https://immich.app',
  donationUrl: 'https://opencollective.com/immich',
  docsUrls: ['https://github.com/immich-app/immich/tree/main/docs/docs'],
  description: { short, long },
  volumes: ['startos', 'upload', 'db', 'model-cache'],
  images: {
    'immich-server': {
      source: {
        dockerTag: 'ghcr.io/immich-app/immich-server:v2.6.1',
      },
      arch: ['x86_64', 'aarch64'],
    },
    'immich-ml': {
      source: {
        dockerTag: 'ghcr.io/immich-app/immich-machine-learning:v2.6.1',
      },
      arch: ['x86_64', 'aarch64'],
    },
    postgres: {
      source: {
        dockerTag:
          'ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0',
      },
      arch: ['x86_64', 'aarch64'],
    },
    valkey: {
      source: {
        dockerTag: 'valkey/valkey:9-alpine',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: installAlert,
  },
  dependencies: {
    filebrowser: {
      description: filebrowserDescription,
      optional: true,
      metadata: {
        title: 'File Browser',
        icon: 'https://raw.githubusercontent.com/Start9Labs/filebrowser-startos/fbf1fefb51cca9731f2a9a9e6f790ca150aa9d04/icon.svg',
      },
    },
    nextcloud: {
      description: nextcloudDescription,
      optional: true,
      metadata: {
        title: 'Nextcloud',
        icon: 'https://raw.githubusercontent.com/Start9Labs/nextcloud-startos/f5025c524301aebe62d9a79ad720223b053e1bf2/icon.svg',
      },
    },
  },
})
