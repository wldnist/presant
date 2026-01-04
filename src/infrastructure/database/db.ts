// Database abstraction layer
// Support untuk SQLite (local) dan siap untuk API/Turso di production

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
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
export function transaction<T>(callback: (db: Database.Database) => T): T {
  const database = getDatabase();
  const transaction = database.transaction(callback);
  return transaction(database);
}

