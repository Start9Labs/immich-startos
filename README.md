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

| Property | Value |
|----------|-------|
| Immich Server | `ghcr.io/immich-app/immich-server` |
| Immich ML | `ghcr.io/immich-app/immich-machine-learning` |
| PostgreSQL | `ghcr.io/immich-app/postgres` |
| Valkey | `valkey/valkey` |
| Architectures | x86_64, aarch64 (GPU variants are x86_64 only) |
| Runtime | Four containers (Server + ML + PostgreSQL + Valkey) |

All images are upstream unmodified. PostgreSQL uses Immich's custom image with vector extensions for similarity search.

### Hardware Acceleration Variants

Pick the variant that matches your hardware. Only the machine-learning image differs between variants; server, postgres, and valkey are identical.

| Variant | ML Image Tag Suffix | Requires | Arches | NVIDIA runtime |
|---------|---------------------|----------|--------|----------------|
| `generic` | *(none)* — CPU | — | x86_64, aarch64 | No |
| `cuda` | `-cuda` | NVIDIA GPU | x86_64 | Yes |
| `rocm` | `-rocm` | AMD GPU | x86_64 | No |
| `openvino` | `-openvino` | Intel GPU | x86_64 | No |

**Hardware video transcoding** (NVENC, VAAPI, QSV) is available on any variant whose host has the matching GPU. After install, enable it in **Immich → Administration → Settings → Video Transcoding** and pick the acceleration API. Note: NVENC specifically requires the `cuda` variant (which enables the NVIDIA container runtime); VAAPI and QSV work on any variant via StartOS `/dev/dri` passthrough.

---

## Volume and Data Layout

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `upload` | `/usr/src/app/upload` | Photo and video storage |
| `db` | `/var/lib/postgresql/data` | PostgreSQL database |
| `model-cache` | `/cache` | Machine learning model cache |
| `startos` | — | StartOS-managed state (`store.json`) |

**StartOS-specific files:**

- `store.json` — PostgreSQL password, primary URL, SMTP settings, external library configurations

---

## Installation and First-Run Flow

| Step | Upstream | StartOS |
|------|----------|---------|
| Installation | Docker Compose setup | Install from marketplace |
| First user | Register via web UI (becomes admin) | Same as upstream |
| External libraries | Configure via Settings > External Libraries | Use "Manage External Libraries" action |

**First-run steps:**

1. Install Immich from StartOS marketplace. Install takes a few extra minutes because Immich's database schema is created during install rather than on first boot.
2. Access the web UI — it comes up immediately after install completes.
3. Register your account (first user becomes administrator)
4. Install mobile apps and configure backup
5. Optionally configure external libraries via action

---

## Configuration Management

### Settings Managed via StartOS Actions

| Setting | Action | Description |
|---------|--------|-------------|
| SMTP | Configure SMTP | Email notifications |
| Primary URL | Set Primary URL | External domain used for public share links |
| External Libraries | Manage External Libraries | Index photos from File Browser or Nextcloud |
| Admin Password | Reset Admin Password | Generate new admin credentials |

### Settings Forced by StartOS (not editable in Immich UI)

StartOS reasserts the following values on every startup. Editing them in the Immich Admin UI will not persist across restarts.

| Field | Value | Reason |
|-------|-------|--------|
| `newVersionCheck.enabled` | `false` | StartOS manages Immich updates; suppresses the "new version available" modal |
| `backup.database.enabled` | `false` | StartOS backs up the database via `pg_dump`; Immich's internal dumps are duplicate work |
| `server.externalDomain` | Selected primary URL | Keeps Immich's public share links in sync with a StartOS-known URL |

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

| Interface | Port | Protocol | Purpose |
|-----------|------|----------|---------|
| Web UI | 2283 | HTTP | Immich web interface |

**Access methods (StartOS 0.4.0):**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

**Mobile app connection:** Use any of the above URLs in the Immich mobile app settings.

---

## Actions (StartOS UI)

### Set Primary URL

| Property | Value |
|----------|-------|
| ID | `set-primary-url` |
| Name | Set Primary URL |
| Visibility | Enabled |
| Availability | Any status |
| Purpose | Choose which Immich URL is advertised as the external domain |

