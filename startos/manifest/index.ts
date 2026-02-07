import { setupManifest } from '@start9labs/start-sdk'
import { short, long, installAlert } from './i18n'

export const manifest = setupManifest({
  id: 'immich',
  title: 'Immich',
  license: 'AGPL-3.0',
  wrapperRepo: 'https://github.com/Start9Labs/immich-startos',
  upstreamRepo: 'https://github.com/immich-app/immich',
  supportSite: 'https://github.com/immich-app/immich/discussions',
  marketingSite: 'https://immich.app',
  donationUrl: 'https://opencollective.com/immich',
  docsUrl: 'https://immich.app/docs',
  description: { short, long },
  volumes: ['startos', 'upload', 'db', 'model-cache'],
  images: {
    'immich-server': {
      source: {
        dockerTag: 'ghcr.io/immich-app/immich-server:v2.5.2',
      },
      arch: ['x86_64', 'aarch64'],
    },
    'immich-ml': {
      source: {
        dockerTag: 'ghcr.io/immich-app/immich-machine-learning:v2.5.2',
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
      description: 'Used to index photos and videos from File Browser',
      optional: true,
      metadata: {
        title: 'File Browser',
        icon: 'https://raw.githubusercontent.com/Start9Labs/filebrowser-startos/refs/heads/master/icon.png',
      },
    },
    nextcloud: {
      description: 'Used to index photos and videos from Nextcloud',
      optional: true,
      metadata: {
        title: 'Nextcloud',
        icon: 'https://raw.githubusercontent.com/Start9Labs/nextcloud-startos/refs/heads/master/icon.png',
      },
    },
  },
})
