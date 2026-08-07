# Immich

## Documentation

- [Immich documentation](https://github.com/immich-app/immich/tree/main/docs/docs) — the upstream documentation source covering the web UI, mobile apps, libraries, machine learning, and the REST API.

## What you get on StartOS

- A full Immich stack — the Immich server, its machine-learning sidecar, a Postgres database with the vector extensions Immich needs, and a Valkey cache — exposed as the **Web UI** interface.
- Photo and video storage on a dedicated `upload` volume, included in StartOS backups (the database is captured separately via `pg_dump`).
- A hardware-acceleration variant (`generic`, `cuda`, `rocm`, `openvino`) chosen **automatically** by StartOS from the GPU it detects — there is no manual picker. NVIDIA GPUs get `cuda`, discrete AMD GPUs get `rocm`, Intel GPUs get `openvino`, and everything else gets the CPU-only `generic`. **Integrated AMD graphics (such as the Radeon 680M in many Ryzen mini-PCs and laptops) deliberately get `generic`, not `rocm`** — ROCm is unreliable on integrated GPUs and would leave machine learning broken. **NVIDIA acceleration also depends on your StartOS image:** the `cuda` variant is used only when StartOS was installed from a `-nvidia` image (which ships the NVIDIA driver); on the standard or `-nonfree` images an NVIDIA card isn't detected and Immich uses `generic`. Immich's machine-learning features (smart search, facial recognition) need a modern CPU — `x86-64-v2` on x86 servers, or any `aarch64` board. On older x86 hardware the machine-learning container won't start, but the rest of Immich keeps working. Immich is resource-intensive: expect substantial CPU and RAM use while it indexes your photo library for the first time.
- Optional integration with **File Browser** and **Nextcloud** as sources for external photo libraries.

## Getting set up

1. Open the **Web UI** interface and create your first account. The first user to sign up becomes the administrator.
2. Run the **Set Primary URL** action and pick which of your Immich URLs you want to advertise to clients. Immich embeds this URL in public share links for albums and assets. On install the `.local` URL is selected for you; change it if you've added a clearnet domain or want public links to use Tor.
3. Install the Immich mobile app on your phone, point it at any of Immich's URLs, and sign in with the account you just created to start backing up photos.

## Using Immich

### Actions

- **Set Primary URL** — pick which Immich URL is advertised as the external domain in public share links. Changes apply on next restart. If the URL you previously chose is later removed (for example, you disable Tor), Immich raises a critical task asking you to pick a new one.
- **Configure SMTP** — turn on email notifications for password resets, album invitations, and the like. You can use StartOS's system SMTP, supply your own credentials, or leave SMTP disabled. Changes apply on next restart.
- **Connect Photo Sources** — choose whether Immich is allowed to read files from **File Browser** and/or **Nextcloud** (the source service must be installed). Turning a source on mounts its files into Immich read-only so they can be used as an external library. This is separate from creating a library on purpose: once a source is connected, any Immich administrator can add their own external library against it from inside Immich (Administration → Libraries) and choose which user owns it — which is how you give another user a library of their own, or set one up without the admin having one. Immich restarts automatically when you save this, so it will be briefly unavailable.
- **Manage External Libraries** — a live editor over Immich's external libraries (available only while Immich is running). It shows the libraries Immich actually has — including any you created in Immich's own admin UI — and changes you make here are applied straight to Immich: adding a row creates a library, editing a row updates it, and **removing a row deletes that library from Immich** (its photo records, not your source files). For each library pick the **Immich User** that owns it from the dropdown (the user whose timeline the photos appear in; defaults to the admin — this can't be changed after the library is created), a **Name**, and the **Source**. The source is **File Browser** or **Nextcloud** (connect it first with Connect Photo Sources; for Nextcloud, also pick the user whose files to read from the dropdown) with a list of one or more **folders**, or **Custom paths** for libraries that span several Nextcloud users, mix sources, or use other paths. Note: the Immich User is _who sees the photos_, while the Nextcloud user is _whose files are read_ — they can differ. Every library Immich has is shown here, including ones you set up in Immich's own UI, so you can manage them from either place.
- **Reset Admin Password** — generate a new random password for the administrator account and display it once. Use this to rotate the password or recover if you've lost it.

### External library notes

External libraries managed from StartOS can only be sourced from File Browser or Nextcloud — for anything else, use Immich's own library settings. Connecting a source makes that service's whole volume readable by every Immich administrator, so only connect sources you're comfortable exposing to your Immich admins. Manage External Libraries and Immich's own library settings are two views of the same libraries, so a change in either place shows up in the other; removing a library from the StartOS action deletes it from Immich outright.

### Things StartOS manages for you

A few Immich settings are reasserted by StartOS on every start and cannot be changed from the Immich admin UI:

- The "new version available" banner is suppressed — StartOS manages Immich updates.
- Immich's own scheduled database dump is disabled — StartOS already captures the database with `pg_dump` as part of its backup flow.
- The external domain is set from the **Set Primary URL** action above.

All other Immich settings — users, storage templates, machine-learning tuning, job queues, jobs, sharing — are configured normally from inside the Immich admin UI.
