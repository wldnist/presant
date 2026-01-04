// SQLite Implementation of Participant Repository
import { v4 as uuidv4 } from 'uuid';
import { Participant } from '@/types';
import { IParticipantRepository } from '../interfaces';
import { getDatabase } from '@/infrastructure/database/db';
import { ParticipantRow } from '@/infrastructure/database/types';
import { dbAll, dbGet, dbRun } from '@/infrastructure/database/dbHelpers';

export class ParticipantRepository implements IParticipantRepository {
  async findAll(): Promise<Participant[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM participants ORDER BY created_at DESC');
    const rows = await dbAll(stmt) as ParticipantRow[];
    
    return rows.map(row => ({
      id: row.id.toString(),
      uuid: row.uuid,
      name: row.name,
      phone_number: row.phone_number,
      gender: row.gender as 'L' | 'P',
      age: row.age,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async findByUuid(uuid: string): Promise<Participant | null> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM participants WHERE uuid = ?');
    const row = await dbGet(stmt, uuid) as ParticipantRow | undefined;
    
    if (!row) return null;
    
    return {
      id: row.id.toString(),
      uuid: row.uuid,
      name: row.name,
      phone_number: row.phone_number,
      gender: row.gender as 'L' | 'P',
      age: row.age,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async create(participant: Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<Participant> {
    const db = getDatabase();
    const uuid = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO participants (uuid, name, phone_number, gender, age, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = await dbRun(stmt,
      uuid,
      participant.name,
      participant.phone_number,
      participant.gender,
      participant.age,
      now,
      now
    );
    
    return {
      id: result.lastInsertRowid.toString(),
      uuid,
      ...participant,
      created_at: now,
      updated_at: now
    };
  }

  async update(uuid: string, participant: Partial<Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<Participant> {
    const db = getDatabase();
    const existing = await this.findByUuid(uuid);
    
    if (!existing) {
      throw new Error('Participant not found');
    }
    
    const updated = {
      ...existing,
      ...participant,
      updated_at: new Date().toISOString()
    };
    
    const stmt = db.prepare(`
      UPDATE participants
      SET name = ?, phone_number = ?, gender = ?, age = ?, updated_at = ?
      WHERE uuid = ?
    `);
    await dbRun(stmt,
      updated.name,
      updated.phone_number,
      updated.gender,
      updated.age,
      updated.updated_at,
      uuid
    );
    
    return updated;
  }

  async delete(uuid: string): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM participants WHERE uuid = ?');
    const result = await dbRun(stmt, uuid);
    
    if (result.changes === 0) {
      throw new Error('Participant not found');
    }
  }
}

