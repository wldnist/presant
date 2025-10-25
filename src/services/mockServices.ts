// Mock Services Implementation
import { 
  AttendanceService, 
  ParticipantService, 
  EventService, 
  UserService,
  MasterEventService,
  EventInstanceService,
  AttendanceSubmission
} from '@/services/interfaces';
import { Attendance } from '@/types';
import moment from 'moment';
import 'moment/locale/id';
import { 
  AttendanceRecord, 
  Participant, 
  Event, 
  AttendanceStatus, 
  SystemUser,
  MasterEvent,
  EventInstance
} from '@/types';
import { 
  mockParticipants, 
  mockEvents, 
  mockAttendance, 
  mockUsers,
  mockMasterEvents,
  mockEventInstances
} from '@/data/mockData';

export class MockAttendanceService implements AttendanceService {
  async getRegisteredParticipantsWithAttendance(eventId: string): Promise<AttendanceRecord[]> {
    // Find the event instance
    const eventInstance = mockEventInstances.find(inst => inst.id === eventId);
    if (!eventInstance) throw new Error('Event instance not found');
    
    // Get all registered participants
    const registeredParticipants = eventInstance.registered_participants
      .map(participantId => mockParticipants.find(p => p.uuid === participantId))
      .filter((p): p is Participant => p !== undefined);
    
    // Get existing attendance records for this event
    const existingAttendance = mockAttendance.filter(a => a.eventId === eventId);
    
    // Create attendance map
    const attendanceMap = new Map();
    existingAttendance.forEach(att => {
      attendanceMap.set(att.participantId, att);
    });
    
    // Return all registered participants with their attendance status
    return registeredParticipants.map(participant => {
      const existingAtt = attendanceMap.get(participant.id);
      
      return {
        participant,
        attendance: existingAtt || {
          id: `temp-${participant.id}-${eventId}`,
          eventId,
          participantId: participant.id,
          status: 'absent' as AttendanceStatus,
          timestamp: new Date(),
          notes: ''
        }
      };
    });
  }

  async getAttendanceByEvent(eventId: string): Promise<AttendanceRecord[]> {
    const eventAttendance = mockAttendance.filter(a => a.eventId === eventId);
    
    return eventAttendance.map(attendance => {
      const participant = mockParticipants.find(p => p.id === attendance.participantId);
      if (!participant) throw new Error('Participant not found');
      
      return {
        participant,
        attendance
      };
    });
  }

  async updateAttendanceStatus(participantId: string, eventId: string, status: AttendanceStatus): Promise<void> {
    const attendanceIndex = mockAttendance.findIndex(
      a => a.participantId === participantId && a.eventId === eventId
    );
    
    if (attendanceIndex !== -1) {
      mockAttendance[attendanceIndex].status = status;
      mockAttendance[attendanceIndex].timestamp = new Date();
    } else {
      // Create new attendance record
      const newAttendance = {
        id: Date.now().toString(),
        participantId,
        eventId,
        status,
        timestamp: new Date()
      };
      mockAttendance.push(newAttendance);
    }
  }

  async searchParticipants(query: string, eventId: string): Promise<AttendanceRecord[]> {
    const allRecords = await this.getAttendanceByEvent(eventId);
    const lowercaseQuery = query.toLowerCase();
    
    return allRecords.filter(record =>
      record.participant.name.toLowerCase().includes(lowercaseQuery) ||
      record.participant.phone_number.includes(lowercaseQuery)
    );
  }

  async filterByStatus(status: AttendanceStatus | 'all', eventId: string): Promise<AttendanceRecord[]> {
    const allRecords = await this.getAttendanceByEvent(eventId);
    
    if (status === 'all') {
      return allRecords;
    }
    
    return allRecords.filter(record => record.attendance.status === status);
  }

  async submitAttendance(attendanceData: AttendanceSubmission[]): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Implement upsert logic: update existing or create new
    attendanceData.forEach(submission => {
      // Find existing attendance record
      const existingIndex = mockAttendance.findIndex(att => 
        att.eventId === submission.event_id && att.participantId === submission.participant_id
      );
      
      if (existingIndex !== -1) {
        // Update existing record
        mockAttendance[existingIndex] = {
          ...mockAttendance[existingIndex],
          status: submission.status,
          timestamp: new Date(submission.timestamp)
        };
      } else {
        // Create new record
        const newAttendance: Attendance = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          eventId: submission.event_id,
          participantId: submission.participant_id,
          status: submission.status,
          timestamp: new Date(submission.timestamp)
        };
        mockAttendance.push(newAttendance);
      }
    });
    
    console.log('Attendance submitted and saved:', attendanceData);
  }

  async getAllAttendance(): Promise<AttendanceSubmission[]> {
    // Return all attendance records for reporting
    return mockAttendance.map(att => ({
      event_id: att.eventId,
      participant_id: att.participantId,
      status: att.status,
      timestamp: att.timestamp.toISOString(),
      notes: ''
    }));
  }
}

