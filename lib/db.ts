import { Pool } from 'pg';

// Using a global variable in dev prevents multiple connection pools from
// being created during hot reloading in Next.js.
declare global {
  var _dbPool: Pool | undefined;
}

let db: Pool;

if (process.env.NODE_ENV === 'production') {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 1,
    connectionTimeoutMillis: 5000,
  });
} else {
  if (!global._dbPool) {
    global._dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('supabase') 
        ? { rejectUnauthorized: false } 
        : undefined,
      max: 5,
      idleTimeoutMillis: 1,
      connectionTimeoutMillis: 5000,
    });
  }
  db = global._dbPool;
}

db.on('error', (err: Error) => {
  console.error('[DB] Unexpected client error', err);
});

export { db };
