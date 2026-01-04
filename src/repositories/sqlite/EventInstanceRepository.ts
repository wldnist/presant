// SQLite Implementation of Event Instance Repository
import { v4 as uuidv4 } from 'uuid';
import { EventInstance, Participant } from '@/types';
import { IEventInstanceRepository } from '../interfaces';
import { getDatabase } from '@/infrastructure/database/db';
import { ParticipantRepository } from './ParticipantRepository';

export class EventInstanceRepository implements IEventInstanceRepository {
  private participantRepo = new ParticipantRepository();

  async findAll(): Promise<EventInstance[]> {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT ei.*, me.uuid as master_uuid, me.title as master_title, me.description as master_description,
             me.location as master_location, me.estimated_duration, me.max_participants as master_max_participants,
             me.requirements, me.created_at as master_created_at, me.updated_at as master_updated_at
      FROM event_instances ei
      LEFT JOIN master_events me ON ei.master_event_id = me.uuid
      ORDER BY ei.created_at DESC
    `).all() as any[];
    
    return this.mapRowsToEventInstances(rows);
  }

  async findByUuid(uuid: string): Promise<EventInstance | null> {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT ei.*, me.uuid as master_uuid, me.title as master_title, me.description as master_description,
             me.location as master_location, me.estimated_duration, me.max_participants as master_max_participants,
             me.requirements, me.created_at as master_created_at, me.updated_at as master_updated_at
      FROM event_instances ei
      LEFT JOIN master_events me ON ei.master_event_id = me.uuid
      WHERE ei.uuid = ?
    `).get(uuid) as any;
    
    if (!row) return null;
    
