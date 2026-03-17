## How the upstream version is pulled
- dockerTags in `startos/manifest/index.ts`:
  - `ghcr.io/immich-app/immich-server:v<version>`
  - `ghcr.io/immich-app/immich-machine-learning:v<version>`
- Both must be updated together. Sidecar images (postgres, valkey) have independent versions.
