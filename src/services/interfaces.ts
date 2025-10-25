import { 
  AttendanceRecord, 
  AttendanceStatus, 
  Participant, 
  Event, 
  Attendance,
  SystemUser,
  UserRole,
  MasterEvent,
  EventInstance
} from '@/types';

// Domain Services
export interface AttendanceService {
  getAttendanceByEvent(eventId: string): Promise<AttendanceRecord[]>;
  updateAttendanceStatus(participantId: string, eventId: string, status: AttendanceStatus): Promise<void>;
  searchParticipants(query: string, eventId: string): Promise<AttendanceRecord[]>;
  filterByStatus(status: AttendanceStatus | 'all', eventId: string): Promise<AttendanceRecord[]>;
}

export interface ParticipantService {
  getAllParticipants(): Promise<Participant[]>;
  getParticipantByUuid(uuid: string): Promise<Participant | null>;
  createParticipant(participant: Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<Participant>;
  updateParticipant(uuid: string, participant: Partial<Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<Participant>;
  deleteParticipant(uuid: string): Promise<void>;
}

export interface EventService {
  getAllEvents(): Promise<Event[]>;
  getEventsToday(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  createEvent(event: Omit<Event, 'id'>): Promise<Event>;
  updateEvent(id: string, event: Partial<Event>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
}

// User Management Services
export interface UserService {
  getAllUsers(): Promise<SystemUser[]>;
  getUserByUuid(uuid: string): Promise<SystemUser | null>;
  createUser(user: Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>): Promise<SystemUser>;
  updateUser(uuid: string, user: Partial<Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>>): Promise<SystemUser>;
  deleteUser(uuid: string): Promise<void>;
  searchUsers(query: string): Promise<SystemUser[]>;
}

// Repository Interfaces
export interface AttendanceRepository {
  findByEventId(eventId: string): Promise<Attendance[]>;
  findByParticipantId(participantId: string): Promise<Attendance[]>;
  save(attendance: Attendance): Promise<void>;
  update(attendance: Attendance): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ParticipantRepository {
  findAll(): Promise<Participant[]>;
  findById(id: string): Promise<Participant | null>;
  save(participant: Participant): Promise<void>;
  update(participant: Participant): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface EventRepository {
  findAll(): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  save(event: Event): Promise<void>;
  update(event: Event): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface UserRepository {
  findAll(): Promise<SystemUser[]>;
  findByUuid(uuid: string): Promise<SystemUser | null>;
  save(user: SystemUser): Promise<void>;
  update(user: SystemUser): Promise<void>;
  delete(uuid: string): Promise<void>;
}

// Event Management Services
export interface MasterEventService {
  getAllMasterEvents(): Promise<MasterEvent[]>;
  getMasterEventByUuid(uuid: string): Promise<MasterEvent | null>;
  createMasterEvent(masterEvent: Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<MasterEvent>;
  updateMasterEvent(uuid: string, masterEvent: Partial<Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<MasterEvent>;
  deleteMasterEvent(uuid: string): Promise<void>;
  searchMasterEvents(query: string): Promise<MasterEvent[]>;
}

export interface EventInstanceService {
  getAllEventInstances(): Promise<EventInstance[]>;
  getEventInstanceByUuid(uuid: string): Promise<EventInstance | null>;
  getEventInstancesByMasterEvent(masterEventId: string): Promise<EventInstance[]>;
  createEventInstance(eventInstance: Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<EventInstance>;
  updateEventInstance(uuid: string, eventInstance: Partial<Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<EventInstance>;
  deleteEventInstance(uuid: string): Promise<void>;
  registerParticipant(eventInstanceId: string, participantId: string): Promise<void>;
  unregisterParticipant(eventInstanceId: string, participantId: string): Promise<void>;
  getRegisteredParticipants(eventInstanceId: string): Promise<Participant[]>;
}
