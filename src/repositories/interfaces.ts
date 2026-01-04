// Repository Interfaces (Hexagonal Architecture)
// Ports untuk domain layer - bisa diimplementasi dengan berbagai teknologi

import {
  Participant,
  MasterEvent,
  EventInstance,
  Attendance,
  SystemUser,
  AttendanceStatus
} from '@/types';

// Participant Repository
export interface IParticipantRepository {
  findAll(): Promise<Participant[]>;
  findByUuid(uuid: string): Promise<Participant | null>;
  create(participant: Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<Participant>;
  update(uuid: string, participant: Partial<Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<Participant>;
  delete(uuid: string): Promise<void>;
}

// Master Event Repository
export interface IMasterEventRepository {
  findAll(): Promise<MasterEvent[]>;
  findByUuid(uuid: string): Promise<MasterEvent | null>;
  create(masterEvent: Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<MasterEvent>;
  update(uuid: string, masterEvent: Partial<Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<MasterEvent>;
  delete(uuid: string): Promise<void>;
  search(query: string): Promise<MasterEvent[]>;
}

// Event Instance Repository
export interface IEventInstanceRepository {
  findAll(): Promise<EventInstance[]>;
  findByUuid(uuid: string): Promise<EventInstance | null>;
  findByMasterEventId(masterEventId: string): Promise<EventInstance[]>;
  create(eventInstance: Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<EventInstance>;
  update(uuid: string, eventInstance: Partial<Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<EventInstance>;
  delete(uuid: string): Promise<void>;
  registerParticipant(eventInstanceId: string, participantId: string): Promise<void>;
  unregisterParticipant(eventInstanceId: string, participantId: string): Promise<void>;
  getRegisteredParticipants(eventInstanceId: string): Promise<Participant[]>;
}

// Attendance Repository
export interface IAttendanceRepository {
  findByEventId(eventId: string): Promise<Attendance[]>;
  findByParticipantId(participantId: string): Promise<Attendance[]>;
  findByParticipantAndEvent(participantId: string, eventId: string): Promise<Attendance | null>;
  create(attendance: Omit<Attendance, 'id'>): Promise<Attendance>;
  update(attendance: Attendance): Promise<void>;
  delete(id: string): Promise<void>;
  bulkCreate(attendances: Omit<Attendance, 'id'>[]): Promise<void>;
}

// System User Repository
export interface ISystemUserRepository {
  findAll(): Promise<SystemUser[]>;
  findByUuid(uuid: string): Promise<SystemUser | null>;
  findByUsername(username: string): Promise<SystemUser | null>;
  create(user: Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>): Promise<SystemUser>;
  update(uuid: string, user: Partial<Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>>): Promise<SystemUser>;
  delete(uuid: string): Promise<void>;
  search(query: string): Promise<SystemUser[]>;
}

