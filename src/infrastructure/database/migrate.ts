// Database Migration Runner
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getDatabase } from './db';
import { dbAll, dbExec, dbRun } from './dbHelpers';

// Load environment variables from .env.local
// Next.js otomatis load .env.local, tapi saat run script langsung perlu load manual
if (typeof window === 'undefined') {
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  }
}

export async function runMigrations(): Promise<void> {
  console.log('Starting migrations...');
  console.log('Database URL:', process.env.TURSO_DATABASE_URL ? 'Turso (configured)' : 'Local SQLite');
  
  try {
    // Skip migrations during build phase only
    // At runtime (even in Vercel), migrations should run
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping migrations during build phase');
      return;
    }
    
    let db;
    try {
      console.log('Connecting to database...');
      db = getDatabase();
      console.log('Database connected successfully');
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
    
    console.log(`Found ${migrationFiles.length} migration file(s):`, migrationFiles);

    // Create migrations table if it doesn't exist
    console.log('Creating schema_migrations table if not exists...');
    await dbExec(db, `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Get applied migrations
    console.log('Checking applied migrations...');
    const stmt = db.prepare('SELECT version FROM schema_migrations');
    const appliedRows = await dbAll(stmt) as { version: string }[];
    const appliedMigrations = new Set(appliedRows.map((row) => row.version));
    console.log(`Applied migrations: ${Array.from(appliedMigrations).join(', ') || 'none'}`);

    // Apply pending migrations
    let appliedCount = 0;
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      
      if (!appliedMigrations.has(version)) {
        console.log(`\n[${version}] Applying migration: ${file}`);
        
        const sql = readFileSync(join(migrationsDir, file), 'utf-8');
        
        await dbExec(db, sql);
        
        // Record migration
        const insertStmt = db.prepare('INSERT INTO schema_migrations (version) VALUES (?)');
        await dbRun(insertStmt, version);
        
        console.log(`[${version}] Migration applied successfully`);
        appliedCount++;
      } else {
        console.log(`[${version}] Migration already applied, skipping`);
      }
    }
    
    if (appliedCount === 0) {
      console.log('\nAll migrations are already applied. No new migrations to run.');
    } else {
      console.log(`\n✅ Successfully applied ${appliedCount} migration(s)`);
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

// Note: Migrations should be called explicitly in API routes
// We don't auto-run here to avoid blocking module import

// Run migrations when executed directly
if (require.main === module) {
  console.log('Migration script started');
  runMigrations()
    .then(() => {
      console.log('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to run migrations:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      process.exit(1);
    });
}
