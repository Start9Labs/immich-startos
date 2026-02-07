import { createHash, randomBytes } from 'crypto'
import { sdk } from './sdk'
import { T, utils } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'

export const uiPort = 2283 as const
export const POSTGRES_PATH = '/var/lib/postgresql/data' as const
export const POSTGRES_DB = 'immich'
export const POSTGRES_USER = 'postgres'

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

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
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
    throw new Error(`Immich API ${opts?.method ?? 'GET'} ${path} failed ${res.status}: ${text}`)
  }
  const ct = res.headers.get('content-type')
  if (ct && ct.includes('application/json')) return res.json() as T
  return undefined as T
}

/**
 * Creates a temporary Immich API key, runs a callback with the token and admin user ID,
 * then always cleans up the key afterward.
 *
 * @param pgSub - A subcontainer that can execute psql (running daemon or temp container)
 * @param name - A label for the temp key (e.g. 'startos-smtp')
 * @param fn - Callback receiving { token, adminId }
 * @param pgEnv - Optional environment variables for psql (needed for temp containers)
 */
export async function withTempApiKey<R>(
  pgSub: {
    execFail(
      cmd: string[],
      opts?: { env?: Record<string, string> },
    ): Promise<{ stdout: string | Buffer }>
  },
  name: string,
  fn: (ctx: { token: string; adminId: string }) => Promise<R>,
  pgEnv?: Record<string, string>,
): Promise<R> {
  const token = randomBytes(32).toString('base64').replace(/\W/g, '')
  const hashedKey = createHash('sha256').update(token).digest('base64')

  const insertRes = await pgSub.execFail(
    [
      'psql',
      '-U',
      POSTGRES_USER,
      '-d',
      POSTGRES_DB,
      '-h',
      'localhost',
      '-t',
      '-A',
      '-c',
      `INSERT INTO api_key (name, key, "userId", permissions) SELECT ${sqlLiteral(name)}, ${sqlLiteral(hashedKey)}, id, '{"all"}' FROM "user" WHERE "isAdmin" = true LIMIT 1 RETURNING id, "userId"`,
    ],
    pgEnv ? { env: pgEnv } : undefined,
  )
  const line = insertRes.stdout.toString().trim().split('\n')[0]
  const [keyId, adminId] = line.split('|')

  try {
    return await fn({ token, adminId })
  } finally {
    await pgSub.execFail(
      [
        'psql',
        '-U',
        POSTGRES_USER,
        '-d',
        POSTGRES_DB,
        '-h',
        'localhost',
        '-c',
        `DELETE FROM api_key WHERE id = ${sqlLiteral(keyId)}`,
      ],
      pgEnv ? { env: pgEnv } : undefined,
    )
  }
}
