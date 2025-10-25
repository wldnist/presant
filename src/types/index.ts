// Domain Types
export interface Participant {
  id: string;
  uuid: string;
  name: string;
  phone_number: string;
  gender: 'L' | 'P';
  age: number;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
  location?: string;
}

// Master Event - Template acara yang bisa digunakan berulang
export interface MasterEvent {
  id: string;
  uuid: string;
  title: string;
  description?: string;
  location?: string;
  estimated_duration?: number; // dalam menit
  max_participants?: number;
  requirements?: string[];
  created_at?: string;
  updated_at?: string;
}

// Event Instance - Instansi acara spesifik dengan tanggal dan peserta
export interface EventInstance {
  id: string;
  uuid: string;
  master_event_id: string;
  master_event: MasterEvent;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_end_date?: string;
  max_participants?: number;
  registered_participants: string[]; // Array of participant UUIDs
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Attendance {
  id: string;
  participantId: string;
  eventId: string;
  status: AttendanceStatus;
  timestamp: Date;
}

export type AttendanceStatus = 'present' | 'excused' | 'absent' | 'sick';

export interface AttendanceRecord {
  participant: Participant;
  attendance: Attendance;
}

// User Management Types
export interface SystemUser {
  uuid: string;
  username: string;
  password: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'USER';

// UI Types
export interface AttendanceCardProps {
  participant: Participant;
  status: AttendanceStatus;
  onStatusChange: (participantId: string, status: AttendanceStatus) => void;
}

export interface AttendanceLegendProps {
  onFilterChange: (status: AttendanceStatus | 'all') => void;
  activeFilter: AttendanceStatus | 'all';
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

// User Management UI Types
export interface UserFormProps {
  user?: SystemUser | null;
  onSave: (user: Omit<SystemUser, 'uuid' | 'created_at' | 'updated_at'>) => void;
  onDelete?: (uuid: string) => void;
  isEdit?: boolean;
}

export interface UserListProps {
  users: SystemUser[];
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  loading?: boolean;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: SystemUser | null;
}

// Participant Management UI Types
export interface ParticipantFormProps {
  participant?: Participant | null;
  onSave: (participant: Omit<Participant, 'uuid' | 'created_at' | 'updated_at'>) => void;
  onDelete?: (uuid: string) => void;
  isEdit?: boolean;
}

export interface ParticipantListProps {
  participants: Participant[];
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  loading?: boolean;
}

// Event Management UI Types
export interface MasterEventFormProps {
  masterEvent?: MasterEvent | null;
  onSave: (masterEvent: Omit<MasterEvent, 'id' | 'uuid' | 'created_at' | 'updated_at'>) => void;
  onDelete?: (uuid: string) => void;
  isEdit?: boolean;
}

export interface EventInstanceFormProps {
  eventInstance?: EventInstance | null;
  masterEvents: MasterEvent[];
  participants: Participant[];
  onSave: (eventInstance: Omit<EventInstance, 'id' | 'uuid' | 'created_at' | 'updated_at'>) => void;
  onDelete?: (uuid: string) => void;
  isEdit?: boolean;
}

export interface ParticipantFilterProps {
  participants: Participant[];
  selectedParticipants: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onFilterChange: (filters: ParticipantFilters) => void;
}

export interface ParticipantFilters {
  gender: 'all' | 'L' | 'P';
  ageRange: {
    min: number;
    max: number;
  };
  searchQuery: string;
}
