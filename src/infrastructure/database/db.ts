// Database abstraction layer
// Support untuk SQLite (local) dan siap untuk API/Turso di production

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Type untuk better-sqlite3 Database
type DatabaseType = {
  new (path: string): DatabaseInstance;
};

type Statement = {
  run: (...params: unknown[]) => { changes: number; lastInsertRowid: number | bigint };
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
};

export type DatabaseInstance = {
  pragma: (setting: string) => unknown;
  close: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: <T extends (...args: any[]) => any>(callback: T) => T;
  prepare: (sql: string) => Statement;
  exec: (sql: string) => void;
};

// Conditional import untuk better-sqlite3 (optional dependency)
let Database: DatabaseType | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Database = require('better-sqlite3');
} catch {
  // better-sqlite3 tidak tersedia (misalnya di Vercel build)
  // Akan throw error saat getDatabase() dipanggil
}

let db: DatabaseInstance | null = null;

export function getDatabase(): DatabaseInstance {
  if (!Database) {
    throw new Error(
      'better-sqlite3 is not available. ' +
      'This is expected in Vercel build environment. ' +
      'Use API routes instead of direct database access.'
    );
  }

  if (db) {
    return db;
  }

  // Untuk development: gunakan SQLite file-based
  // Untuk production: bisa switch ke API/Turso
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'presant.db');
  const dbDir = join(process.cwd(), 'data');
  
  // Ensure data directory exists
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  try {
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Helper untuk transaction
export function transaction<T>(callback: () => T): T {
  const database = getDatabase();
  const transactionFn = database.transaction(callback);
  return transactionFn();
}