export class MockParticipantService implements ParticipantService {
  async getAllParticipants(): Promise<Participant[]> {
    return [...mockParticipants];
  }

  async getParticipantByUuid(uuid: string): Promise<Participant | null> {
    return mockParticipants.find(p => p.uuid === uuid) || null;
  }

  async createParticipant(participant: Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<Participant> {
    const newParticipant: Participant = {
      id: (mockParticipants.length + 1).toString(), // Generate a simple ID
      ...participant,
      uuid: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockParticipants.push(newParticipant);
    return newParticipant;
  }

  async updateParticipant(uuid: string, participant: Partial<Omit<Participant, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<Participant> {
    const index = mockParticipants.findIndex(p => p.uuid === uuid);
    if (index === -1) throw new Error('Participant not found');
    
    mockParticipants[index] = { 
      ...mockParticipants[index], 
      ...participant, 
      updated_at: new Date().toISOString() 
    };
    return mockParticipants[index];
  }

  async deleteParticipant(uuid: string): Promise<void> {
    const index = mockParticipants.findIndex(p => p.uuid === uuid);
    if (index === -1) throw new Error('Participant not found');
    
    mockParticipants.splice(index, 1);
  }
}

export class MockEventService implements EventService {
  async getAllEvents(): Promise<Event[]> {
    return [...mockEvents];
  }

  async getEventsToday(): Promise<Event[]> {
    // Simulasi query langsung ke database dengan filter tanggal hari ini
    const today = new Date().toISOString().split('T')[0];
    return mockEvents.filter(event => event.date === today);
  }

  async getEventById(id: string): Promise<Event | null> {
    return mockEvents.find(e => e.id === id) || null;
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString()
    };
    mockEvents.push(newEvent);
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const index = mockEvents.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    
    mockEvents[index] = { ...mockEvents[index], ...event };
    return mockEvents[index];
  }

  async deleteEvent(id: string): Promise<void> {
    const index = mockEvents.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    
    mockEvents.splice(index, 1);
  }
}

export class MockUserService implements UserService {
  async getAllUsers(): Promise<SystemUser[]> {
    return [...mockUsers];
  }

  async getUserByUuid(uuid: string): Promise<SystemUser | null> {
    return mockUsers.find(u => u.uuid === uuid) || null;
  }

  async createUser(user: Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>): Promise<SystemUser> {
    const newUser: SystemUser = {
      ...user,
      uuid: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(uuid: string, user: Partial<Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>>): Promise<SystemUser> {
    const index = mockUsers.findIndex(u => u.uuid === uuid);
    if (index === -1) throw new Error('User not found');
    
    mockUsers[index] = { 
      ...mockUsers[index], 
      ...user, 
      updated_at: new Date().toISOString() 
    };
    return mockUsers[index];
  }

  async deleteUser(uuid: string): Promise<void> {
    const index = mockUsers.findIndex(u => u.uuid === uuid);
    if (index === -1) throw new Error('User not found');
    
    mockUsers.splice(index, 1);
  }

  async searchUsers(query: string): Promise<SystemUser[]> {
    const lowercaseQuery = query.toLowerCase();
    return mockUsers.filter(user =>
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.role.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Master Event Service Implementation
export class MockMasterEventService implements MasterEventService {
  async getAllMasterEvents(): Promise<MasterEvent[]> {
    return [...mockMasterEvents];
  }

  async getMasterEventByUuid(uuid: string): Promise<MasterEvent | null> {
    return mockMasterEvents.find(event => event.uuid === uuid) || null;
  }

  async createMasterEvent(masterEvent: Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<MasterEvent> {
    const newMasterEvent: MasterEvent = {
      id: (mockMasterEvents.length + 1).toString(),
      ...masterEvent,
      uuid: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockMasterEvents.push(newMasterEvent);
    return newMasterEvent;
  }

  async updateMasterEvent(uuid: string, masterEvent: Partial<Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<MasterEvent> {
    const index = mockMasterEvents.findIndex(event => event.uuid === uuid);
    if (index === -1) throw new Error('Master event not found');
    
    mockMasterEvents[index] = { 
      ...mockMasterEvents[index], 
      ...masterEvent, 
      updated_at: new Date().toISOString() 
    };
    return mockMasterEvents[index];
  }

  async deleteMasterEvent(uuid: string): Promise<void> {
    const index = mockMasterEvents.findIndex(event => event.uuid === uuid);
    if (index === -1) throw new Error('Master event not found');
    
    mockMasterEvents.splice(index, 1);
  }

  async searchMasterEvents(query: string): Promise<MasterEvent[]> {
    const lowercaseQuery = query.toLowerCase();
    return mockMasterEvents.filter(event =>
      event.title.toLowerCase().includes(lowercaseQuery) ||
      (event.description && event.description.toLowerCase().includes(lowercaseQuery)) ||
      (event.location && event.location.toLowerCase().includes(lowercaseQuery))
    );
  }
}

// Event Instance Service Implementation
export class MockEventInstanceService implements EventInstanceService {
  async getAllEventInstances(): Promise<EventInstance[]> {
    return [...mockEventInstances];
  }

  async getEventInstanceByUuid(uuid: string): Promise<EventInstance | null> {
    return mockEventInstances.find(instance => instance.uuid === uuid) || null;
  }

  async getEventInstancesByMasterEvent(masterEventId: string): Promise<EventInstance[]> {
    return mockEventInstances.filter(instance => instance.master_event_id === masterEventId);
  }

  // Helper function to check if an event is active today based on recurrence
  isEventActiveToday(eventInstance: EventInstance): boolean {
    const today = moment();
    const todayString = today.format('YYYY-MM-DD');
    const startDate = moment(eventInstance.start_date);
    const endDate = eventInstance.recurrence_end_date ? moment(eventInstance.recurrence_end_date) : null;

    // Check if today is within the event period
    if (today.isBefore(startDate, 'day')) {
      return false;
    }
    if (endDate && today.isAfter(endDate, 'day')) {
      return false;
    }

    // If no recurrence, check if today matches the start date
    if (eventInstance.recurrence_type === 'none' || !eventInstance.recurrence_type) {
      return eventInstance.start_date === todayString;
    }

    // Check recurrence patterns
    switch (eventInstance.recurrence_type) {
      case 'daily':
        return true; // Daily events are active every day within the period
      
      case 'weekly':
        // Check if today is the same day of week as start date
        const startDayOfWeek = startDate.day();
        const todayDayOfWeek = today.day();
        return startDayOfWeek === todayDayOfWeek;
      
      case 'monthly':
        // Check if today is the same day of month as start date
        const startDayOfMonth = startDate.date();
        const todayDayOfMonth = today.date();
        return startDayOfMonth === todayDayOfMonth;
      
      default:
        return false;
    }
  }

  // Get events that are active today (considering recurrence)
  async getEventsActiveToday(): Promise<EventInstance[]> {
    return mockEventInstances.filter(event => 
      this.isEventActiveToday(event)
    );
  }

  async createEventInstance(eventInstance: Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>): Promise<EventInstance> {
    const newEventInstance: EventInstance = {
      id: (mockEventInstances.length + 1).toString(),
      ...eventInstance,
      uuid: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockEventInstances.push(newEventInstance);
    return newEventInstance;
  }

  async updateEventInstance(uuid: string, eventInstance: Partial<Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>>): Promise<EventInstance> {
    const index = mockEventInstances.findIndex(instance => instance.uuid === uuid);
    if (index === -1) throw new Error('Event instance not found');
    
    mockEventInstances[index] = { 
      ...mockEventInstances[index], 
      ...eventInstance, 
      updated_at: new Date().toISOString() 
    };
    return mockEventInstances[index];
  }

  async deleteEventInstance(uuid: string): Promise<void> {
    const index = mockEventInstances.findIndex(instance => instance.uuid === uuid);
    if (index === -1) throw new Error('Event instance not found');
    
    mockEventInstances.splice(index, 1);
  }

  async registerParticipant(eventInstanceId: string, participantId: string): Promise<void> {
    const instance = mockEventInstances.find(inst => inst.uuid === eventInstanceId);
    if (!instance) throw new Error('Event instance not found');
    
    if (!instance.registered_participants.includes(participantId)) {
      instance.registered_participants.push(participantId);
      instance.updated_at = new Date().toISOString();
    }
  }

  async unregisterParticipant(eventInstanceId: string, participantId: string): Promise<void> {
    const instance = mockEventInstances.find(inst => inst.uuid === eventInstanceId);
    if (!instance) throw new Error('Event instance not found');
    
    const index = instance.registered_participants.indexOf(participantId);
    if (index > -1) {
      instance.registered_participants.splice(index, 1);
      instance.updated_at = new Date().toISOString();
    }
  }

  async getRegisteredParticipants(eventInstanceId: string): Promise<Participant[]> {
    const instance = mockEventInstances.find(inst => inst.uuid === eventInstanceId);
    if (!instance) throw new Error('Event instance not found');
    
    return instance.registered_participants
      .map(participantId => mockParticipants.find(p => p.uuid === participantId))
      .filter((participant): participant is Participant => participant !== undefined);
  }
}
