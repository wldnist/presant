// SQLite Implementation of System User Repository
import { v4 as uuidv4 } from 'uuid';
import { SystemUser, UserRole } from '@/types';
import { ISystemUserRepository } from '../interfaces';
import { getDatabase } from '@/infrastructure/database/db';
import { hash } from 'bcryptjs';

interface SystemUserRow {
  uuid: string;
  username: string;
  password: string;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export class SystemUserRepository implements ISystemUserRepository {
  async findAll(): Promise<SystemUser[]> {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM system_users ORDER BY created_at DESC').all() as SystemUserRow[];
    
    return rows.map(row => ({
      uuid: row.uuid,
      username: row.username,
      password: row.password,
      role: row.role as UserRole,
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async findByUuid(uuid: string): Promise<SystemUser | null> {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM system_users WHERE uuid = ?').get(uuid) as SystemUserRow | undefined;
    
    if (!row) return null;
    
    return {
      uuid: row.uuid,
      username: row.username,
      password: row.password,
      role: row.role as UserRole,
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async findByUsername(username: string): Promise<SystemUser | null> {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM system_users WHERE username = ?').get(username) as SystemUserRow | undefined;
    
    if (!row) return null;
    
    return {
      uuid: row.uuid,
      username: row.username,
      password: row.password,
      role: row.role as UserRole,
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async create(user: Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>): Promise<SystemUser> {
    const db = getDatabase();
    const uuid = uuidv4();
    const now = new Date().toISOString();
    
    // Hash password jika belum di-hash (cek apakah sudah dimulai dengan $2)
    let hashedPassword = user.password;
    if (!user.password.startsWith('$2')) {
      hashedPassword = await hash(user.password, 10);
    }
    
    db.prepare(`
      INSERT INTO system_users (uuid, username, password, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuid,
      user.username,
      hashedPassword,
      user.role,
      user.is_active ? 1 : 0,
      now,
      now
    );
    
    return {
      uuid,
      ...user,
      password: hashedPassword,
      created_at: now,
      updated_at: now
    };
  }

  async update(uuid: string, user: Partial<Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>>): Promise<SystemUser> {
    const db = getDatabase();
    const existing = await this.findByUuid(uuid);
    
    if (!existing) {
      throw new Error('User not found');
    }
    
    // Hash password jika ada dan belum di-hash
    let hashedPassword = existing.password;
    if (user.password && user.password !== existing.password) {
      // Cek apakah password baru sudah di-hash
      if (!user.password.startsWith('$2')) {
        hashedPassword = await hash(user.password, 10);
      } else {
        hashedPassword = user.password;
      }
    }
    
    const updated = {
      ...existing,
      ...user,
      password: hashedPassword,
      updated_at: new Date().toISOString()
    };
    
    db.prepare(`
      UPDATE system_users
      SET username = ?, password = ?, role = ?, is_active = ?, updated_at = ?
      WHERE uuid = ?
    `).run(
      updated.username,
      updated.password,
      updated.role,
      updated.is_active ? 1 : 0,
      updated.updated_at,
      uuid
    );
    
    return updated;
  }

  async delete(uuid: string): Promise<void> {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM system_users WHERE uuid = ?').run(uuid);
    
    if (result.changes === 0) {
      throw new Error('User not found');
    }
  }

  async search(query: string): Promise<SystemUser[]> {
    const db = getDatabase();
    const searchTerm = `%${query.toLowerCase()}%`;
    const rows = db.prepare(`
      SELECT * FROM system_users
      WHERE LOWER(username) LIKE ? OR LOWER(role) LIKE ?
      ORDER BY created_at DESC
    `).all(searchTerm, searchTerm) as SystemUserRow[];
    
    return rows.map(row => ({
      uuid: row.uuid,
      username: row.username,
      password: row.password,
      role: row.role as UserRole,
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }
}

