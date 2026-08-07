# Updating the upstream version

Immich is pulled in as pinned upstream images — there is no Dockerfile in this repo. Three sources are pinned independently in `startos/manifest/index.ts`: the Immich application itself (which drives both `immich-server` and `immich-machine-learning`), the Postgres sidecar, and the Valkey sidecar.

## Determining the upstream version

### Immich

GitHub: <https://github.com/immich-app/immich>

```sh
gh release view -R immich-app/immich --json tagName -q .tagName
```

The pin is `IMMICH_VERSION` near the top of `startos/manifest/index.ts`. It feeds every `immich-server` and `immich-machine-learning` image tag (`generic`, `cuda`, `rocm`, `openvino`) — bump it in one place and all variants follow.

### Postgres sidecar

The image `ghcr.io/immich-app/postgres` is built by Immich themselves. The pin lives at `images.postgres.source.dockerTag` in `startos/manifest/index.ts`.

**The source of truth is the `database:` image in Immich's own `docker/docker-compose.yml`, at the release tag we ship — not `base-images/postgres/versions.yaml`.**

```sh
gh api "repos/immich-app/immich/contents/docker/docker-compose.yml?ref=v${IMMICH_VERSION}" \
  --jq '.content' | base64 -d | grep 'immich-app/postgres'
```

Match that tag (dropping the `@sha256:…` digest). `base-images` publishes images ahead of — and independently of — what the server release actually deploys and tests against; as of Immich v3.0.2, `versions.yaml` emits `14-vectorchord1.1.1-pgvector0.8.5` while both `v3.0.2` and `main` still pin `14-vectorchord0.4.3-pgvectors0.2.0`. Tracking the YAML instead of the compose file puts users on a database image Immich has never shipped.

The tag encodes `<pg-major>-vectorchord<vc>-pgvectors<pgvecto.rs>` — note `pgvectors` is **pgvecto.rs** (the `vectors` extension), a different extension from pgvector (`vector`), which is always present via the `pgvector/pgvector` base image. Newer base-images tags use `-pgvector<v>` because pgvecto.rs was dropped from the image and the pgvector version surfaced in its place.

**A VectorChord version change is a database migration, not a pin refresh.** Immich validates the extension version at boot (`VECTORCHORD_VERSION_RANGE` in `server/src/constants.ts`) and, if the image's version is newer than what's installed, `DatabaseRepository.updateVectorExtension` automatically drops both vector indexes, runs `ALTER EXTENSION vchord UPDATE`, rewrites the `embedding` columns, and rebuilds the `clip_index` / `face_index` indexes — a long, unattended operation on a real photo library. Do not bump VectorChord across a major (0.x → 1.x) just because a newer tag exists. See `TODO.md`.

### Valkey sidecar

GitHub: <https://github.com/valkey-io/valkey>

```sh
gh release view -R valkey-io/valkey --json tagName -q .tagName
```

To confirm the major-tag flavor (e.g. `9-alpine`) is actually published on Docker Hub:

```sh
curl -fsSL "https://hub.docker.com/v2/repositories/valkey/valkey/tags?page_size=20&ordering=last_updated" | jq -r '.results[].name'
```

The pin lives at `images.valkey.source.dockerTag` in `startos/manifest/index.ts`.

## Applying the bump

1. Bump `IMMICH_VERSION` in `startos/manifest/index.ts`. It drives both the `immich-server` and the `immich-machine-learning` image tags across every variant.
2. The Postgres and Valkey sidecars have independent tags; update `postgres.source.dockerTag` and `valkey.source.dockerTag` in the same manifest only if you intend to bump them.
3. On every Immich version bump, verify the assumptions that `enforceSystemConfigDefaults` (in `startos/utils.ts`) relies on. It writes directly into `system_metadata[system-config]` via `psql` to suppress `newVersionCheck.enabled` and `backup.database.enabled` before any admin account exists. **Do not** replace it with the `/system-config` API (needs an admin key — breaks pre-sign-up) or `IMMICH_CONFIG_FILE` (locks the entire admin UI), and **do not** revert `initializeImmich` to a Postgres-only init — the full core-daemon chain under `runUntilSuccess` exists so Immich creates `system_metadata` before our first write. Confirm:
   - Table `system_metadata (key varchar PK, value jsonb)` still present (`server/src/schema/tables/system-metadata.table.ts`).
   - `SystemMetadataKey.SystemConfig` still equals `'system-config'` (`server/src/enum.ts`).
   - Paths `newVersionCheck.enabled` and `backup.database.enabled` still booleans with the same meaning.
   - Config still stored as a partial merged with defaults (`server/src/utils/config.ts`: `buildConfig`, `updateConfig`).

   If any of those move, update `enforceSystemConfigDefaults` accordingly.
