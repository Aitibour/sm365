import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import bcrypt from 'bcryptjs';
import { createClient, type Client } from '@libsql/client';

type DbUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  password_hash: string;
};

type DbInviteRow = {
  id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  invited_by_email: string;
  created_at: string;
};

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || 'file:./data/sm365.db';
}

function getClient() {
  if (!client) {
    const url = getDatabaseUrl();

    if (url.startsWith('file:')) {
      const databasePath = url.replace(/^file:/, '');
      mkdirSync(dirname(databasePath), { recursive: true });
    }

    client = createClient({ url });
  }

  return client;
}

export async function initializeDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      const db = getClient();

      await db.execute(`
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

      await db.execute(`
        CREATE TABLE IF NOT EXISTS invites (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'member',
          token TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'pending',
          invited_by_email TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const existingUser = await findUserByEmail('admin@sm365.local');

      if (!existingUser) {
        await upsertUser({
          email: 'admin@sm365.local',
          name: 'SM 365 Admin',
          role: 'owner',
          password: 'sm365-demo',
        });
      }
    })();
  }

  await initPromise;
}

export async function findUserByEmail(email: string) {
  const db = getClient();
  const result = await db.execute({
    sql: `
      SELECT id, email, name, role, password_hash
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    args: [email.toLowerCase()],
  });

  if (!result.rows.length) {
    return null;
  }

  const row = result.rows[0] as unknown as DbUserRow;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    passwordHash: row.password_hash,
  };
}

export async function upsertUser(input: {
  email: string;
  name: string;
  role: string;
  password: string;
}) {
  const db = getClient();
  const timestamp = new Date().toISOString();
  const passwordHash = await bcrypt.hash(input.password, 10);

  await db.execute({
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
      input.email.toLowerCase(),
      input.name,
      input.role,
      passwordHash,
      timestamp,
      timestamp,
    ],
  });
}

export async function createUser(input: {
  email: string;
  name: string;
  role?: string;
  password: string;
}) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    return null;
  }

  const db = getClient();
  const timestamp = new Date().toISOString();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const role = input.role || 'member';

  await db.execute({
    sql: `
      INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      crypto.randomUUID(),
      input.email.toLowerCase(),
      input.name,
      role,
      passwordHash,
      timestamp,
      timestamp,
    ],
  });

  return findUserByEmail(input.email);
}

export async function updateUserPassword(input: {
  email: string;
  password: string;
}) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    return null;
  }

  const db = getClient();
  const passwordHash = await bcrypt.hash(input.password, 10);

  await db.execute({
    sql: `
      UPDATE users
      SET password_hash = ?, updated_at = ?
      WHERE email = ?
    `,
    args: [passwordHash, new Date().toISOString(), input.email.toLowerCase()],
  });

  return findUserByEmail(input.email);
}

export async function listUsers() {
  const db = getClient();
  const result = await db.execute(`
    SELECT id, email, name, role
    FROM users
    ORDER BY created_at ASC
  `);

  return result.rows.map((row) => {
    const user = row as unknown as Omit<DbUserRow, 'password_hash'>;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  });
}

export async function updateUserRole(input: { email: string; role: string }) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    return null;
  }

  const db = getClient();

  await db.execute({
    sql: `
      UPDATE users
      SET role = ?, updated_at = ?
      WHERE email = ?
    `,
    args: [input.role, new Date().toISOString(), input.email.toLowerCase()],
  });

  return findUserByEmail(input.email);
}

export async function createInvite(input: {
  email: string;
  role: string;
  invitedByEmail: string;
}) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    return null;
  }

  const db = getClient();
  const existingInvite = await db.execute({
    sql: `
      SELECT id, email, role, token, status, invited_by_email, created_at
      FROM invites
      WHERE email = ? AND status = 'pending'
      LIMIT 1
    `,
    args: [input.email.toLowerCase()],
  });

  if (existingInvite.rows.length) {
    const row = existingInvite.rows[0] as unknown as DbInviteRow;

    return {
      id: row.id,
      email: row.email,
      role: row.role,
      token: row.token,
      status: row.status,
      invitedByEmail: row.invited_by_email,
      createdAt: row.created_at,
    };
  }

  const id = crypto.randomUUID();
  const token = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO invites (id, email, role, token, status, invited_by_email, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `,
    args: [
      id,
      input.email.toLowerCase(),
      input.role,
      token,
      input.invitedByEmail.toLowerCase(),
      createdAt,
    ],
  });

  return {
    id,
    email: input.email.toLowerCase(),
    role: input.role,
    token,
    status: 'pending',
    invitedByEmail: input.invitedByEmail.toLowerCase(),
    createdAt,
  };
}

export async function listInvites() {
  const db = getClient();
  const result = await db.execute(`
    SELECT id, email, role, token, status, invited_by_email, created_at
    FROM invites
    ORDER BY created_at DESC
  `);

  return result.rows.map((row) => {
    const invite = row as unknown as DbInviteRow;

    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      token: invite.token,
      status: invite.status,
      invitedByEmail: invite.invited_by_email,
      createdAt: invite.created_at,
    };
  });
}

export function closeDatabase() {
  client?.close();
  client = null;
  initPromise = null;
}
