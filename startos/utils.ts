import { T, utils } from '@start9labs/start-sdk'
import { createHash, randomBytes } from 'crypto'
import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'

export const uiPort = 2283 as const

export async function getNonLocalUrls(effects: T.Effects): Promise<string[]> {
  return sdk.serviceInterface
    .getOwn(effects, 'ui', (i) => i?.addressInfo?.nonLocal.format() || [])
    .const()
}
export const POSTGRES_PATH = '/var/lib/postgresql' as const
export const POSTGRES_DB = 'immich' as const
export const POSTGRES_USER = 'postgres' as const

export function getPostgresSub(effects: T.Effects) {
  return sdk.SubContainer.of(
    effects,
    { imageId: 'postgres' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'db',
      mountpoint: POSTGRES_PATH,
      readonly: false,
      subpath: null,
    }),
    'postgres',
  )
}

export async function getPostgresEnv(effects: T.Effects) {
  const store = await storeJson.read().const(effects)
  const password = store?.postgresPassword
  if (!password) throw new Error('Postgres password not found in store')
  return {
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD: password,
    POSTGRES_INITDB_ARGS: '--data-checksums',
  }
}

export function getImmichEnv(
  postgresEnv: Awaited<ReturnType<typeof getPostgresEnv>>,
) {
  return {
    DB_HOSTNAME: 'localhost',
    DB_USERNAME: postgresEnv.POSTGRES_USER,
    DB_PASSWORD: postgresEnv.POSTGRES_PASSWORD,
    DB_DATABASE_NAME: postgresEnv.POSTGRES_DB,
    REDIS_HOSTNAME: 'localhost',
    IMMICH_MACHINE_LEARNING_URL: 'http://localhost:3003',
  }
}

export function getRandomPassword() {
  return utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: 24,
  })
}

export const serverMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'upload',
  mountpoint: '/usr/src/app/upload',
  readonly: false,
  subpath: null,
})

export const dbMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'db',
  mountpoint: POSTGRES_PATH,
  readonly: false,
  subpath: null,
})

/**
 * Create the four subcontainers that make up a running Immich stack:
 * postgres, valkey, immich-ml, immich-server. Both `initializeImmich`
 * (install-time) and `main` (runtime) use these; only the server mounts
 * differ (install uses upload-only; main optionally adds external-library
 * mounts).
 */
export async function createCoreSubs(
  effects: T.Effects,
  serverMountsArg: Parameters<typeof sdk.SubContainer.of>[2],
) {
  return {
    postgresSub: await getPostgresSub(effects),
    valkeySub: await sdk.SubContainer.of(
      effects,
      { imageId: 'valkey' },
      sdk.Mounts.of(),
      'valkey',
    ),
    mlSub: await sdk.SubContainer.of(
      effects,
      { imageId: 'immich-ml' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'model-cache',
        mountpoint: '/cache',
        readonly: false,
        subpath: null,
      }),
      'immich-ml',
    ),
    serverSub: await sdk.SubContainer.of(
      effects,
      { imageId: 'immich-server' },
      serverMountsArg,
      'immich-server',
    ),
  }
}

export type CoreSubs = Awaited<ReturnType<typeof createCoreSubs>>

/**
 * Build a Daemons chain with the four core daemons wired up with their
 * ready-checks and requires ordering. Callers append their own oneshots
 * (and `.runUntilSuccess()` for install, or return for main).
 */
