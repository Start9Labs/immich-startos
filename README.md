<p align="center">
  <img src="icon.svg" alt="Immich Logo" width="21%">
</p>

# Immich on StartOS

> **Upstream docs:** <https://docs.immich.app/overview/quick-start/>
>
> Everything not listed in this document should behave the same as upstream
> Immich. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

[Immich](https://github.com/immich-app/immich) is a self-hosted photo and video backup solution with automatic mobile device backup, machine learning-powered search, face recognition, and a modern web interface.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Dependencies](#dependencies)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                               |
| ------------- | --------------------------------------------------- |
| Immich Server | `ghcr.io/immich-app/immich-server`                  |
| Immich ML     | `ghcr.io/immich-app/immich-machine-learning`        |
| PostgreSQL    | `ghcr.io/immich-app/postgres`                       |
| Valkey        | `valkey/valkey`                                     |
| Architectures | x86_64, aarch64 (GPU variants are x86_64 only)      |
| Runtime       | Four containers (Server + ML + PostgreSQL + Valkey) |

All images are upstream unmodified. PostgreSQL uses Immich's custom image with vector extensions for similarity search.

### Hardware Acceleration Variants

StartOS selects the variant **automatically** from the GPU it detects on the host (via each variant's manifest `hardwareRequirements`); there is no manual picker. Only the machine-learning image differs between variants; server, postgres, and valkey are identical.

| Variant    | ML Image Tag Suffix | Auto-selected for                                           | Arches          | NVIDIA runtime |
| ---------- | ------------------- | ----------------------------------------------------------- | --------------- | -------------- |
| `generic`  | _(none)_ — CPU      | Any host with no matching GPU (default)                     | x86_64, aarch64 | No             |
| `cuda`     | `-cuda`             | NVIDIA GPU (`nvidia` driver)                                | x86_64          | Yes            |
| `rocm`     | `-rocm`             | Discrete AMD GPU (`amdgpu` driver, Navi/Radeon RX/Instinct) | x86_64          | No             |
| `openvino` | `-openvino`         | Intel GPU (`i915` driver)                                   | x86_64          | No             |

**AMD GPUs — discrete only:** the `rocm` variant is offered only to _discrete_ AMD GPUs. ROCm's MIGraphX backend crashes during model compilation on integrated Radeon graphics (e.g. the Radeon 680M in Ryzen APUs), so those hosts get the CPU-only `generic` variant instead. Selection matches the GPU product name in `rocm`'s `hardwareRequirements`, so a discrete card StartOS doesn't recognize also falls back to `generic` — sideload the `-rocm` s9pk manually if you need GPU ML on such a card.

**NVIDIA GPUs — `-nvidia` flavor only:** the `cuda` variant (and NVENC transcoding) require StartOS to be installed from a `-nvidia` platform flavor (`x86_64-nvidia` / `aarch64-nvidia`), which bundles the NVIDIA driver and container toolkit. On the standard or `-nonfree` flavors the NVIDIA driver is absent, so an NVIDIA card isn't detected — its `nvidia` driver never appears, so the `cuda` variant isn't auto-selected and machine learning falls back to the CPU (`generic`) variant, even with an NVIDIA card physically present.

**Hardware video transcoding** (NVENC, VAAPI, QSV) is available on any variant whose host has the matching GPU. After install, enable it in **Immich → Administration → Settings → Video Transcoding** and pick the acceleration API. Note: NVENC specifically requires the `cuda` variant (which enables the NVIDIA container runtime, and therefore the `-nvidia` flavor above); VAAPI and QSV work on any variant via StartOS `/dev/dri` passthrough.

**Machine-learning CPU requirement:** the machine-learning container requires an `x86-64-v2` CPU (or any `aarch64` host). On older x86 hardware that predates `x86-64-v2`, the machine-learning container fails to start while the server, database, and cache keep running — smart search and facial recognition are lost, but core photo management is not.

---

## Volume and Data Layout

| Volume        | Mount Point                | Purpose                              |
| ------------- | -------------------------- | ------------------------------------ |
| `upload`      | `/usr/src/app/upload`      | Photo and video storage              |
| `db`          | `/var/lib/postgresql/data` | PostgreSQL database                  |
| `model-cache` | `/cache`                   | Machine learning model cache         |
| `startos`     | —                          | StartOS-managed state (`store.json`) |

**StartOS-specific files:**

- `store.json` — PostgreSQL password, primary URL, SMTP settings, which photo sources are connected, and the `startos-managed` Immich API key. External libraries themselves live in Immich's own database, not here.

---

## Installation and First-Run Flow

| Step               | Upstream                                    | StartOS                                |
| ------------------ | ------------------------------------------- | -------------------------------------- |
| Installation       | Docker Compose setup                        | Install from marketplace               |
| First user         | Register via web UI (becomes admin)         | Same as upstream                       |
| External libraries | Configure via Settings > External Libraries | Use "Manage External Libraries" action |

**First-run steps:**

1. Install Immich from StartOS marketplace. Install takes a few extra minutes because Immich's database schema is created during install rather than on first boot.
2. Access the web UI — it comes up immediately after install completes.
3. Register your account (first user becomes administrator)
4. Install mobile apps and configure backup
5. Optionally connect File Browser or Nextcloud via the Connect Photo Sources action, then add libraries against them

---

## Configuration Management

### Settings Managed via StartOS Actions

| Setting            | Action                    | Description                                                                                      |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------ |
| SMTP               | Configure SMTP            | Email notifications                                                                              |
| Primary URL        | Set Primary URL           | External domain used for public share links                                                      |
| Data Sources       | Connect Photo Sources     | Mount File Browser / Nextcloud into Immich (read-only) so they can be used as external libraries |
| External Libraries | Manage External Libraries | Live two-way editor over Immich's external libraries (create/edit/delete, with owner)            |
| Admin Password     | Reset Admin Password      | Generate new admin credentials                                                                   |

### Settings Forced by StartOS (not editable in Immich UI)

StartOS reasserts the following values on every startup. Editing them in the Immich Admin UI will not persist across restarts.

| Field                     | Value                | Reason                                                                                  |
| ------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| `newVersionCheck.enabled` | `false`              | StartOS manages Immich updates; suppresses the "new version available" modal            |
| `backup.database.enabled` | `false`              | StartOS backs up the database via `pg_dump`; Immich's internal dumps are duplicate work |
| `server.externalDomain`   | Selected primary URL | Keeps Immich's public share links in sync with a StartOS-known URL                      |

The first two are enforced from the very first boot. `server.externalDomain` applies once your admin account exists and a URL has been chosen via the Set Primary URL action.

### Settings Managed via Immich Web UI

All other Immich settings are configured through the web interface:

- User management
- Storage templates
- Machine learning settings
- Job queues
- Server settings
- Notification preferences (after SMTP configured)

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose              |
| --------- | ---- | -------- | -------------------- |
| Web UI    | 2283 | HTTP     | Immich web interface |

**Access methods (StartOS 0.4.0):**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

**Mobile app connection:** Use any of the above URLs in the Immich mobile app settings.

---

## Actions (StartOS UI)

Set Primary URL, Configure SMTP, and Connect Photo Sources write `store.json` keys that `main` reads reactively (`.const`), so saving any of them while the service is running re-runs `setupMain` and restarts the daemon chain automatically — there is no manual restart step. All three are available with the service stopped too, in which case the change simply applies on next start. Manage External Libraries and Reset Admin Password act on the live Immich API instead and restart nothing.

### Set Primary URL

| Property     | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| ID           | `set-primary-url`                                            |
| Name         | Set Primary URL                                              |
| Visibility   | Enabled                                                      |
| Availability | Any status                                                   |
| Purpose      | Choose which Immich URL is advertised as the external domain |

Immich embeds its external domain in public share links (albums, assets). This action lets you pick a URL from the available non-local interfaces (LAN IP, `.local`, Tor, custom domains). On first install the `.local` URL is selected by default. If the previously selected URL is removed (e.g., Tor disabled, custom domain deleted), a critical task prompts you to pick a new one.

The saved value is pushed to Immich's `server.externalDomain` by the `apply-system-config` oneshot on the restart that follows.

### Configure SMTP

| Property     | Value                      |
| ------------ | -------------------------- |
| ID           | `configure-smtp`           |
| Name         | Configure SMTP             |
| Visibility   | Enabled                    |
| Availability | Any status                 |
| Purpose      | Enable email notifications |

**Options:**

- **Disabled** — No email notifications
- **System SMTP** — Use StartOS system SMTP server
- **Custom** — Enter your own SMTP credentials

The credentials are pushed to Immich's `notifications.smtp` by the `apply-system-config` oneshot on the restart that follows. Choosing **Disabled** leaves Immich's existing SMTP settings untouched rather than clearing them.

### Connect Photo Sources

| Property     | Value                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| ID           | `connect-sources`                                                                                        |
| Name         | Connect Photo Sources                                                                                    |
| Group        | External Libraries                                                                                       |
| Visibility   | Enabled                                                                                                  |
| Availability | Any status                                                                                               |
| Purpose      | Grant Immich read-only access to another service's files so it can be used as an external library source |

Toggle **File Browser** and/or **Nextcloud** on to mount that service's volume read-only into the Immich container (`/mnt/filebrowser`, `/mnt/nextcloud`). This is the **prerequisite** for using a source as an external library — a source must be connected here before it can be selected anywhere:

- In **Manage External Libraries**, only connected sources appear as options; unconnected ones are not offered.
- In the **Immich admin UI** (Administration → Libraries), **any Immich admin can create their own external library** against a connected source, choosing the owning user themselves. This is the way to give a non-admin user a library owned by them, or to set one up without the admin wanting one of their own.

Backwards compatibility: upgrading to `3.1.0:1` runs a migration that turns on whichever sources the install's existing libraries already used, so those libraries keep working and there is nothing to do after the update.

Connecting a source mounts the whole volume read-only, so its files are readable by every Immich admin (Immich gates external libraries on admin and does not sandbox paths per-admin). Saving rebuilds the server's mounts on the restart that follows. Disconnecting a source in use does not delete its libraries — their paths simply stop resolving, and they fall back to **Custom paths** in Manage External Libraries.

### Manage External Libraries

| Property     | Value                                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| ID           | `external-libraries`                                                                |
| Name         | Manage External Libraries                                                           |
| Group        | External Libraries                                                                  |
| Visibility   | Enabled                                                                             |
| Availability | Only when running                                                                   |
| Purpose      | Create, edit, and delete external libraries — a live view of Immich's own libraries |

This action is a **live, two-way editor over Immich's external libraries**, not a separate config store:

- It reads the real libraries straight from Immich, so libraries you created in **Immich's admin UI** (Administration → Libraries) also appear here.
- It correlates by Immich library id, so **renaming** edits the library in place (no duplicates) and **removing a row deletes the library** in Immich.
- Each library has an **owner** (the Immich user whose timeline the photos appear in) — set when the library is created and, per Immich, **not changeable afterward**.

Because it talks to the live Immich API, it's only available while the service is running.

**Fields (per library):**

- **Immich User** — a dropdown of your Immich users, fetched live from Immich each time you open the action (so new users appear without a restart); defaults to the admin. Don't confuse this with the Nextcloud user below (whose _files_ are read).
- **Name** — display name.
- **Source** — pick the source, and its folders appear beneath it:
  - **File Browser** — a **Folders** list (one row per folder, e.g. `Photos`).
  - **Nextcloud** — a user dropdown (users discovered on the Nextcloud volume) plus a **Folders** list under that user's files.
  - **Custom paths** — an **Import Paths** list of full paths, for libraries that span multiple Nextcloud users, mix sources, or use paths outside the mounts.

  Only connected sources appear as File Browser / Nextcloud (connect them first via Connect Photo Sources); **Custom paths** is always available. A freshly switched source starts with no folder rows — click **Add** to enter one.

**Every Immich library is shown.** A library maps to File Browser or Nextcloud when all its paths fit a single connected source; anything else (multiple folders across users, mixed sources, unrecognized paths) shows under **Custom paths**. Nothing is silently hidden, and a library added/edited in Immich's own UI — including adding folders — round-trips here. Adding a second folder to a library no longer makes it disappear.

### Reset Admin Password

| Property     | Value                          |
| ------------ | ------------------------------ |
| ID           | `reset-admin-password`         |
| Name         | Reset Admin Password           |
| Visibility   | Enabled                        |
| Availability | Only when running              |
| Purpose      | Generate new admin credentials |

**Output:** Displays the new randomly generated password.

---

## Dependencies

### File Browser

| Property           | Value                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Required           | Optional                                                           |
| Version constraint | `>= 2.63.18:3`                                                     |
| Health checks      | None                                                               |
| Mounted volumes    | `data` → `/mnt/filebrowser` (read-only)                            |
| Purpose            | External library source for indexing photos stored in File Browser |

### Nextcloud

| Property           | Value                                                           |
| ------------------ | --------------------------------------------------------------- |
| Required           | Optional                                                        |
| Version constraint | `>= 33.0.6:1`                                                   |
| Health checks      | None                                                            |
| Mounted volumes    | `nextcloud` → `/mnt/nextcloud` (read-only)                      |
| Purpose            | External library source for indexing photos stored in Nextcloud |

A dependency is pulled in only when its source is connected — either via the **Connect Photo Sources** action or by configuring an external library that uses it.

---

## Backups and Restore

**Database:** Uses `pg_dump`/`pg_restore` for PostgreSQL instead of raw volume rsync. The dump is written directly to the backup target.

**Volumes backed up via rsync:**

- `startos` volume — Configuration and credentials
- `upload` volume — All photos and videos

**NOT included in backup:**

- `db` volume — Not rsynced directly; database is captured via `pg_dump`
- `model-cache` volume — ML models are re-downloaded as needed

**Restore behavior:**

- All photos, albums, and metadata restored
- Database is rebuilt from dump via `pg_restore`
- User accounts preserved
- External library configurations restored (re-scan needed)

---

## Health Checks

| Check            | Display Name  | Method                          |
| ---------------- | ------------- | ------------------------------- |
| PostgreSQL       | (internal)    | `pg_isready`                    |
| Valkey           | (internal)    | `valkey-cli ping`               |
| Machine Learning | (internal)    | Port 3003 listening             |
| Web Interface    | Web Interface | Port 2283 listening (40s grace) |

**Messages:**

- Success: "The web interface is ready"
- Error: "The web interface is not ready"

---

## Limitations and Differences

1. **External library sources** — The Manage External Libraries action offers File Browser and Nextcloud as guided sources (only once connected), plus a **Custom paths** option for anything else. Paths still only resolve to data mounted into the container (File Browser / Nextcloud), so Custom paths is for unusual shapes (multiple users, mixed sources), not arbitrary host directories. Every Immich library is shown and editable here, including ones created in Immich's own UI.
2. **A library pointing at a disconnected source blocks saving the library form** — Immich validates import paths on update and rejects a missing one (`400 Invalid import path: Path does not exist (ENOENT)`). Manage External Libraries `PUT`s every submitted row, so if a source is disconnected while a library still references it, _any_ save of that form fails on that row and no other edit in the same save is applied. Recover by reconnecting the source, or by removing the stale library's row — removed rows are deleted, not `PUT`, so that path still works. Verified on StartOS 0.4.0.1; see `TODO.md`.
3. **SMTP via action** — Configure through StartOS action rather than Immich web UI
4. **No custom upload paths** — Upload location is fixed
5. **Upstream version-check banner suppressed** — StartOS manages Immich updates, so `newVersionCheck.enabled` is forced to `false` in the system config on every startup to hide the "new version available" modal.
6. **Immich's internal database backup disabled** — `backup.database.enabled` is forced to `false` because StartOS already dumps the database via `pg_dump` during its backup flow.
7. **External domain managed via action** — `server.externalDomain` is set to the URL selected in the Set Primary URL action; editing it in the Immich Admin UI does not persist.

---

## What Is Unchanged from Upstream

- Full photo/video backup and management
- Mobile app automatic backup (iOS, Android, F-Droid)
- Machine learning features (face recognition, object detection, smart search)
- Album management and sharing
- Timeline and map views
- Memories and favorites
- User management and permissions
- Partner sharing
- External library scanning (via StartOS services)
- All web UI features
- REST API

---

## Contributing

Build and development workflow follow the StartOS packaging guide: <https://docs.start9.com/packaging>. Keep `README.md`, `instructions.md`, and `AGENTS.md` in sync with any change to user-visible behavior or package structure.

---

## Quick Reference for AI Consumers

```yaml
package_id: immich
images:
  immich-server: ghcr.io/immich-app/immich-server
  immich-ml: ghcr.io/immich-app/immich-machine-learning
  postgres: ghcr.io/immich-app/postgres
  valkey: valkey/valkey
architectures: [x86_64, aarch64] # GPU variants (cuda, rocm, openvino) are x86_64 only
variants: [generic, cuda, rocm, openvino]
volumes:
  upload: /usr/src/app/upload
  db: /var/lib/postgresql/data
  model-cache: /cache
  startos: (StartOS state)
ports:
  ui: 2283
dependencies:
  filebrowser: optional (external library source, >= 2.63.18:3; pulled in when connected)
  nextcloud: optional (external library source, >= 33.0.6:1; pulled in when connected)
startos_managed_env_vars:
  - DB_HOSTNAME
  - DB_USERNAME
  - DB_PASSWORD
  - DB_DATABASE_NAME
  - REDIS_HOSTNAME
  - IMMICH_MACHINE_LEARNING_URL
  - POSTGRES_DB
  - POSTGRES_USER
  - POSTGRES_PASSWORD
  - POSTGRES_INITDB_ARGS
actions:
  - configure-smtp (enabled, any)
  - set-primary-url (enabled, any)
  - connect-sources (enabled, any) # mounts filebrowser/nextcloud volumes read-only; decoupled from library config
  - external-libraries (enabled, only-running) # live two-way mirror of Immich libraries, by id, with owner; deletes on row removal
  - reset-admin-password (enabled, only-running)
startos_forced_system_config:
  newVersionCheck.enabled: false
  backup.database.enabled: false
  server.externalDomain: <primary URL from set-primary-url action>
health_checks:
  - pg_isready (postgres)
  - valkey-cli ping (valkey)
  - port_listening: 3003 (immich-ml)
  - port_listening: 2283 (immich-server, 40s grace)
backup_strategy: pg_dump (db) + volume rsync (startos, upload)
excluded_from_backup:
  - model-cache (re-downloaded as needed)
not_available:
  - Arbitrary external library paths
  - Custom upload paths
```
