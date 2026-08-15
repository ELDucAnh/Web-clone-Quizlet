import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on('error', (err) => {
  console.error('[DB] Unexpected client error', err);
});

// Test connection on startup
db.query('SELECT 1')
  .then(() => console.log('[DB] PostgreSQL connected'))
  .catch((err) => console.error('[DB] Connection failed:', err.message));
