# TODO

## Deferred: Postgres sidecar — VectorChord 0.4.3 → 1.1.x (BLOCKED, do not bump)

`base-images/postgres/versions.yaml` now emits `14-vectorchord1.1.1-pgvector0.8.5`, but the pin
stays at `14-vectorchord0.4.3-pgvectors0.2.0`. Deliberately. Blockers:

- **Immich has not adopted it.** `v3.1.0` and `main` both still sha-pin the 0.4.3 image in
  `docker/docker-compose.yml`. The base-images PR that produced the new tag
  (immich-app/base-images#353) opens with "Opening for discussion. I am not sure the right way
  to do this."
- **Immich's stated support for vchord 1.x is untested.** `VECTORCHORD_VERSION_RANGE` was widened
  `>=0.3 <0.6` → `>=0.3 <2` by immich-app/immich#23845, whose entire diff is that constant plus one
  docs line, and whose body reads "Still needs to be tested".
- **The upgrade is an unattended, destructive-adjacent migration.** On boot Immich would drop
  `clip_index` + `face_index`, chain seven `ALTER EXTENSION vchord UPDATE` scripts (one of which
  DROPs types/operators/functions), rewrite the `embedding` columns, and rebuild both vector
  indexes. Interrupted midway, a user's library is left with no search indexes.

Revisit when Immich's own `docker-compose.yml` moves to a vchord 1.x image. At that point verify
whether a Postgres restart is needed between the `ALTER EXTENSION` and the reindex (see the warning
in `server/src/services/database.service.ts`) — our daemon chain does not restart Postgres mid-boot.
