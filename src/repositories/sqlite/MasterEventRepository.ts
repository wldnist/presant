// SQLite Implementation of Master Event Repository
import { v4 as uuidv4 } from 'uuid';
import { MasterEvent } from '@/types';
import { IMasterEventRepository } from '../interfaces';
import { getDatabase } from '@/infrastructure/database/db';
import { MasterEventRow } from '@/infrastructure/database/types';
import { dbAll, dbGet, dbRun } from '@/infrastructure/database/dbHelpers';

export class MasterEventRepository implements IMasterEventRepository {
  async findAll(): Promise<MasterEvent[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM master_events ORDER BY created_at DESC');
    const rows = await dbAll(stmt) as MasterEventRow[];
    
    return rows.map(row => ({
      id: row.id.toString(),
      uuid: row.uuid,
      title: row.title,
      description: row.description || undefined,
      location: row.location || undefined,
      estimated_duration: row.estimated_duration || undefined,
      max_participants: row.max_participants || undefined,
      requirements: row.requirements ? JSON.parse(row.requirements) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async findByUuid(uuid: string): Promise<MasterEvent | null> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM master_events WHERE uuid = ?');
    const row = await dbGet(stmt, uuid) as MasterEventRow | undefined;
    
    if (!row) return null;
    
    return {
      id: row.id.toString(),
      uuid: row.uuid,
      title: row.title,
      description: row.description || undefined,
      location: row.location || undefined,
      estimated_duration: row.estimated_duration || undefined,
      max_participants: row.max_participants || undefined,
      requirements: row.requirements ? JSON.parse(row.requirements) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async create(masterEvent: Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<MasterEvent> {
    const db = getDatabase();
    const uuid = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO master_events (uuid, title, description, location, estimated_duration, max_participants, requirements, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = await dbRun(stmt,
      uuid,
      masterEvent.title,
      masterEvent.description || null,
      masterEvent.location || null,
      masterEvent.estimated_duration || null,
      masterEvent.max_participants || null,
      masterEvent.requirements ? JSON.stringify(masterEvent.requirements) : null,
      now,
      now
    );
    
    return {
      id: result.lastInsertRowid.toString(),
      uuid,
      ...masterEvent,
      created_at: now,
      updated_at: now
    };
  }

  async update(uuid: string, masterEvent: Partial<Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<MasterEvent> {
    const db = getDatabase();
    const existing = await this.findByUuid(uuid);
    
    if (!existing) {
      throw new Error('Master event not found');
    }
    
    const updated = {
      ...existing,
      ...masterEvent,
      updated_at: new Date().toISOString()
    };
    
    const stmt = db.prepare(`
      UPDATE master_events
      SET title = ?, description = ?, location = ?, estimated_duration = ?, max_participants = ?, requirements = ?, updated_at = ?
      WHERE uuid = ?
    `);
    await dbRun(stmt,
      updated.title,
      updated.description || null,
      updated.location || null,
      updated.estimated_duration || null,
      updated.max_participants || null,
      updated.requirements ? JSON.stringify(updated.requirements) : null,
      updated.updated_at,
      uuid
    );
    
    return updated;
  }

  async delete(uuid: string): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM master_events WHERE uuid = ?');
    const result = await dbRun(stmt, uuid);
    
    if (result.changes === 0) {
      throw new Error('Master event not found');
    }
  }

  async search(query: string): Promise<MasterEvent[]> {
    const db = getDatabase();
    const searchTerm = `%${query.toLowerCase()}%`;
    const stmt = db.prepare(`
      SELECT * FROM master_events
      WHERE LOWER(title) LIKE ? 
         OR LOWER(description) LIKE ?
         OR LOWER(location) LIKE ?
      ORDER BY created_at DESC
    `);
    const rows = await dbAll(stmt, searchTerm, searchTerm, searchTerm) as MasterEventRow[];
    
    return rows.map(row => ({
      id: row.id.toString(),
      uuid: row.uuid,
      title: row.title,
      description: row.description || undefined,
      location: row.location || undefined,
      estimated_duration: row.estimated_duration || undefined,
      max_participants: row.max_participants || undefined,
      requirements: row.requirements ? JSON.parse(row.requirements) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }
}

