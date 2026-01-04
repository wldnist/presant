// Service Factory - Hexagonal Architecture
// Memungkinkan switch antara SQLite, API, atau teknologi lain tanpa mengubah business logic

import {
  AttendanceService,
  ParticipantService,
  EventService,
  UserService,
  MasterEventService,
  EventInstanceService
} from './interfaces';

// Import SQLite implementations
import {
  SqliteAttendanceService,
  SqliteParticipantService,
  SqliteEventService,
  SqliteUserService,
  SqliteMasterEventService,
  SqliteEventInstanceService
} from './sqliteServices';

// Import repositories
import { ParticipantRepository } from '@/repositories/sqlite/ParticipantRepository';
import { MasterEventRepository } from '@/repositories/sqlite/MasterEventRepository';
import { EventInstanceRepository } from '@/repositories/sqlite/EventInstanceRepository';
import { AttendanceRepository } from '@/repositories/sqlite/AttendanceRepository';
import { SystemUserRepository } from '@/repositories/sqlite/SystemUserRepository';

// TODO: Import API implementations when ready
// import { ApiAttendanceService, ... } from './apiServices';

type ServiceProvider = 'sqlite' | 'api' | 'mock';

// Get service provider from environment or default to sqlite
const getServiceProvider = (): ServiceProvider => {
  if (typeof window !== 'undefined') {
    // Client-side: always use API (will be implemented later)
    return 'api';
  }
  
  // Server-side: use SQLite for now
  return (process.env.SERVICE_PROVIDER as ServiceProvider) || 'sqlite';
};

// Initialize repositories (singleton pattern)
let participantRepo: ParticipantRepository | null = null;
let masterEventRepo: MasterEventRepository | null = null;
let eventInstanceRepo: EventInstanceRepository | null = null;
let attendanceRepo: AttendanceRepository | null = null;
let systemUserRepo: SystemUserRepository | null = null;

function getRepositories() {
  if (typeof window !== 'undefined') {
    // Client-side: repositories not available, will use API
    return null;
  }

  // Initialize repositories lazily
  if (!participantRepo) {
    participantRepo = new ParticipantRepository();
    masterEventRepo = new MasterEventRepository();
    eventInstanceRepo = new EventInstanceRepository();
    attendanceRepo = new AttendanceRepository();
    systemUserRepo = new SystemUserRepository();
  }

  return {
    participantRepo,
    masterEventRepo,
    eventInstanceRepo,
    attendanceRepo,
    systemUserRepo
  };
}

// Service Factory Functions
export function createAttendanceService(): AttendanceService {
  const provider = getServiceProvider();
  
  switch (provider) {
    case 'sqlite': {
      const repos = getRepositories();
      if (!repos) {
        throw new Error('Repositories not available on client-side');
      }
      return new SqliteAttendanceService(
        repos.attendanceRepo,
        repos.participantRepo,
        repos.eventInstanceRepo
      );
    }
    case 'api':
      // TODO: return new ApiAttendanceService();
      throw new Error('API service not yet implemented');
    default:
      throw new Error(`Unknown service provider: ${provider}`);
  }
}

export function createParticipantService(): ParticipantService {
  const provider = getServiceProvider();
  
  switch (provider) {
    case 'sqlite': {
      const repos = getRepositories();
      if (!repos) {
        throw new Error('Repositories not available on client-side');
      }
      return new SqliteParticipantService(repos.participantRepo);
    }
    case 'api':
      // TODO: return new ApiParticipantService();
      throw new Error('API service not yet implemented');
    default:
      throw new Error(`Unknown service provider: ${provider}`);
  }
}

export function createEventService(): EventService {
  const provider = getServiceProvider();
  
  switch (provider) {
    case 'sqlite': {
      const repos = getRepositories();
      if (!repos) {
        throw new Error('Repositories not available on client-side');
      }
      return new SqliteEventService(repos.eventInstanceRepo);
    }
    case 'api':
      // TODO: return new ApiEventService();
      throw new Error('API service not yet implemented');
    default:
      throw new Error(`Unknown service provider: ${provider}`);
  }
}

export function createUserService(): UserService {
  const provider = getServiceProvider();
  
  switch (provider) {
    case 'sqlite': {
      const repos = getRepositories();
      if (!repos) {
        throw new Error('Repositories not available on client-side');
      }
      return new SqliteUserService(repos.systemUserRepo);
    }
    case 'api':
      // TODO: return new ApiUserService();
      throw new Error('API service not yet implemented');
    default:
      throw new Error(`Unknown service provider: ${provider}`);
  }
}

export function createMasterEventService(): MasterEventService {
  const provider = getServiceProvider();
  
  switch (provider) {
    case 'sqlite': {
      const repos = getRepositories();
      if (!repos) {
        throw new Error('Repositories not available on client-side');
      }
      return new SqliteMasterEventService(repos.masterEventRepo);
    }
    case 'api':
      // TODO: return new ApiMasterEventService();
      throw new Error('API service not yet implemented');
    default:
      throw new Error(`Unknown service provider: ${provider}`);
  }
}

export function createEventInstanceService(): EventInstanceService {
  const provider = getServiceProvider();
  
  switch (provider) {
    case 'sqlite': {
      const repos = getRepositories();
      if (!repos) {
        throw new Error('Repositories not available on client-side');
      }
      return new SqliteEventInstanceService(repos.eventInstanceRepo);
    }
    case 'api':
      // TODO: return new ApiEventInstanceService();
      throw new Error('API service not yet implemented');
    default:
      throw new Error(`Unknown service provider: ${provider}`);
  }
}

