-- Initial Database Schema
-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  gender TEXT NOT NULL CHECK(gender IN ('L', 'P')),
  age INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Master Events Table
CREATE TABLE IF NOT EXISTS master_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  estimated_duration INTEGER,
  max_participants INTEGER,
  requirements TEXT, -- JSON array stored as text
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Event Instances Table
CREATE TABLE IF NOT EXISTS event_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  master_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  start_time TEXT,
  end_time TEXT,
  recurrence_type TEXT CHECK(recurrence_type IN ('none', 'daily', 'weekly', 'monthly')),
  recurrence_end_date TEXT,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (master_event_id) REFERENCES master_events(uuid)
);

-- Event Instance Participants (Many-to-Many)
CREATE TABLE IF NOT EXISTS event_instance_participants (
  event_instance_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_instance_id, participant_id),
  FOREIGN KEY (event_instance_id) REFERENCES event_instances(uuid) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(uuid) ON DELETE CASCADE
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present', 'excused', 'absent', 'sick')),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (participant_id) REFERENCES participants(uuid) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES event_instances(uuid) ON DELETE CASCADE,
  UNIQUE(participant_id, event_id)
);

-- System Users Table
CREATE TABLE IF NOT EXISTS system_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('SUPERADMIN', 'ADMIN', 'USER')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_uuid ON participants(uuid);
CREATE INDEX IF NOT EXISTS idx_master_events_uuid ON master_events(uuid);
CREATE INDEX IF NOT EXISTS idx_event_instances_uuid ON event_instances(uuid);
CREATE INDEX IF NOT EXISTS idx_event_instances_master_event_id ON event_instances(master_event_id);
CREATE INDEX IF NOT EXISTS idx_event_instance_participants_event ON event_instance_participants(event_instance_id);
CREATE INDEX IF NOT EXISTS idx_event_instance_participants_participant ON event_instance_participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_participant ON attendance(participant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_participant_event ON attendance(participant_id, event_id);
CREATE INDEX IF NOT EXISTS idx_system_users_uuid ON system_users(uuid);
CREATE INDEX IF NOT EXISTS idx_system_users_username ON system_users(username);

