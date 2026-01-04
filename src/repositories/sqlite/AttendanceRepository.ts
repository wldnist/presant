// SQLite Implementation of Attendance Repository
import { Attendance, AttendanceStatus } from '@/types';
import { IAttendanceRepository } from '../interfaces';
import { getDatabase } from '@/infrastructure/database/db';
import { AttendanceRow } from '@/infrastructure/database/types';

export class AttendanceRepository implements IAttendanceRepository {
  async findByEventId(eventId: string): Promise<Attendance[]> {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM attendance WHERE event_id = ? ORDER BY timestamp DESC').all(eventId) as AttendanceRow[];
    
    return rows.map(row => ({
      id: row.id.toString(),
      participantId: row.participant_id,
      eventId: row.event_id,
      status: row.status as AttendanceStatus,
      timestamp: new Date(row.timestamp)
    }));
  }

  async findByParticipantId(participantId: string): Promise<Attendance[]> {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM attendance WHERE participant_id = ? ORDER BY timestamp DESC').all(participantId) as AttendanceRow[];
    
    return rows.map(row => ({
      id: row.id.toString(),
      participantId: row.participant_id,
      eventId: row.event_id,
      status: row.status as AttendanceStatus,
      timestamp: new Date(row.timestamp)
    }));
  }

  async findByParticipantAndEvent(participantId: string, eventId: string): Promise<Attendance | null> {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM attendance WHERE participant_id = ? AND event_id = ?').get(participantId, eventId) as AttendanceRow | undefined;
    
    if (!row) return null;
    
    return {
      id: row.id.toString(),
      participantId: row.participant_id,
      eventId: row.event_id,
      status: row.status as AttendanceStatus,
      timestamp: new Date(row.timestamp)
    };
  }

  async create(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO attendance (participant_id, event_id, status, timestamp, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      attendance.participantId,
      attendance.eventId,
      attendance.status,
      attendance.timestamp.toISOString(),
      null
    );
    
    return {
      id: result.lastInsertRowid.toString(),
      ...attendance
    };
  }

  async update(attendance: Attendance): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      UPDATE attendance
      SET status = ?, timestamp = ?, notes = ?
      WHERE id = ?
    `).run(
      attendance.status,
      attendance.timestamp.toISOString(),
      null,
      attendance.id
    );
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    db.prepare('DELETE FROM attendance WHERE id = ?').run(id);
  }

  async bulkCreate(attendances: Omit<Attendance, 'id'>[]): Promise<void> {
    if (attendances.length === 0) return;
    
    const db = getDatabase();
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO attendance (participant_id, event_id, status, timestamp, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((items: Omit<Attendance, 'id'>[]) => {
      for (const attendance of items) {
        insertStmt.run(
          attendance.participantId,
          attendance.eventId,
          attendance.status,
          attendance.timestamp.toISOString(),
          null
        );
      }
    });
    
    insertMany(attendances);
  }
}

