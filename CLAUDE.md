## Upstream version bumps

Update `IMMICH_VERSION` in `startos/manifest/index.ts`. It drives both `immich-server` and `immich-machine-learning` image tags across all variants. Sidecar images (postgres, valkey) have independent versions.

## Hardware acceleration variants

`TARGETS := generic cuda rocm openvino` in the Makefile. Only the ML image differs between variants. `generic` supports x86+arm; GPU variants are x86-only.

## Enforced defaults via direct DB write

`enforceSystemConfigDefaults` in `startos/utils.ts` writes into `system_metadata[system-config]` via `psql`. **Do not** replace with the `/system-config` API (needs an admin key — breaks pre-sign-up) or `IMMICH_CONFIG_FILE` (locks the entire admin UI). **Do not** revert `initializeImmich` to a postgres-only init — the full core-daemon chain under `runUntilSuccess` exists so Immich creates `system_metadata` before our first write.

On every Immich version bump, verify:

- Table `system_metadata (key varchar PK, value jsonb)` still present — `server/src/schema/tables/system-metadata.table.ts`
- `SystemMetadataKey.SystemConfig` still `'system-config'` — `server/src/enum.ts`
- Paths `newVersionCheck.enabled` and `backup.database.enabled` still booleans with the same meaning
- Config still stored as a partial merged with defaults — `server/src/utils/config.ts` (`buildConfig`, `updateConfig`)

If any change, update `enforceSystemConfigDefaults` accordingly.
