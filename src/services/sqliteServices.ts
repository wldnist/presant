// SQLite-based Services Implementation
// Services menggunakan repositories (hexagonal architecture)

import {
  AttendanceService,
  ParticipantService,
  EventService,
  UserService,
  MasterEventService,
  EventInstanceService,
  AttendanceSubmission
} from '@/services/interfaces';
import {
  AttendanceRecord,
  Participant,
  Event,
  Attendance,
  AttendanceStatus,
  SystemUser,
  MasterEvent,
  EventInstance
} from '@/types';
import {
  IParticipantRepository,
  IMasterEventRepository,
  IEventInstanceRepository,
  IAttendanceRepository,
  ISystemUserRepository
} from '@/repositories/interfaces';

export class SqliteAttendanceService implements AttendanceService {
  constructor(
    private attendanceRepo: IAttendanceRepository,
    private participantRepo: IParticipantRepository,
    private eventInstanceRepo: IEventInstanceRepository
  ) {}

  async getAttendanceByEvent(eventId: string): Promise<AttendanceRecord[]> {
    const attendances = await this.attendanceRepo.findByEventId(eventId);
    const records: AttendanceRecord[] = [];

    for (const attendance of attendances) {
      const participant = await this.participantRepo.findByUuid(attendance.participantId);
      if (participant) {
        records.push({
          participant,
          attendance
        });
      }
    }

    return records;
  }

  async getRegisteredParticipantsWithAttendance(eventId: string): Promise<AttendanceRecord[]> {
    const eventInstance = await this.eventInstanceRepo.findByUuid(eventId);
    if (!eventInstance) {
      throw new Error('Event instance not found');
    }

    const registeredParticipants = await this.eventInstanceRepo.getRegisteredParticipants(eventId);
    const existingAttendance = await this.attendanceRepo.findByEventId(eventId);

    const attendanceMap = new Map<string, Attendance>();
    existingAttendance.forEach(att => {
      attendanceMap.set(att.participantId, att);
    });

    return registeredParticipants.map(participant => ({
      participant,
      attendance: attendanceMap.get(participant.uuid) || {
        id: '',
        participantId: participant.uuid,
        eventId: eventId,
        status: 'absent' as AttendanceStatus,
        timestamp: new Date()
      }
    }));
  }

  async updateAttendanceStatus(participantId: string, eventId: string, status: AttendanceStatus): Promise<void> {
    const existing = await this.attendanceRepo.findByParticipantAndEvent(participantId, eventId);
    
    if (existing) {
      await this.attendanceRepo.update({
        ...existing,
        status,
        timestamp: new Date()
      });
    } else {
      await this.attendanceRepo.create({
        participantId,
        eventId,
        status,
        timestamp: new Date()
      });
    }
  }

  async searchParticipants(query: string, eventId: string): Promise<AttendanceRecord[]> {
    const records = await this.getRegisteredParticipantsWithAttendance(eventId);
    const lowercaseQuery = query.toLowerCase();
    
    return records.filter(record =>
      record.participant.name.toLowerCase().includes(lowercaseQuery) ||
      record.participant.phone_number.includes(query)
    );
  }

  async filterByStatus(status: AttendanceStatus | 'all', eventId: string): Promise<AttendanceRecord[]> {
    const records = await this.getRegisteredParticipantsWithAttendance(eventId);
    
    if (status === 'all') {
      return records;
    }
    
    return records.filter(record => record.attendance.status === status);
  }

  async submitAttendance(attendanceData: AttendanceSubmission[]): Promise<void> {
    const attendances = attendanceData.map(data => ({
      participantId: data.participant_id,
      eventId: data.event_id,
      status: data.status,
      timestamp: new Date(data.timestamp)
    }));

    await this.attendanceRepo.bulkCreate(attendances);
  }

  async getAllAttendance(): Promise<AttendanceSubmission[]> {
    // This method needs to get all attendance records
    // For now, we'll need to query by events or implement a different approach
    // Since we don't have a findAll in repository, we'll need to get it from events
    const eventInstances = await this.eventInstanceRepo.findAll();
    const allAttendance: AttendanceSubmission[] = [];

    for (const event of eventInstances) {
      const attendances = await this.attendanceRepo.findByEventId(event.uuid);
      allAttendance.push(...attendances.map(att => ({
        event_id: att.eventId,
        participant_id: att.participantId,
        status: att.status,
        timestamp: att.timestamp.toISOString(),
        notes: ''
      })));
    }

    return allAttendance;
  }
}

export class SqliteParticipantService implements ParticipantService {
  constructor(private participantRepo: IParticipantRepository) {}

  async getAllParticipants(): Promise<Participant[]> {
    return await this.participantRepo.findAll();
  }

  async getParticipantByUuid(uuid: string): Promise<Participant | null> {
    return await this.participantRepo.findByUuid(uuid);
  }

