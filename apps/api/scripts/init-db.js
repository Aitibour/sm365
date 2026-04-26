require('dotenv').config({ path: '.env' });

const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@libsql/client');

const url = process.env.DATABASE_URL || 'file:./data/sm365.db';

if (url.startsWith('file:')) {
  const databasePath = url.replace(/^file:/, '');
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

const client = createClient({ url });

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const passwordHash = await bcrypt.hash('sm365-demo', 10);
  const timestamp = new Date().toISOString();

  await client.execute({
    sql: `
      INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        role = excluded.role,
        password_hash = excluded.password_hash,
        updated_at = excluded.updated_at
    `,
    args: [
      crypto.randomUUID(),
      'admin@sm365.local',
      'SM 365 Admin',
      'owner',
      passwordHash,
      timestamp,
      timestamp,
    ],
  });
}

main()
  .then(() => client.close())
  .catch(async (error) => {
    console.error(error);
    await client.close();
    process.exit(1);
  });
