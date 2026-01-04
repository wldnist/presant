// Database Migration Runner
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getDatabase } from './db';

export function runMigrations(): void {
  try {
    const db = getDatabase();
    const migrationsDir = join(process.cwd(), 'src', 'infrastructure', 'database', 'migrations');
    
    if (!existsSync(migrationsDir)) {
      console.warn('Migrations directory not found:', migrationsDir);
      return;
    }
    
    // Get all migration files sorted by name
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Create migrations table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Get applied migrations
    const appliedMigrations = new Set(
      (db.prepare('SELECT version FROM schema_migrations').all() as { version: string }[]).map((row) => row.version)
    );

    // Apply pending migrations
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      
      if (!appliedMigrations.has(version)) {
        console.log(`Applying migration: ${file}`);
        
        const sql = readFileSync(join(migrationsDir, file), 'utf-8');
        
        db.exec(sql);
        
        // Record migration
        db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
        
        console.log(`Migration ${version} applied successfully`);
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migrations when executed directly
if (require.main === module) {
  runMigrations();
}