    return this.mapRowToEventInstance(row);
  }

  async findByMasterEventId(masterEventId: string): Promise<EventInstance[]> {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT ei.*, me.uuid as master_uuid, me.title as master_title, me.description as master_description,
             me.location as master_location, me.estimated_duration, me.max_participants as master_max_participants,
             me.requirements, me.created_at as master_created_at, me.updated_at as master_updated_at
      FROM event_instances ei
      LEFT JOIN master_events me ON ei.master_event_id = me.uuid
      WHERE ei.master_event_id = ?
      ORDER BY ei.start_date ASC
    `).all(masterEventId) as any[];
    
    return this.mapRowsToEventInstances(rows);
  }

  async create(eventInstance: Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<EventInstance> {
    const db = getDatabase();
    const uuid = uuidv4();
    const now = new Date().toISOString();
    
    const result = db.prepare(`
      INSERT INTO event_instances (
        uuid, master_event_id, title, description, location, start_date, end_date,
        start_time, end_time, recurrence_type, recurrence_end_date, max_participants, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuid,
      eventInstance.master_event_id,
      eventInstance.title,
      eventInstance.description || null,
      eventInstance.location || null,
      eventInstance.start_date,
      eventInstance.end_date || null,
      eventInstance.start_time || null,
      eventInstance.end_time || null,
      eventInstance.recurrence_type || 'none',
      eventInstance.recurrence_end_date || null,
      eventInstance.max_participants || null,
      eventInstance.status || 'draft',
      now,
      now
    );
    
    // Register participants
    if (eventInstance.registered_participants && eventInstance.registered_participants.length > 0) {
      const insertStmt = db.prepare('INSERT INTO event_instance_participants (event_instance_id, participant_id) VALUES (?, ?)');
      const insertMany = db.transaction((participants: string[]) => {
        for (const participantId of participants) {
          insertStmt.run(uuid, participantId);
        }
      });
      insertMany(eventInstance.registered_participants);
    }
    
    // Fetch created instance with master event
    const created = await this.findByUuid(uuid);
    if (!created) {
      throw new Error('Failed to create event instance');
    }
    
    return created;
  }

  async update(uuid: string, eventInstance: Partial<Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<EventInstance> {
    const db = getDatabase();
    const existing = await this.findByUuid(uuid);
    
    if (!existing) {
      throw new Error('Event instance not found');
    }
    
    const updated = {
      ...existing,
      ...eventInstance,
      updated_at: new Date().toISOString()
    };
    
    db.prepare(`
      UPDATE event_instances
      SET master_event_id = ?, title = ?, description = ?, location = ?, start_date = ?, end_date = ?,
          start_time = ?, end_time = ?, recurrence_type = ?, recurrence_end_date = ?, max_participants = ?, status = ?, updated_at = ?
      WHERE uuid = ?
    `).run(
      updated.master_event_id,
      updated.title,
      updated.description || null,
      updated.location || null,
      updated.start_date,
      updated.end_date || null,
      updated.start_time || null,
      updated.end_time || null,
      updated.recurrence_type || 'none',
      updated.recurrence_end_date || null,
      updated.max_participants || null,
      updated.status,
      updated.updated_at,
      uuid
    );
    
    // Update participants if provided
    if (eventInstance.registered_participants !== undefined) {
      // Delete existing
      db.prepare('DELETE FROM event_instance_participants WHERE event_instance_id = ?').run(uuid);
      
      // Insert new
      if (eventInstance.registered_participants.length > 0) {
        const insertStmt = db.prepare('INSERT INTO event_instance_participants (event_instance_id, participant_id) VALUES (?, ?)');
        const insertMany = db.transaction((participants: string[]) => {
          for (const participantId of participants) {
            insertStmt.run(uuid, participantId);
          }
        });
        insertMany(eventInstance.registered_participants);
      }
    }
    
    return await this.findByUuid(uuid) as EventInstance;
  }

  async delete(uuid: string): Promise<void> {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM event_instances WHERE uuid = ?').run(uuid);
    
    if (result.changes === 0) {
      throw new Error('Event instance not found');
    }
  }

  async registerParticipant(eventInstanceId: string, participantId: string): Promise<void> {
    const db = getDatabase();
    try {
      db.prepare(`
        INSERT INTO event_instance_participants (event_instance_id, participant_id)
        VALUES (?, ?)
      `).run(eventInstanceId, participantId);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        // Already registered, ignore
        return;
      }
      throw error;
    }
  }

  async unregisterParticipant(eventInstanceId: string, participantId: string): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      DELETE FROM event_instance_participants
      WHERE event_instance_id = ? AND participant_id = ?
    `).run(eventInstanceId, participantId);
  }

  async getRegisteredParticipants(eventInstanceId: string): Promise<Participant[]> {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT p.*
      FROM participants p
      INNER JOIN event_instance_participants eip ON p.uuid = eip.participant_id
      WHERE eip.event_instance_id = ?
    `).all(eventInstanceId) as any[];
    
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

  private mapRowToEventInstance(row: any): EventInstance {
    return {
      id: row.id.toString(),
      uuid: row.uuid,
      master_event_id: row.master_event_id,
      master_event: {
        id: row.master_uuid ? '0' : '0',
        uuid: row.master_uuid || row.master_event_id,
        title: row.master_title || row.title,
        description: row.master_description || undefined,
        location: row.master_location || undefined,
        estimated_duration: row.estimated_duration || undefined,
        max_participants: row.master_max_participants || undefined,
        requirements: row.requirements ? JSON.parse(row.requirements) : undefined,
        created_at: row.master_created_at,
        updated_at: row.master_updated_at
      },
      title: row.title,
      description: row.description || undefined,
      location: row.location || undefined,
      start_date: row.start_date,
      end_date: row.end_date || undefined,
      start_time: row.start_time || undefined,
      end_time: row.end_time || undefined,
      recurrence_type: (row.recurrence_type || 'none') as 'none' | 'daily' | 'weekly' | 'monthly',
      recurrence_end_date: row.recurrence_end_date || undefined,
      max_participants: row.max_participants || undefined,
      registered_participants: [], // Will be loaded separately if needed
      status: row.status as 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled',
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private mapRowsToEventInstances(rows: any[]): EventInstance[] {
    return rows.map(row => this.mapRowToEventInstance(row));
  }
}

