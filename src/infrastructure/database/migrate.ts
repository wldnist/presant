// Database Migration Runner
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getDatabase } from './db';

export function runMigrations(): void {
  try {
    // Skip migrations during build phase only
    // At runtime (even in Vercel), migrations should run
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping migrations during build phase');
      return;
    }
    
    let db;
    try {
      db = getDatabase();
    } catch (dbError) {
      // better-sqlite3 not available, skip migrations
      // This can happen during build, but should not happen at runtime
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.log('Database not available during build, migrations will run at runtime');
        return;
      }
      // At runtime, if database is not available, log error but don't throw
      // (might be intentional if using external database)
      console.error('Database not available at runtime:', dbError);
      return;
    }
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
    // During build, better-sqlite3 might not be available
    // This is expected and migrations will run at runtime
    if (process.env.VERCEL || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Migrations skipped during build (will run at runtime)');
      return;
    }
    console.error('Migration error:', error);
    // Only exit in non-build environments
    if (require.main === module) {
      process.exit(1);
    }
  }
}

// Run migrations when executed directly
if (require.main === module) {
  runMigrations();
}
