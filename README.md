<p align="center">
  <img src="icon.svg" alt="Immich Logo" width="21%">
</p>

# Immich on StartOS

> Everything not listed in this document should behave the same as upstream
> Immich. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Immich](https://github.com/immich-app/immich) is a self-hosted photo and video library with machine-learning search, face recognition, and mobile apps. This package runs the whole four-container stack, ships one build per accelerator, and can read another StartOS service's files as an external library without copying them.

- **Upstream repo:** <https://github.com/immich-app/immich>
- **Wrapper repo:** <https://github.com/Start9Labs/immich-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Four upstream images, unmodified — and **StartOS picks the accelerator build for you**, the most hardware-specific variant compatible with the machine.

| Variant    | Machine-learning image | Architectures   | Declared for                              |
| ---------- | ---------------------- | --------------- | ----------------------------------------- |
| `generic`  | CPU build              | x86_64, aarch64 | Everything else — the sole fallback       |
| `cuda`     | CUDA build             | x86_64          | Any NVIDIA GPU                            |
| `rocm`     | ROCm build             | x86_64          | A discrete AMD GPU on the `amdgpu` driver |
| `openvino` | OpenVINO build         | x86_64          | An Intel GPU on the `i915` driver         |

**Only the machine-learning image differs between variants.** The server image is the same in all four; what changes with the variant is whether `nvidiaContainer` is declared on it and which hardware requirement gates the install. The other two images — PostgreSQL and Valkey — never vary.

| Subcontainer    | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| `immich-server` | The application and API — the one to `attach` to         |
| `immich-ml`     | Machine learning: search embeddings and face recognition |
| `postgres`      | Immich's database, on a vector-extension build           |
| `valkey`        | The job queue and cache                                  |

The server and ML containers both run with `runAsInit`, since each image supervises its own processes. The server waits on all three of the others; nothing else is ordered.

**Integrated AMD GPUs are excluded on purpose.** The `rocm` requirement matches discrete families by product name — Navi, Radeon RX, Radeon VII, Instinct — because ROCm is unreliable on integrated Radeon; those machines fall back to `generic` and run inference on CPU. The match is a positive allowlist rather than an iGPU exclusion because StartOS's regex engine has no lookahead.

## Volume and Data Layout

Four volumes, and the split matters for what a backup costs.

| Volume        | Mount Point                      | Purpose                                                  |
| ------------- | -------------------------------- | -------------------------------------------------------- |
| `upload`      | `/usr/src/app/upload` (server)   | Every photo and video you have uploaded, plus thumbnails |
| `db`          | `/var/lib/postgresql` (postgres) | The database — albums, faces, metadata, search index     |
| `model-cache` | `/cache` (immich-ml)             | Downloaded ML models                                     |
| `startos`     | — (host side)                    | `store.json`; never mounted into a container             |

An external library's source volume is additionally mounted into the **server** container, **read-only** — File Browser's at `/mnt/filebrowser`, Nextcloud's at `/mnt/nextcloud`. Immich indexes those files in place; it never copies them onto the `upload` volume, and it cannot modify them.

## File Models

One model, and **Immich's own configuration is not a file** — it lives in the database, which is where this package writes it.

| File         | Volume    | Format | Modelled                | Written by                                   |
| ------------ | --------- | ------ | ----------------------- | -------------------------------------------- |
| `store.json` | `startos` | JSON   | Yes — `FileHelper.json` | Install, every init, `main`, and the actions |

| Key                | Purpose                                                                        |
| ------------------ | ------------------------------------------------------------------------------ |
| `postgresPassword` | Generated at install; also the credential the backup's dump authenticates with |
| `primaryUrl`       | The address Immich advertises as its external domain                           |
| `smtp`             | System SMTP, your own server, or disabled                                      |
| `exposedSources`   | **The sole authority** for which dependency volumes get mounted                |
| `apiKey`           | A package-owned Immich API key, in plaintext — Immich stores only its hash     |
| `nextcloudUsers`   | Cached usernames, because the action context cannot see the mount              |

`externalLibraries` is a superseded key, read only by the `3.1.0:1` migration that moved authority to `exposedSources`.

### Settings written straight to the database

Immich reads its configuration once at bootstrap, out of `system_metadata`. Two settings are held off by writing that row **directly in PostgreSQL** rather than through Immich's API:

| Setting           | Held | Why                                                                                                    |
| ----------------- | ---- | ------------------------------------------------------------------------------------------------------ |
| `newVersionCheck` | off  | Updates arrive as StartOS package versions, not from upstream                                          |
| `backup.database` | off  | StartOS takes the database dump; Immich's own dumps would duplicate it onto the volume being backed up |

**The direct write exists because the API cannot be used yet.** Immich's config endpoint is admin-key-gated, and on a fresh install there is no admin until you complete sign-up — so a write through the API could never run before Immich first reads its config. The trade-off is that this bypasses the update API and depends on the schema staying stable, which is why a version bump has a checklist attached.

Everything else Immich exposes is yours, edited in its own admin UI. The package re-asserts only the two above, plus the external domain and SMTP when you have set them.

## Dependencies

Two, both optional, and each declared only while it is switched on as a photo source.

| Dependency    | Kind     | Required when                        |
| ------------- | -------- | ------------------------------------ |
| `filebrowser` | `exists` | File Browser is on as a photo source |
| `nextcloud`   | `exists` | Nextcloud is on as a photo source    |

Both volumes are mounted read-only. `exists` rather than `running`, because Immich reads the files off the volume and does not need the other service up.

## Network Access and Interfaces

One interface, serving the web app, the API, and the mobile apps.

| Interface | Id   | Type | Port | Description                                              |
| --------- | ---- | ---- | ---- | -------------------------------------------------------- |
| Web UI    | `ui` | ui   | 2283 | The Immich web interface for managing your photo library |

The port is bound on the `ui-multi` MultiHost and is not masked. The mobile apps take the same address.

**The primary URL is a separate setting from the addresses.** Immich embeds it in public share links, so it has to be an address that works for whoever you send a link to — see [Set Primary URL](#actions).

## Installation and First-Run Flow

**Install brings the whole stack up once, to completion, before the service ever starts.** That run is what makes Immich apply its database migrations and create `system_metadata`; the enforced defaults are then written into that row, so the suppressed settings are in effect on the very first user-facing boot rather than the second. It is allowed ten minutes.

No credential is shown, and no task is raised on a fresh install. **The first account you create in the web UI becomes the administrator** — Immich's own sign-up flow, not something this package drives.

Init picks the `.local` address as the primary URL when none is set. Several of the package's own oneshots do nothing until that admin exists: creating the package's API key, and pushing the external domain and SMTP into Immich's config all need an admin key, so they no-op and retry on each start until sign-up is done.

## Actions

Five actions in two groups.

### Set Primary URL

Chooses which published address Immich advertises as its external domain.

- **What it changes:** `primaryUrl` in `store.json`; a oneshot pushes it into Immich's config on the next start.
- **Cost:** seconds, then a restart.
- **Repeat safety:** idempotent.
- **This is what public share links are built from.** A link generated while the wrong address was set keeps pointing at that address.

### Configure SMTP

Sets up outbound email for Immich's notifications.

- **What it changes:** `smtp` in `store.json`; pushed into Immich's config on the next start.
- **Cost:** seconds, then a restart.
- **Repeat safety:** idempotent; the form is pre-filled.
- **Choosing "disabled" leaves Immich's existing credentials in place** rather than clearing them — it stops this package managing the setting, it does not turn email off inside Immich.

### Reset Admin Password

Generates a new password for the admin account. Run it when locked out.

- **Cost:** seconds. Only while running, since it goes through Immich's API.
- **Repeat safety:** safe to re-run; each run generates a fresh password.
- **It fails with a clear error if no admin exists yet** — that is the sign-up flow not having been completed, not a fault.

### External Libraries — Connect Photo Sources

Chooses which other StartOS services Immich may read from.

- **What it changes:** `exposedSources` in `store.json`, and through it the package's dependencies and the server container's read-only mounts.
- **Cost:** seconds, then a restart to attach or detach the mount.
- **Repeat safety:** idempotent. Turning a source off detaches the mount; **the files themselves are never touched**, since they belong to the other service.
- **Switching a source on only makes the files reachable.** Immich still has to be told to index them, which is the next action — or the same thing in Immich's own admin UI.

### External Libraries — Manage External Libraries

Creates and removes the Immich libraries that point at those mounted paths.

- **What it changes:** Immich's own library records, through its API.
- **Cost:** seconds. Only while running.
- **Removing a library deletes it from Immich** — its photo records, not the source files.
- **A library's owner is fixed when it is created** and cannot be changed afterwards.
- Nextcloud users are offered from a cached list, because the action cannot see the mount itself.

## Tasks

One task, and it cannot appear on a fresh install.

| Task            | Severity   | Raised when                                      | Cleared when    |
| --------------- | ---------- | ------------------------------------------------ | --------------- |
| Set Primary URL | `critical` | A primary URL was set and is no longer published | The action runs |

Init picks an address when none is stored, so this fires only when one that was in use goes away. `critical` because the stale value keeps being embedded in public share links, which fail for whoever receives them.

## Health Checks

Four checks, and only one is displayed.

| Check           | Displayed       | Method                 | Grace |
| --------------- | --------------- | ---------------------- | ----- |
| `postgres`      | Hidden          | `pg_isready`           | —     |
| `valkey`        | Hidden          | `valkey-cli ping`      | —     |
| `immich-ml`     | Hidden          | Its port is listening  | —     |
| `immich-server` | "Web Interface" | Port 2283 is listening | 40 s  |

The three hidden checks gate the server, which waits on all of them — so a service that sits in "starting" is waiting on something below the only check you can see. PostgreSQL reports `loading` rather than failing while it initialises.

A web-interface failure after the grace period is the application: most often the database refusing the connection, or a migration still running on a large library. The service logs name it.

**A healthy service with search or faces not working is the ML container**, not the server. That is where an accelerator mismatch shows up — the stack runs and serves photos regardless.

## Backups and Restore

Mixed, and the exclusion is the important part.

- **`db` is dumped, not copied.** `Backups.withPgDump` takes a logical dump, authenticating with the password from `store.json`, with the vector extension preloaded so the index types restore.
- **`upload` and `startos` are copied wholesale** — every photo and video you have uploaded, plus the package's own state.
- **`model-cache` is excluded.** The models are re-downloadable, and including them would add gigabytes to every backup for nothing.
- **External library files are never in this backup.** They live on the source service's volume, and that service backs them up.

**Expect this backup to be large** — it is the whole photo library. Restore returns the library, the database and the settings; the ML models re-download on first use.

## Limitations and Differences

1. **The variant is chosen by StartOS, not by you**, from the machine's hardware — and only the ML image varies.
2. **Integrated AMD GPUs fall back to the CPU build** rather than attempting ROCm.
3. **Only `generic` builds for aarch64.** All three accelerator variants are x86_64.
4. **Immich's version check and its own database backups are held off**, written directly into the database rather than through its API.
5. **The first account created is the administrator**, and no credential is generated for you.
6. **Several package features do nothing until sign-up is complete** — the API key, external domain, and SMTP all need an admin to exist.
7. **External library files are read-only and never copied**, so they are not in this package's backup.
8. **A library's owner cannot be changed** after it is created.
9. **Choosing "disabled" SMTP does not clear Immich's existing credentials.**

---

## Quick Reference for AI Consumers

```yaml
package_id: immich
image: ghcr.io/immich-app/immich-server # plus immich-machine-learning, postgres, valkey
architectures:
  - x86_64
  - aarch64 # generic variant only; cuda, rocm and openvino are x86_64
subcontainers:
  - immich-server # the application; the one to attach to
  - immich-ml # machine learning; the only image that varies by variant
  - postgres # vector-extension build
  - valkey # job queue and cache
volumes:
  upload: /usr/src/app/upload (server)
  db: /var/lib/postgresql (postgres)
  model-cache: /cache (immich-ml)
  startos: host side (store.json)
file_models:
  - store.json # Immich's own config lives in its database, not a file
startos_managed_env_vars:
  - POSTGRES_DB
  - POSTGRES_USER
  - POSTGRES_PASSWORD
  - POSTGRES_INITDB_ARGS
  - DB_HOSTNAME
  - DB_USERNAME
  - DB_PASSWORD
  - DB_DATABASE_NAME
  - REDIS_HOSTNAME
  - IMMICH_MACHINE_LEARNING_URL
dependencies: # both optional, exists; declared only while switched on as a photo source
  - filebrowser # /mnt/filebrowser, read-only
  - nextcloud # /mnt/nextcloud, read-only
interfaces:
  ui: { type: ui, port: 2283 }
actions:
  - set-primary-url
  - configure-smtp
  - reset-admin-password # only-running
  - connect-sources # External Libraries group
  - external-libraries # External Libraries group; only-running
tasks:
  - { action: set-primary-url, severity: critical } # only when a set URL stops being published
health_checks:
  - postgres # hidden
  - valkey # hidden
  - immich-ml # hidden
  - immich-server # displayed "Web Interface"
```
