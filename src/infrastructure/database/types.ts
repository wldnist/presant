// Database row types for SQLite queries

export interface ParticipantRow {
  id: number;
  uuid: string;
  name: string;
  phone_number: string;
  gender: 'L' | 'P';
  age: number;
  created_at: string;
  updated_at: string;
}

export interface MasterEventRow {
  id: number;
  uuid: string;
  title: string;
  description: string | null;
  location: string | null;
  estimated_duration: number | null;
  max_participants: number | null;
  requirements: string | null; // JSON string
  created_at: string;
  updated_at: string;
}

export interface EventInstanceRow {
  id: number;
  uuid: string;
  master_event_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  recurrence_type: string | null;
  recurrence_end_date: string | null;
  max_participants: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EventInstanceWithMasterRow extends EventInstanceRow {
  master_uuid: string | null;
  master_title: string | null;
  master_description: string | null;
  master_location: string | null;
  estimated_duration: number | null;
  master_max_participants: number | null;
  requirements: string | null;
  master_created_at: string | null;
  master_updated_at: string | null;
}

export interface AttendanceRow {
  id: number;
  participant_id: string;
  event_id: string;
  status: string;
  timestamp: string;
  notes: string | null;
  created_at: string;
}

export interface SqliteError extends Error {
  code?: string;
}