export function buildCoreDaemons(
  effects: T.Effects,
  subs: CoreSubs,
  postgresEnv: Awaited<ReturnType<typeof getPostgresEnv>>,
  serverReadyDisplay: { name: string; success: string; failure: string } | null,
) {
  return sdk.Daemons.of(effects)
    .addDaemon('postgres', {
      subcontainer: subs.postgresSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: postgresEnv,
      },
      ready: {
        display: null,
        fn: async () => {
          const { exitCode } = await subs.postgresSub.exec([
            'pg_isready',
            '-U',
            postgresEnv.POSTGRES_USER,
            '-h',
            'localhost',
          ])
          if (exitCode !== 0) {
            return { result: 'loading', message: null }
          }
          return { result: 'success', message: null }
        },
      },
      requires: [],
    })
    .addDaemon('valkey', {
      subcontainer: subs.valkeySub,
      exec: { command: 'valkey-server' },
      ready: {
        display: null,
        fn: async () => {
          const res = await subs.valkeySub.exec(['valkey-cli', 'ping'])
          return res.stdout.toString().trim() === 'PONG'
            ? { message: '', result: 'success' }
            : { message: res.stdout.toString().trim(), result: 'failure' }
        },
      },
      requires: [],
    })
    .addDaemon('immich-ml', {
      subcontainer: subs.mlSub,
      exec: {
        command: sdk.useEntrypoint(),
        runAsInit: true,
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 3003, {
            successMessage: '',
            errorMessage: '',
          }),
      },
      requires: [],
    })
    .addDaemon('immich-server', {
      subcontainer: subs.serverSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: getImmichEnv(postgresEnv),
        runAsInit: true,
      },
      ready: {
        display: serverReadyDisplay?.name ?? null,
        gracePeriod: 40000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: serverReadyDisplay?.success ?? '',
            errorMessage: serverReadyDisplay?.failure ?? '',
          }),
      },
      requires: ['postgres', 'valkey', 'immich-ml'],
    })
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

type PgExecSub = {
  execFail(
    cmd: string[],
    opts?: { env?: Record<string, string> },
  ): Promise<{ stdout: string | Buffer }>
}

function psqlCmd(sql: string, quiet = false): string[] {
  const base = [
    'psql',
    '-U',
    POSTGRES_USER,
    '-d',
    POSTGRES_DB,
    '-h',
    'localhost',
  ]
  if (quiet) base.push('-t', '-A')
  return [...base, '-c', sql]
}

/**
 * Returns true iff an admin user row exists in the `user` table.
 * Used to skip work that requires an admin API key before the user has
 * completed Immich's initial sign-up flow.
 */
export async function hasAdmin(
  pgSub: PgExecSub,
  pgEnv?: Record<string, string>,
): Promise<boolean> {
  const res = await pgSub.execFail(
    psqlCmd('SELECT 1 FROM "user" WHERE "isAdmin" = true LIMIT 1', true),
    pgEnv ? { env: pgEnv } : undefined,
  )
  return res.stdout.toString().trim() === '1'
}

/**
 * Upserts the StartOS-enforced defaults into `system_metadata[system-config]`
 * via direct DB write. No admin and no running API are required.
 *
 * On a fresh install the `system_metadata` table is created by Immich's
 * `InitialMigration`, which runs during `immich-server` startup — so on the
 * first startup this is called before the table exists. We no-op in that
 * case: the row gets written on the next `main` execution (typically the
 * next restart), and Immich picks up the values on that same boot since it
 * only reads config at bootstrap.
 *
 * See CLAUDE.md ("Enforced defaults via direct DB write") for the version-bump
 * checklist — this bypasses Immich's update API and depends on stable schema.
 */
export async function enforceSystemConfigDefaults(
  pgSub: PgExecSub,
  pgEnv?: Record<string, string>,
): Promise<void> {
  const tableCheck = await pgSub.execFail(
    psqlCmd("SELECT to_regclass('public.system_metadata')", true),
    pgEnv ? { env: pgEnv } : undefined,
  )
  if (tableCheck.stdout.toString().trim() === '') return

  // Shallow-merge at each level preserves unrelated sibling keys that the
  // user (or Immich itself) may have written.
  const sql = `
    INSERT INTO system_metadata (key, value)
    VALUES (
      'system-config',
      '{"newVersionCheck":{"enabled":false},"backup":{"database":{"enabled":false}}}'::jsonb
    )
    ON CONFLICT (key) DO UPDATE SET value = system_metadata.value
      || jsonb_build_object('newVersionCheck',
           COALESCE(system_metadata.value->'newVersionCheck', '{}'::jsonb)
           || '{"enabled":false}'::jsonb)
      || jsonb_build_object('backup',
           COALESCE(system_metadata.value->'backup', '{}'::jsonb)
           || jsonb_build_object('database',
                COALESCE(system_metadata.value->'backup'->'database', '{}'::jsonb)
                || '{"enabled":false}'::jsonb))
  `
  await pgSub.execFail(psqlCmd(sql), pgEnv ? { env: pgEnv } : undefined)
}

