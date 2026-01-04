// Database Seed Data (for development)
import { getDatabase } from './db';
import { runMigrations } from './migrate';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcryptjs';
import { dbGet, dbRun } from './dbHelpers';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
if (typeof window === 'undefined') {
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line: string) => {
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

export async function seedDatabase(): Promise<void> {
  // Run migrations first (wait for completion)
  console.log('Running migrations first...');
  await runMigrations();
  
  const db = getDatabase();
  
  // Check if data already exists
  const participantStmt = db.prepare('SELECT COUNT(*) as count FROM participants');
  const participantCount = await dbGet(participantStmt) as { count: number };
  const userStmt = db.prepare('SELECT COUNT(*) as count FROM system_users');
  const userCount = await dbGet(userStmt) as { count: number };
  
  if (participantCount.count > 0 && userCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }
  
  console.log('Seeding database...');
  
  // Seed Participants
  const participants = [
    { name: 'Dwi Santoso', phone_number: '081234567890', gender: 'L' as const, age: 25 },
    { name: 'Rina Maharani', phone_number: '081234567891', gender: 'P' as const, age: 22 },
    { name: 'Bambang Sutrisno', phone_number: '081234567892', gender: 'L' as const, age: 35 },
    { name: 'Ahmad Yusuf', phone_number: '081234567893', gender: 'L' as const, age: 28 },
    { name: 'Winda Ayu', phone_number: '081234567894', gender: 'P' as const, age: 30 }
  ];
  
  const insertParticipant = db.prepare(`
    INSERT INTO participants (uuid, name, phone_number, gender, age, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  const participantUuids: string[] = [];
  for (const p of participants) {
    const uuid = uuidv4();
    participantUuids.push(uuid);
    await dbRun(insertParticipant, uuid, p.name, p.phone_number, p.gender, p.age);
  }
  console.log(`Seeded ${participants.length} participants`);
  
  // Seed Master Events (MUST be before Event Instances due to foreign key)
  const masterEvents = [
    { title: 'Kajian Rutin', description: 'Kajian mingguan', location: 'Masjid Al-Ikhlas' },
    { title: 'Pelatihan', description: 'Pelatihan keterampilan', location: 'Aula Serbaguna' }
  ];
  
  const insertMasterEvent = db.prepare(`
    INSERT INTO master_events (uuid, title, description, location, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  const masterEventUuids: string[] = [];
  for (const me of masterEvents) {
    const uuid = uuidv4();
    masterEventUuids.push(uuid);
    await dbRun(insertMasterEvent, uuid, me.title, me.description, me.location);
  }
  console.log(`Seeded ${masterEvents.length} master events`);
  
  // Seed Event Instances (after Master Events)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const insertEventInstance = db.prepare(`
    INSERT INTO event_instances (
      uuid, master_event_id, title, description, location, start_date, end_date,
      start_time, end_time, recurrence_type, status, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  const eventInstanceUuids: string[] = [];
  for (let i = 0; i < masterEventUuids.length; i++) {
    const uuid = uuidv4();
    eventInstanceUuids.push(uuid);
    await dbRun(insertEventInstance,
      uuid,
      masterEventUuids[i],
      masterEvents[i].title,
      masterEvents[i].description,
      masterEvents[i].location,
      i === 0 ? today : tomorrow,
      i === 0 ? today : tomorrow,
      '08:00',
      '10:00',
      'weekly',
      'published'
    );
    
    // Register some participants (after Event Instance is created)
    const insertRegistration = db.prepare(`
      INSERT INTO event_instance_participants (event_instance_id, participant_id, created_at)
      VALUES (?, ?, datetime('now'))
    `);
    
    // Register first 3 participants to first event
    if (i === 0) {
      for (let j = 0; j < 3; j++) {
        await dbRun(insertRegistration, uuid, participantUuids[j]);
      }
    }
  }
  console.log(`Seeded ${eventInstanceUuids.length} event instances`);
  
  // Seed System Users (jika belum ada)
  if (userCount.count === 0) {
    console.log('Seeding system users...');
    const insertUser = db.prepare(`
      INSERT INTO system_users (uuid, username, password, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    // Hash passwords dengan bcrypt
    const adminPasswordHash = await hash('admin123', 10);
    const userPasswordHash = await hash('user123', 10);
    
    // Create default admin user (password: admin123)
    await dbRun(insertUser,
      uuidv4(),
      'admin',
      adminPasswordHash,
      'SUPERADMIN',
      1
    );
    
    // Create test user (password: user123)
    await dbRun(insertUser,
      uuidv4(),
      'user',
      userPasswordHash,
      'USER',
      1
    );
    
    console.log('System users seeded: admin/admin123, user/user123');
  }
  
  console.log('Database seeded successfully!');
}

// Run seed if this file is executed directly (for development)
if (require.main === module) {
  console.log('Seed script started');
  seedDatabase()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed database:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      process.exit(1);
    });
}

