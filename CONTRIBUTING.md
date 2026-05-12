# Contributing

This repo packages [Immich](https://github.com/immich-app/immich) for StartOS.

## Documentation — keep it in sync

- **`README.md`** — what this package is and how it's built (image, volumes, interfaces). For developers and AI assistants.
- **`instructions.md`** — the user-facing instructions packed into the `.s9pk` and shown on the **Instructions** tab in StartOS, for the person running the service.
- **`CONTRIBUTING.md`** — this file.
- **`CLAUDE.md`** — operating rules for AI developers working in this repo.

**Any code change that warrants it must update `README.md` and `instructions.md` in the same change** — a new or renamed action, an added or removed volume / port / interface / dependency, a changed default, a new limitation, any altered user-visible behavior. Don't defer: a package that ships with a stale README or stale instructions is not done, even if the code is perfect. Content rules live in the packaging guide: [Writing READMEs](https://docs.start9.com/packaging/writing-readmes.html) and [Writing Service Instructions](https://docs.start9.com/packaging/writing-instructions.html).

## Building

See the [StartOS Packaging Guide](https://docs.start9.com/packaging/) for environment setup, then:

```bash
npm ci    # install dependencies
make      # build the universal .s9pk
```

The Makefile builds four hardware-acceleration variants (`generic`, `cuda`, `rocm`, `openvino`); `generic` builds for `x86` and `arm`, the GPU variants for `x86` only.

## Updating the upstream version

Immich is pulled in as pinned upstream images — there is no Dockerfile in this repo.

1. Bump `IMMICH_VERSION` in `startos/manifest/index.ts`. It drives both the `immich-server` and the `immich-machine-learning` image tags across every variant.
2. The Postgres and Valkey sidecars have independent tags; update `postgres.source.dockerTag` and `valkey.source.dockerTag` in the same manifest only if you intend to bump them.
3. On every Immich version bump, verify the assumptions that `enforceSystemConfigDefaults` (in `startos/utils.ts`) relies on. It writes directly into `system_metadata[system-config]` via `psql` to suppress `newVersionCheck.enabled` and `backup.database.enabled` before any admin account exists. **Do not** replace it with the `/system-config` API (needs an admin key — breaks pre-sign-up) or `IMMICH_CONFIG_FILE` (locks the entire admin UI), and **do not** revert `initializeImmich` to a Postgres-only init — the full core-daemon chain under `runUntilSuccess` exists so Immich creates `system_metadata` before our first write. Confirm:
   - Table `system_metadata (key varchar PK, value jsonb)` still present (`server/src/schema/tables/system-metadata.table.ts`).
   - `SystemMetadataKey.SystemConfig` still equals `'system-config'` (`server/src/enum.ts`).
   - Paths `newVersionCheck.enabled` and `backup.database.enabled` still booleans with the same meaning.
   - Config still stored as a partial merged with defaults (`server/src/utils/config.ts`: `buildConfig`, `updateConfig`).
   If any of those move, update `enforceSystemConfigDefaults` accordingly.
4. Update `version` and `releaseNotes` in the file under `startos/versions/`, renaming it to the new version string. A *new* version file is only needed when the bump carries an `up`/`down` migration, or when you want the old release notes preserved in git history — see [Versions](https://docs.start9.com/packaging/versions.html).
5. Rebuild (`make`), sideload the `.s9pk`, and confirm Immich starts cleanly and the suppressed settings still take effect on a fresh install.
6. Review `README.md` and `instructions.md` for anything the bump changed.

## How to contribute

1. Fork the repository and create a branch from `master`.
2. Make your changes — including the doc updates above.
3. Open a pull request to `master`.
