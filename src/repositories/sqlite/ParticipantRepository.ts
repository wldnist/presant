// SQLite Implementation of Participant Repository
import { v4 as uuidv4 } from 'uuid';
import { Participant } from '@/types';
import { IParticipantRepository } from '../interfaces';
import { getDatabase } from '@/infrastructure/database/db';

export class ParticipantRepository implements IParticipantRepository {
  async findAll(): Promise<Participant[]> {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM participants ORDER BY created_at DESC').all() as any[];
    
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
    const row = db.prepare('SELECT * FROM participants WHERE uuid = ?').get(uuid) as any;
    
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
    
    const result = db.prepare(`
      INSERT INTO participants (uuid, name, phone_number, gender, age, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
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
    
    db.prepare(`
      UPDATE participants
      SET name = ?, phone_number = ?, gender = ?, age = ?, updated_at = ?
      WHERE uuid = ?
    `).run(
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
    const result = db.prepare('DELETE FROM participants WHERE uuid = ?').run(uuid);
    
    if (result.changes === 0) {
      throw new Error('Participant not found');
    }
  }
}