Immich embeds its external domain in public share links (albums, assets). This action lets you pick a URL from the available non-local interfaces (LAN IP, `.local`, Tor, custom domains). On first install the `.local` URL is selected by default. If the previously selected URL is removed (e.g., Tor disabled, custom domain deleted), a critical task prompts you to pick a new one.

**Note:** Changes apply on next restart.

### Configure SMTP

| Property | Value |
|----------|-------|
| ID | `configure-smtp` |
| Name | Configure SMTP |
| Visibility | Enabled |
| Availability | Any status |
| Purpose | Enable email notifications |

**Options:**

- **Disabled** — No email notifications
- **System SMTP** — Use StartOS system SMTP server
- **Custom** — Enter your own SMTP credentials

**Note:** Changes apply on next restart.

### Manage External Libraries

| Property | Value |
|----------|-------|
| ID | `external-libraries` |
| Name | Manage External Libraries |
| Visibility | Enabled |
| Availability | Any status |
| Purpose | Index photos from other StartOS services |

**Supported sources:**

- **File Browser** — Index photos from File Browser's data volume
- **Nextcloud** — Index photos from a Nextcloud user's files

**How it works:**

1. Add a library with a name and source
2. Select File Browser or Nextcloud
3. Specify the folder path containing photos
4. Libraries are created/updated and scanned on restart

### Reset Admin Password

| Property | Value |
|----------|-------|
| ID | `reset-admin-password` |
| Name | Reset Admin Password |
| Visibility | Enabled |
| Availability | Only when running |
| Purpose | Generate new admin credentials |

**Output:** Displays the new randomly generated password.

---

## Dependencies

### File Browser

| Property | Value |
|----------|-------|
| Required | Optional |
| Version constraint | `>= 2.62.2` |
| Health checks | None |
| Mounted volumes | `data` → `/mnt/filebrowser` (read-only) |
| Purpose | External library source for indexing photos stored in File Browser |

### Nextcloud

| Property | Value |
|----------|-------|
| Required | Optional |
| Version constraint | `>= 32.0.7` |
| Health checks | None |
| Mounted volumes | `nextcloud` → `/mnt/nextcloud` (read-only) |
| Purpose | External library source for indexing photos stored in Nextcloud |

Dependencies are only needed if you configure external libraries pointing to those services.

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

| Check | Display Name | Method |
|-------|--------------|--------|
| PostgreSQL | (internal) | `pg_isready` |
| Valkey | (internal) | `valkey-cli ping` |
| Machine Learning | (internal) | Port 3003 listening |
| Web Interface | Web Interface | Port 2283 listening (40s grace) |

**Messages:**

- Success: "The web interface is ready"
- Error: "The web interface is not ready"

---

## Limitations and Differences

1. **External libraries limited to StartOS services** — Can only index from File Browser or Nextcloud (not arbitrary filesystem paths)
2. **SMTP via action** — Configure through StartOS action rather than Immich web UI
3. **No custom upload paths** — Upload location is fixed
4. **Upstream version-check banner suppressed** — StartOS manages Immich updates, so `newVersionCheck.enabled` is forced to `false` in the system config on every startup to hide the "new version available" modal.
5. **Immich's internal database backup disabled** — `backup.database.enabled` is forced to `false` because StartOS already dumps the database via `pg_dump` during its backup flow.
6. **External domain managed via action** — `server.externalDomain` is set to the URL selected in the Set Primary URL action; editing it in the Immich Admin UI does not persist.

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: immich
images:
  immich-server: ghcr.io/immich-app/immich-server
  immich-ml: ghcr.io/immich-app/immich-machine-learning
  postgres: ghcr.io/immich-app/postgres
  valkey: valkey/valkey
architectures: [x86_64, aarch64]  # GPU variants (cuda, rocm, openvino) are x86_64 only
variants: [generic, cuda, rocm, openvino]
volumes:
  upload: /usr/src/app/upload
  db: /var/lib/postgresql/data
  model-cache: /cache
  startos: (StartOS state)
ports:
  ui: 2283
dependencies:
  filebrowser: optional (external library source, >= 2.62.2)
  nextcloud: optional (external library source, >= 32.0.7)
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
  - external-libraries (enabled, any)
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
