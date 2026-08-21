import mysql from 'mysql2/promise'

/**
 * Server-only MySQL connection module.
 *
 * IMPORTANT: this module uses Node's `mysql2` driver and must ONLY be imported
 * from server code (TanStack Start API routes in `src/routes/api/**`). Never
 * import it from a component or the store — it would break the client build.
 *
 * Config comes from environment variables (see `.env.example`):
 *   RIDEGOA_DB_HOST     default localhost
 *   RIDEGOA_DB_PORT     default 3306
 *   RIDEGOA_DB_USER     default root
 *   RIDEGOA_DB_PASSWORD default (empty)
 *   RIDEGOA_DB_NAME     default ridegoa
 */

function env(key: string, fallback: string): string {
  const fromProcess = process.env[key]
  if (fromProcess) return fromProcess
  // Vite exposes .env vars on import.meta.env too
  const meta = (import.meta as unknown as { env?: Record<string, string> }).env
  return meta?.[key] ?? fallback
}

const pool = mysql.createPool({
  host: env('RIDEGOA_DB_HOST', 'localhost'),
  port: Number(env('RIDEGOA_DB_PORT', '3306')),
  user: env('RIDEGOA_DB_USER', 'root'),
  password: env('RIDEGOA_DB_PASSWORD', ''),
  database: env('RIDEGOA_DB_NAME', 'ridegoa'),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
})

export type DbHealth = {
  connected: boolean
  serverVersion?: string
  database?: string
  error?: string
}

/** Lightweight health probe — proves the pool can reach MySQL. */
export async function pingDb(): Promise<DbHealth> {
  try {
    // Non-generic query() already returns RowDataPacket[] (index signature), so
    // no explicit generic is needed — avoids fragile namespace type access.
    const [rows] = await pool.query('SELECT VERSION() AS version, DATABASE() AS database')
    const row = rows[0] as { version?: string; database?: string } | undefined
    return {
      connected: true,
      serverVersion: row?.version,
      database: row?.database,
    }
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export { pool }
export default pool
