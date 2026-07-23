# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `immich`.** A multi-container stack — `createCoreSubs` in `startos/utils.ts` builds four subcontainers (`postgres`, `valkey`, `immich-ml`, `immich-server`) shared by install (`initializeImmich`) and runtime (`main`). Consumes File Browser and Nextcloud as optional dependencies (external photo-library sources).
- **Variant package.** Builds `generic`/`cuda`/`rocm`/`openvino` flavors selected by the `VARIANT` env var. The pre-`include` `Makefile` overrides (`TARGETS`, `ARCHES`, and the `<variant>-<arch>` leaf rules) drive the release matrix and must stay ahead of the `include` line. Only the machine-learning image differs between variants.
- **StartOS-enforced Immich settings are written straight to the DB.** `enforceSystemConfigDefaults` (`startos/utils.ts`) upserts `system_metadata[system-config]` via `psql`, bypassing Immich's admin-key-gated API so it applies before the user completes sign-up (`newVersionCheck.enabled=false`, `backup.database.enabled=false`). This depends on Immich's DB schema staying stable — re-verify the `system_metadata` shape on every upstream version bump.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach immich -n immich-server -- <cmd>`. This package has several subcontainers (`postgres`, `valkey`, `immich-ml`, `immich-server`), so a selector is **required** — select by **name** with `-n` (the name passed to `SubContainer.of` in `startos/utils.ts`, e.g. `-n immich-server`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
