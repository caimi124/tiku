import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres";

let pool: Pool;

if (globalThis?.process?.env?.NODE_ENV === "production") {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
} else {
  const globalForPostgres = globalThis as unknown as { postgresPool?: Pool };
  pool =
    globalForPostgres.postgresPool ??
    new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  globalForPostgres.postgresPool = pool;
}

export default pool;

