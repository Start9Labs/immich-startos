# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **`cache-nextcloud-users` must stay ordered after `ensure-api-key`.** Both merge into `store.json`, and concurrent merges drop each other's keys.
- **Only the machine-learning image varies by variant.** The server image is identical across all four — what changes is `nvidiaContainer` on it and the hardware requirement gating the install. The AMD match must stay a positive allowlist of discrete families: StartOS's regex engine has no lookahead, so an iGPU exclusion cannot be expressed, and plain `Radeon` would put `rocm` on Ryzen APU graphics.
- **The `Makefile`'s `TARGETS`/`ARCHES` overrides and `<variant>-<arch>` leaf rules must stay above the `include` line**, or the release matrix builds nothing.
- **A "disabled" SMTP selection deliberately leaves Immich's credentials in place.** It stops the package managing the setting; it does not turn email off inside Immich.
- **Talking to the Immich API is usually easier than attaching to a subcontainer.**
  Read the published address with `sudo jq -r .primaryUrl /media/startos/data/package-data/volumes/immich/data/startos/store.json` — pull the one field rather than dumping the file, which also holds the postgres password and the `startos-managed` API key. It answers over HTTPS with a self-signed cert, so `curl -k` from your workstation works:

  ```sh
  curl -sk "$PRIMARY_URL/api/server/ping"                       # readiness
  curl -sk -X POST "$PRIMARY_URL/api/auth/admin-sign-up" \
    -H 'Content-Type: application/json' \
    -d '{"email":"…","password":"…","name":"…"}'                # first admin only
  TOKEN=$(curl -sk -X POST "$PRIMARY_URL/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d '{"email":"…","password":"…"}' | jq -r .accessToken)
  curl -sk "$PRIMARY_URL/api/libraries" -H "Authorization: Bearer $TOKEN"
  ```

  A fresh install has **no admin** until sign-up completes, and nothing to own an API key until one exists — `ensure-api-key` no-ops and the library actions fail. Sign up first when setting up a test box.
