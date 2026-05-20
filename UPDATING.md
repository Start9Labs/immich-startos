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

The image `ghcr.io/immich-app/postgres` is built by Immich themselves. The canonical version list lives in their base-images repo.

GitHub: <https://github.com/immich-app/base-images>

```sh
gh api repos/immich-app/base-images/contents/postgres/versions.yaml --jq '.content' | base64 -d
```

That YAML lists the supported Postgres majors plus the VectorChord and pgvector(s) component versions. The Docker tag format is `<pg-major>-vectorchord<vc>-pgvectors<pv>` (older variant; newer images may use `pgvector` instead of `pgvectors` — match whatever the file emits). The pin lives at `images.postgres.source.dockerTag` in `startos/manifest/index.ts`.

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
