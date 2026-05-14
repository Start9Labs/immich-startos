# Immich

## Documentation

- [Immich documentation](https://github.com/immich-app/immich/tree/main/docs/docs) — the upstream documentation source covering the web UI, mobile apps, libraries, machine learning, and the REST API.

## What you get on StartOS

- A full Immich stack — the Immich server, its machine-learning sidecar, a Postgres database with the vector extensions Immich needs, and a Valkey cache — exposed as the **Web UI** interface.
- Photo and video storage on a dedicated `upload` volume, included in StartOS backups (the database is captured separately via `pg_dump`).
- A choice of hardware-acceleration variants (`generic`, `cuda`, `rocm`, `openvino`) selected at install — pick the one matching the GPU on your server, or `generic` for CPU-only.
- Optional integration with **File Browser** and **Nextcloud** as sources for external photo libraries.

## Getting set up

1. Open the **Web UI** interface and create your first account. The first user to sign up becomes the administrator.
2. Run the **Set Primary URL** action and pick which of your Immich URLs you want to advertise to clients. Immich embeds this URL in public share links for albums and assets. On install the `.local` URL is selected for you; change it if you've added a clearnet domain or want public links to use Tor.
3. Install the Immich mobile app on your phone, point it at any of Immich's URLs, and sign in with the account you just created to start backing up photos.

## Using Immich

### Actions

- **Set Primary URL** — pick which Immich URL is advertised as the external domain in public share links. Changes apply on next restart. If the URL you previously chose is later removed (for example, you disable Tor), Immich raises a critical task asking you to pick a new one.
- **Configure SMTP** — turn on email notifications for password resets, album invitations, and the like. You can use StartOS's system SMTP, supply your own credentials, or leave SMTP disabled. Changes apply on next restart.
- **Manage External Libraries** — add a read-only photo library backed by another installed StartOS service. Give it a name, pick **File Browser** or **Nextcloud** as the source (the source service must be installed; for Nextcloud, also give the username whose files you want indexed), and the folder path inside that service. Immich creates or updates the library and rescans it on the next restart. Removing a library here removes the StartOS-managed mount; existing assets stay in Immich's database until you delete the library from inside Immich.
- **Reset Admin Password** — generate a new random password for the administrator account and display it once. Use this to rotate the password or recover if you've lost it.

### External library notes

External libraries on StartOS can only be sourced from File Browser or Nextcloud — Immich cannot scan arbitrary filesystem paths on the host. To remove a library entirely, remove it from this action **and** delete it from inside Immich's own library settings.

### Things StartOS manages for you

A few Immich settings are reasserted by StartOS on every start and cannot be changed from the Immich admin UI:

- The "new version available" banner is suppressed — StartOS manages Immich updates.
- Immich's own scheduled database dump is disabled — StartOS already captures the database with `pg_dump` as part of its backup flow.
- The external domain is set from the **Set Primary URL** action above.

All other Immich settings — users, storage templates, machine-learning tuning, job queues, jobs, sharing — are configured normally from inside the Immich admin UI.
