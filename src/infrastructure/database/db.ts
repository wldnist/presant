// Database abstraction layer
// Support untuk SQLite (local dengan better-sqlite3) dan Turso (cloud SQLite)

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Type untuk better-sqlite3 Database
type DatabaseType = {
  new (path: string): DatabaseInstance;
};

type Statement = {
  run: (...params: unknown[]) => { changes: number; lastInsertRowid: number | bigint } | Promise<{ changes: number; lastInsertRowid: number | bigint }>;
  get: (...params: unknown[]) => unknown | Promise<unknown>;
  all: (...params: unknown[]) => unknown[] | Promise<unknown[]>;
};

export type DatabaseInstance = {
  pragma: (setting: string) => unknown | Promise<unknown>;
  close: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: <T extends (...args: any[]) => any>(callback: T) => T;
  prepare: (sql: string) => Statement;
  exec: (sql: string) => void | Promise<void>;
  // Flag untuk check apakah ini Turso (async) atau better-sqlite3 (sync)
  _isTurso?: boolean;
};

// Conditional import untuk better-sqlite3 (optional dependency)
let Database: DatabaseType | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Database = require('better-sqlite3');
} catch {
  // better-sqlite3 tidak tersedia (misalnya di Vercel build)
  // Akan menggunakan Turso jika tersedia
}

// Conditional import untuk Turso
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createClient: ((config: { url: string; authToken: string }) => any) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const libsql = require('@libsql/client');
  createClient = libsql.createClient;
} catch {
  // @libsql/client tidak tersedia
}

let db: DatabaseInstance | null = null;

export function getDatabase(): DatabaseInstance {
  if (db) {
    return db;
  }

  // Priority 1: Cek apakah ada Turso configuration (untuk Vercel/production)
  if (process.env.TURSO_DATABASE_URL && createClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createTursoAdapter } = require('./tursoAdapter');
    const tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || ''
    });
    
    const tursoDb = createTursoAdapter(tursoClient);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tursoDb as any)._isTurso = true;
    db = tursoDb;
    return tursoDb;
  }

  // Priority 2: Gunakan better-sqlite3 untuk development
  if (!Database) {
    if (process.env.VERCEL) {
      throw new Error(
        'SQLite file-based tidak didukung di Vercel. ' +
        'Setup Turso: https://turso.tech dan tambahkan TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di environment variables. ' +
        'Lihat dokumentasi di docs/VERCEL_DEPLOYMENT.md untuk setup lengkap.'
      );
    }
    throw new Error(
      'better-sqlite3 is not available. ' +
      'Install dengan: npm install better-sqlite3'
    );
  }

  // Untuk Vercel: gunakan /tmp (writable directory)
  // Untuk development: gunakan data/ directory
  // Untuk production: bisa switch ke API/Turso
  let dbPath: string;
  let dbDir: string;
  
  if (process.env.VERCEL) {
    // Di Vercel, gunakan /tmp yang writable
    dbPath = '/tmp/presant.db';
    dbDir = '/tmp';
  } else {
    // Development: gunakan data/ directory
    dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'presant.db');
    dbDir = join(process.cwd(), 'data');
    
    // Ensure data directory exists (hanya di development)
    if (!existsSync(dbDir)) {
      try {
        mkdirSync(dbDir, { recursive: true });
      } catch (error) {
        console.error('Error creating data directory:', error);
        throw new Error(`Cannot create database directory: ${dbDir}. Make sure you have write permissions.`);
      }
    }
  }

  try {
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // WAL mode for better concurrency (tidak didukung di /tmp, tapi tidak masalah)
    try {
      db.pragma('journal_mode = WAL');
    } catch {
      // Ignore jika WAL tidak didukung (misalnya di /tmp)
      db.pragma('journal_mode = DELETE');
    }
    
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

