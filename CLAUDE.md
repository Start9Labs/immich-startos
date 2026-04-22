## How the upstream version is pulled
- `IMMICH_VERSION` constant in `startos/manifest/index.ts` drives both:
  - `ghcr.io/immich-app/immich-server:<IMMICH_VERSION>`
  - `ghcr.io/immich-app/immich-machine-learning:<IMMICH_VERSION>[-<variant-suffix>]`
- Update the single `IMMICH_VERSION` constant; all variants pick it up. Sidecar images (postgres, valkey) have independent versions.

## Variants (hardware acceleration)
- Built via `TARGETS := generic cuda rocm openvino` in the `Makefile`. Each variant selects a different machine-learning image and sets `nvidiaContainer` / `hardwareRequirements` appropriately.
- `generic` builds for x86 + arm; GPU variants (`cuda`, `rocm`, `openvino`) are x86-only.
- Hardware video transcoding (VAAPI / QSV / NVENC) is available via `hardwareAcceleration: true` at the manifest level. Users enable it in Immich's Settings → Video Transcoding.
