// Helper functions untuk handle sync/async database operations
import { DatabaseInstance } from './db';

// Helper untuk execute database operations yang bisa sync (better-sqlite3) atau async (Turso)
export async function dbAll(stmt: { all: (...params: unknown[]) => unknown[] | Promise<unknown[]> }, ...params: unknown[]): Promise<unknown[]> {
  const result = stmt.all(...params);
  return result instanceof Promise ? result : Promise.resolve(result);
}

export async function dbGet(stmt: { get: (...params: unknown[]) => unknown | Promise<unknown> }, ...params: unknown[]): Promise<unknown> {
  const result = stmt.get(...params);
  return result instanceof Promise ? result : Promise.resolve(result);
}

export async function dbRun(stmt: { run: (...params: unknown[]) => { changes: number; lastInsertRowid: number | bigint } | Promise<{ changes: number; lastInsertRowid: number | bigint }> }, ...params: unknown[]): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
  const result = stmt.run(...params);
  return result instanceof Promise ? result : Promise.resolve(result);
}

export async function dbExec(db: DatabaseInstance, sql: string): Promise<void> {
  const result = db.exec(sql);
  return result instanceof Promise ? result : Promise.resolve();
}

export async function dbPragma(db: DatabaseInstance, setting: string): Promise<unknown> {
  const result = db.pragma(setting);
  return result instanceof Promise ? result : Promise.resolve(result);
}

