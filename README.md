<p align="center">
  <img src="icon.png" alt="Immich Logo" width="21%">
</p>

# Immich on StartOS

> **Upstream docs:** <https://immich.app/docs>
>
> Everything not listed in this document should behave the same as upstream
> Immich v2.5.2. If a feature, setting, or behavior is not mentioned
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
| Immich Server | `ghcr.io/immich-app/immich-server:v2.5.2` |
| Immich ML | `ghcr.io/immich-app/immich-machine-learning:v2.5.2` |
| PostgreSQL | `ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0` |
| Valkey | `valkey/valkey:9-alpine` |
| Architectures | x86_64, aarch64 |
| Runtime | Four containers (Server + ML + PostgreSQL + Valkey) |

All images are upstream unmodified. PostgreSQL uses Immich's custom image with vector extensions for similarity search.

---

## Volume and Data Layout

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `upload` | `/usr/src/app/upload` | Photo and video storage |
| `db` | `/var/lib/postgresql/data` | PostgreSQL database |
| `model-cache` | `/cache` | Machine learning model cache |
| `startos` | — | StartOS-managed state (`store.json`) |

**StartOS-specific files:**

- `store.json` — PostgreSQL password, SMTP settings, external library configurations

---

## Installation and First-Run Flow

| Step | Upstream | StartOS |
|------|----------|---------|
| Installation | Docker Compose setup | Install from marketplace |
| First user | Register via web UI (becomes admin) | Same as upstream |
| External libraries | Configure via Settings > External Libraries | Use "Manage External Libraries" action |

**First-run steps:**

1. Install Immich from StartOS marketplace
2. Access the web UI
3. Register your account (first user becomes administrator)
4. Install mobile apps and configure backup
5. Optionally configure external libraries via action

---

## Configuration Management

### Settings Managed via StartOS Actions

| Setting | Action | Description |
|---------|--------|-------------|
| SMTP | Configure SMTP | Email notifications |
| External Libraries | Manage External Libraries | Index photos from File Browser or Nextcloud |
| Admin Password | Reset Admin Password | Generate new admin credentials |

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

| Dependency | Required | Purpose |
|------------|----------|---------|
| File Browser | Optional | External library source for photos |
| Nextcloud | Optional | External library source for photos |

Dependencies are only needed if you want to index photos stored in those services.

---

## Backups and Restore

**Included in backup:**

- `startos` volume — Configuration and credentials
- `upload` volume — All photos and videos
- `db` volume — PostgreSQL database (metadata, users, albums)

**NOT included in backup:**

- `model-cache` volume — ML models are re-downloaded as needed

**Restore behavior:**

- All photos, albums, and metadata restored
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
3. **No hardware transcoding** — GPU acceleration not available
4. **No custom upload paths** — Upload location is fixed

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
upstream_version: 2.5.2
images:
  immich-server: ghcr.io/immich-app/immich-server:v2.5.2
  immich-ml: ghcr.io/immich-app/immich-machine-learning:v2.5.2
  postgres: ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0
  valkey: valkey/valkey:9-alpine
architectures: [x86_64, aarch64]
volumes:
  upload: /usr/src/app/upload
  db: /var/lib/postgresql/data
  model-cache: /cache
  startos: (StartOS state)
ports:
  ui: 2283
dependencies:
  filebrowser: optional (external library source)
  nextcloud: optional (external library source)
actions:
  - configure-smtp (enabled, any)
  - external-libraries (enabled, any)
  - reset-admin-password (enabled, only-running)
health_checks:
  - pg_isready (postgres)
  - valkey-cli ping (valkey)
  - port_listening: 3003 (immich-ml)
  - port_listening: 2283 (immich-server, 40s grace)
backup_volumes:
  - startos
  - upload
  - db
excluded_from_backup:
  - model-cache (re-downloaded as needed)
not_available:
  - Arbitrary external library paths
  - Hardware transcoding (GPU)
  - Custom upload paths
```