  async createParticipant(participant: Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<Participant> {
    return await this.participantRepo.create(participant);
  }

  async updateParticipant(uuid: string, participant: Partial<Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<Participant> {
    return await this.participantRepo.update(uuid, participant);
  }

  async deleteParticipant(uuid: string): Promise<void> {
    return await this.participantRepo.delete(uuid);
  }
}

export class SqliteEventService implements EventService {
  constructor(private eventInstanceRepo: IEventInstanceRepository) {}

  async getAllEvents(): Promise<Event[]> {
    const instances = await this.eventInstanceRepo.findAll();
    return instances.map(instance => ({
      id: instance.uuid,
      title: instance.title,
      date: instance.start_date,
      description: instance.description,
      location: instance.location
    }));
  }

  async getEventsToday(): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    const instances = await this.eventInstanceRepo.findAll();
    return instances
      .filter(instance => instance.start_date === today)
      .map(instance => ({
        id: instance.uuid,
        title: instance.title,
        date: instance.start_date,
        description: instance.description,
        location: instance.location
      }));
  }

  async getEventById(id: string): Promise<Event | null> {
    const instance = await this.eventInstanceRepo.findByUuid(id);
    if (!instance) return null;
    
    return {
      id: instance.uuid,
      title: instance.title,
      date: instance.start_date,
      description: instance.description,
      location: instance.location
    };
  }

  async createEvent(_event: Omit<Event, 'id'>): Promise<Event> {
    // This is a legacy method - Event is now EventInstance
    // We'll need a master event to create an instance
    throw new Error('Use EventInstanceService instead');
  }

  async updateEvent(_id: string, _event: Partial<Event>): Promise<Event> {
    throw new Error('Use EventInstanceService instead');
  }

  async deleteEvent(id: string): Promise<void> {
    await this.eventInstanceRepo.delete(id);
  }
}

export class SqliteUserService implements UserService {
  constructor(private userRepo: ISystemUserRepository) {}

  async getAllUsers(): Promise<SystemUser[]> {
    return await this.userRepo.findAll();
  }

  async getUserByUuid(uuid: string): Promise<SystemUser | null> {
    return await this.userRepo.findByUuid(uuid);
  }

  async createUser(user: Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>): Promise<SystemUser> {
    return await this.userRepo.create(user);
  }

  async updateUser(uuid: string, user: Partial<Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>>): Promise<SystemUser> {
    return await this.userRepo.update(uuid, user);
  }

  async deleteUser(uuid: string): Promise<void> {
    return await this.userRepo.delete(uuid);
  }

  async searchUsers(query: string): Promise<SystemUser[]> {
    return await this.userRepo.search(query);
  }
}

export class SqliteMasterEventService implements MasterEventService {
  constructor(private masterEventRepo: IMasterEventRepository) {}

  async getAllMasterEvents(): Promise<MasterEvent[]> {
    return await this.masterEventRepo.findAll();
  }

  async getMasterEventByUuid(uuid: string): Promise<MasterEvent | null> {
    return await this.masterEventRepo.findByUuid(uuid);
  }

  async createMasterEvent(masterEvent: Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<MasterEvent> {
    return await this.masterEventRepo.create(masterEvent);
  }

  async updateMasterEvent(uuid: string, masterEvent: Partial<Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<MasterEvent> {
    return await this.masterEventRepo.update(uuid, masterEvent);
  }

  async deleteMasterEvent(uuid: string): Promise<void> {
    return await this.masterEventRepo.delete(uuid);
  }

  async searchMasterEvents(query: string): Promise<MasterEvent[]> {
    return await this.masterEventRepo.search(query);
  }
}

export class SqliteEventInstanceService implements EventInstanceService {
  constructor(private eventInstanceRepo: IEventInstanceRepository) {}

  async getAllEventInstances(): Promise<EventInstance[]> {
    const instances = await this.eventInstanceRepo.findAll();
    
    // Load registered participants for each instance
    for (const instance of instances) {
      instance.registered_participants = (await this.eventInstanceRepo.getRegisteredParticipants(instance.uuid))
        .map(p => p.uuid);
    }
    
    return instances;
  }

  async getEventInstanceByUuid(uuid: string): Promise<EventInstance | null> {
    const instance = await this.eventInstanceRepo.findByUuid(uuid);
    if (!instance) return null;
    
    instance.registered_participants = (await this.eventInstanceRepo.getRegisteredParticipants(uuid))
      .map(p => p.uuid);
    
    return instance;
  }

  async getEventInstancesByMasterEvent(masterEventId: string): Promise<EventInstance[]> {
    const instances = await this.eventInstanceRepo.findByMasterEventId(masterEventId);
    
    for (const instance of instances) {
      instance.registered_participants = (await this.eventInstanceRepo.getRegisteredParticipants(instance.uuid))
        .map(p => p.uuid);
    }
    
    return instances;
  }

  async createEventInstance(eventInstance: Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<EventInstance> {
    return await this.eventInstanceRepo.create(eventInstance);
  }

  async updateEventInstance(uuid: string, eventInstance: Partial<Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<EventInstance> {
    return await this.eventInstanceRepo.update(uuid, eventInstance);
  }

  async deleteEventInstance(uuid: string): Promise<void> {
    return await this.eventInstanceRepo.delete(uuid);
  }

  async registerParticipant(eventInstanceId: string, participantId: string): Promise<void> {
    return await this.eventInstanceRepo.registerParticipant(eventInstanceId, participantId);
  }

  async unregisterParticipant(eventInstanceId: string, participantId: string): Promise<void> {
    return await this.eventInstanceRepo.unregisterParticipant(eventInstanceId, participantId);
  }

  async getRegisteredParticipants(eventInstanceId: string): Promise<Participant[]> {
    return await this.eventInstanceRepo.getRegisteredParticipants(eventInstanceId);
  }
}

