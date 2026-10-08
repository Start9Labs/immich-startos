import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

const variant = process.env.VARIANT || 'generic'

type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> }
const mutable = <T>(value: T): Mutable<T> => value as Mutable<T>

const IMMICH_VERSION = 'v3.2.4'

const mlImageConfigs = {
  generic: {
    source: {
      dockerTag: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}`,
    },
    arch: ['x86_64', 'aarch64'],
    nvidiaContainer: false,
    emulateMissing: false,
  },
  cuda: {
    source: {
      dockerTag: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}-cuda`,
    },
    arch: ['x86_64'],
    nvidiaContainer: true,
    emulateMissing: false,
  },
  rocm: {
    source: {
      dockerTag: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}-rocm`,
    },
    arch: ['x86_64'],
    nvidiaContainer: false,
    emulateMissing: false,
  },
  openvino: {
    source: {
      dockerTag: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}-openvino`,
    },
    arch: ['x86_64'],
    nvidiaContainer: false,
    emulateMissing: false,
  },
} as const

const serverImageConfigs = {
  generic: {
    source: { dockerTag: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}` },
    arch: ['x86_64', 'aarch64'],
    nvidiaContainer: false,
    emulateMissing: false,
  },
  cuda: {
    source: { dockerTag: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}` },
    arch: ['x86_64'],
    nvidiaContainer: true,
    emulateMissing: false,
  },
  rocm: {
    source: { dockerTag: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}` },
    arch: ['x86_64'],
    nvidiaContainer: false,
    emulateMissing: false,
  },
  openvino: {
    source: { dockerTag: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}` },
    arch: ['x86_64'],
    nvidiaContainer: false,
    emulateMissing: false,
  },
} as const

// ROCm is unreliable on integrated Radeon (e.g. the 680M in Ryzen APUs), so
// match only discrete AMD GPUs by product name. StartOS's regex engine has no
// lookahead, so this is a positive allowlist rather than an iGPU exclusion.
const AMD_DISCRETE_GPU =
  '(?i)(Navi\\s*\\d+|Radeon\\s*RX\\s*\\d{3}|Radeon\\s*RX\\s*Vega|Radeon\\s*VII|Instinct)'

// hardwareRequirements per accelerator variant. StartOS auto-selects the most
// hardware-specific compatible variant per host; variants without an entry here
// (generic) carry no device requirement and act as the CPU fallback.
const hwDevices = {
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
      product: AMD_DISCRETE_GPU,
      vendor: null,
      driver: 'amdgpu',
      description:
        'A discrete AMD GPU supported by ROCm (integrated Radeon graphics are not supported)',
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
      emulateMissing: false,
    },
    valkey: {
      source: {
        dockerTag: 'valkey/valkey:9-alpine',
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
  hardwareAcceleration: true,
  hardwareRequirements: {
    device: [...(hwDevices[variant as keyof typeof hwDevices] ?? [])],
  },
})
