// Turso Adapter - Wrapper untuk @libsql/client agar kompatibel dengan DatabaseInstance interface
// Note: Turso menggunakan async API, tapi kita buat wrapper untuk kompatibilitas

import { Client } from '@libsql/client';

type Statement = {
  run: (...params: unknown[]) => { changes: number; lastInsertRowid: number | bigint } | Promise<{ changes: number; lastInsertRowid: number | bigint }>;
  get: (...params: unknown[]) => unknown | Promise<unknown>;
  all: (...params: unknown[]) => unknown[] | Promise<unknown[]>;
};

// Adapter untuk membuat Turso client kompatibel dengan better-sqlite3 interface
// Karena Turso async, kita perlu membuat wrapper yang handle async operations
export function createTursoAdapter(client: Client) {
  // @libsql/client tidak punya prepare(), jadi kita simpan SQL dan execute langsung
  // Cache untuk SQL statements (untuk consistency dengan better-sqlite3 API)
  const statementCache = new Map<string, string>();
  
  const getStatement = (sql: string) => {
    if (!statementCache.has(sql)) {
      statementCache.set(sql, sql);
    }
    return statementCache.get(sql)!;
  };
  
  return {
    pragma: async (setting: string) => {
      // Turso tidak support semua pragma, tapi kita bisa execute SQL
      // Untuk pragma yang penting, kita handle secara khusus
      if (setting === 'foreign_keys = ON') {
        // Foreign keys sudah enabled by default di Turso
        return undefined;
      }
      if (setting === 'journal_mode = WAL' || setting === 'journal_mode = DELETE') {
        // Journal mode tidak relevan untuk Turso (cloud database)
        return undefined;
      }
      // Untuk pragma lain, kita bisa execute sebagai SQL
      await client.execute(`PRAGMA ${setting}`);
      return undefined;
    },
    
    close: () => {
      client.close();
    },
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: <T extends (...args: any[]) => any>(callback: T): T => {
      // Turso menggunakan batch() untuk transaction
      // Untuk kompatibilitas, kita return function yang akan di-handle secara khusus
      return ((...args: Parameters<T>) => {
        // Transaction akan di-handle oleh repositories menggunakan batch()
        return callback(...args);
      }) as T;
    },
    
    prepare: (sql: string): Statement => {
      const sqlStmt = getStatement(sql);
      
      return {
        // Untuk run, kita perlu execute dan return result
        run: async (...params: unknown[]) => {
          const result = await client.execute({
            sql: sqlStmt,
            args: params as any
          });
          return {
            changes: result.rowsAffected,
            lastInsertRowid: result.lastInsertRowid || BigInt(0)
          };
        },
        
        get: async (...params: unknown[]) => {
          const result = await client.execute({
            sql: sqlStmt,
            args: params as any
          });
          return result.rows[0] || undefined;
        },
        
        all: async (...params: unknown[]) => {
          const result = await client.execute({
            sql: sqlStmt,
            args: params as any
          });
          return result.rows;
        }
      };
    },
    
    exec: async (sql: string) => {
      // Turso exec untuk multiple statements
      // Split by semicolon dan execute satu per satu
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      for (const stmt of statements) {
        await client.execute(stmt.trim());
      }
    }
  };
}

// Helper untuk check apakah database adalah Turso
export function isTursoDatabase(db: any): boolean {
  return db && typeof db.execute === 'function' && typeof db.prepare === 'function';
}