const immichBase = `http://localhost:${uiPort}/api`

/** Make an authenticated request to the Immich API, throwing on non-2xx responses. */
export async function immichApi<T = void>(
  path: string,
  token: string,
  opts?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${immichBase}${path}`, {
    method: opts?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': token,
    },
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `Immich API ${opts?.method ?? 'GET'} ${path} failed ${res.status}: ${text}`,
    )
  }
  const ct = res.headers.get('content-type')
  if (ct && ct.includes('application/json')) return res.json() as T
  return undefined as T
}

export class NoAdminError extends Error {
  constructor() {
    super('Immich admin user does not exist yet')
    this.name = 'NoAdminError'
  }
}

/**
 * Like {@link withTempApiKey}, but gracefully no-ops (returning `undefined`)
 * when no admin exists yet. Use for startup oneshots that need to re-try on
 * every `main` execution until the user completes Immich's sign-up flow.
 *
 * For user-triggered actions where "no admin" should surface as a failure
 * (e.g. resetAdminPassword), call {@link withTempApiKey} directly and let
 * {@link NoAdminError} propagate.
 */
export async function withAdminApiKey<R>(
  pgSub: PgExecSub,
  name: string,
  fn: (ctx: { token: string; adminId: string }) => Promise<R>,
  pgEnv?: Record<string, string>,
): Promise<R | undefined> {
  try {
    return await withTempApiKey(pgSub, name, fn, pgEnv)
  } catch (e) {
    if (e instanceof NoAdminError) return undefined
    throw e
  }
}

/**
 * Creates a temporary Immich API key, runs a callback with the token and admin user ID,
 * then always cleans up the key afterward.
 *
 * Throws {@link NoAdminError} if no admin user exists yet (fresh install, pre-sign-up).
 * Callers that run unconditionally (e.g. startup oneshots) should check {@link hasAdmin}
 * first and skip gracefully.
 *
 * @param pgSub - A subcontainer that can execute psql (running daemon or temp container)
 * @param name - A label for the temp key (e.g. 'startos-smtp')
 * @param fn - Callback receiving { token, adminId }
 * @param pgEnv - Optional environment variables for psql (needed for temp containers)
 */
export async function withTempApiKey<R>(
  pgSub: PgExecSub,
  name: string,
  fn: (ctx: { token: string; adminId: string }) => Promise<R>,
  pgEnv?: Record<string, string>,
): Promise<R> {
  if (!(await hasAdmin(pgSub, pgEnv))) throw new NoAdminError()

  const token = randomBytes(32).toString('base64').replace(/\W/g, '')
  const hashedKey = createHash('sha256').update(token).digest('base64')

  const insertRes = await pgSub.execFail(
    psqlCmd(
      `INSERT INTO api_key (name, key, "userId", permissions) SELECT ${sqlLiteral(name)}, ${sqlLiteral(hashedKey)}, id, '{"all"}' FROM "user" WHERE "isAdmin" = true LIMIT 1 RETURNING id, "userId"`,
      true,
    ),
    pgEnv ? { env: pgEnv } : undefined,
  )
  const line = insertRes.stdout.toString().trim().split('\n')[0]
  const [keyId, adminId] = line.split('|')

  try {
    return await fn({ token, adminId })
  } finally {
    await pgSub.execFail(
      psqlCmd(`DELETE FROM api_key WHERE id = ${sqlLiteral(keyId)}`),
      pgEnv ? { env: pgEnv } : undefined,
    )
  }
}
