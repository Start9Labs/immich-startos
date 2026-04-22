import { setupManifest } from '@start9labs/start-sdk'
import {
  filebrowserDescription,
  installAlert,
  long,
  nextcloudDescription,
  short,
} from './i18n'

const variant = process.env.VARIANT || 'generic'

type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> }
const mutable = <T>(value: T): Mutable<T> => value as Mutable<T>

const IMMICH_VERSION = 'v2.7.5'

const mlImageConfigs = {
  generic: {
    source: {
      dockerTag: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}`,
    },
    arch: ['x86_64', 'aarch64'],
    nvidiaContainer: false,
  },
  cuda: {
    source: {
      dockerTag: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}-cuda`,
    },
    arch: ['x86_64'],
    nvidiaContainer: true,
  },
  rocm: {
    source: {
      dockerTag: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}-rocm`,
    },
    arch: ['x86_64'],
    nvidiaContainer: false,
  },
  openvino: {
    source: {
      dockerTag: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}-openvino`,
    },
    arch: ['x86_64'],
    nvidiaContainer: false,
  },
} as const

const serverImageConfigs = {
  generic: {
    source: { dockerTag: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}` },
    arch: ['x86_64', 'aarch64'],
    nvidiaContainer: false,
  },
  cuda: {
    source: { dockerTag: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}` },
    arch: ['x86_64'],
    nvidiaContainer: true,
  },
  rocm: {
    source: { dockerTag: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}` },
    arch: ['x86_64'],
    nvidiaContainer: false,
  },
  openvino: {
    source: { dockerTag: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}` },
    arch: ['x86_64'],
    nvidiaContainer: false,
  },
} as const

const hwDevices = {
  generic: [],
  cuda: [
    {
      class: 'display' as const,
      product: null,
      vendor: null,
      driver: 'nvidia',
      description: 'An NVIDIA GPU',
    },
  ],
  rocm: [
    {
      class: 'display' as const,
      product: null,
      vendor: null,
      driver: 'amdgpu',
      description: 'An AMD GPU',
    },
  ],
  openvino: [
    {
      class: 'display' as const,
      product: null,
      vendor: null,
      driver: 'i915',
      description: 'An Intel GPU',
    },
  ],
} as const

const variantKey = variant as keyof typeof mlImageConfigs

export const manifest = setupManifest({
  id: 'immich',
  title: 'Immich',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/Start9Labs/immich-startos',
  upstreamRepo: 'https://github.com/immich-app/immich',
  marketingUrl: 'https://immich.app',
  donationUrl: 'https://opencollective.com/immich',
  docsUrls: ['https://github.com/immich-app/immich/tree/main/docs/docs'],
  description: { short, long },
  volumes: ['startos', 'upload', 'db', 'model-cache'],
  images: {
    'immich-server': mutable(
      serverImageConfigs[variantKey] ?? serverImageConfigs.generic,
    ),
    'immich-ml': mutable(mlImageConfigs[variantKey] ?? mlImageConfigs.generic),
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
  hardwareAcceleration: true,
  hardwareRequirements: {
    device: [...(hwDevices[variantKey] ?? hwDevices.generic)],
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
