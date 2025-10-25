// Mock Data untuk Development
import { Participant, Event, Attendance, SystemUser, MasterEvent, EventInstance } from '@/types';
import { getTodayString, getTomorrowString, getYesterdayString } from '@/utils/eventUtils';

export const mockParticipants: Participant[] = [
  {
    id: '1',
    uuid: '1',
    name: 'Dwi Santoso',
    phone_number: '081234567890',
    gender: 'L',
    age: 25,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    uuid: '2',
    name: 'Rina Maharani',
    phone_number: '081234567891',
    gender: 'P',
    age: 22,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    uuid: '3',
    name: 'Bambang Sutrisno',
    phone_number: '081234567892',
    gender: 'L',
    age: 35,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    uuid: '4',
    name: 'Ahmad Yusuf',
    phone_number: '081234567893',
    gender: 'L',
    age: 28,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    uuid: '5',
    name: 'Winda Ayu',
    phone_number: '081234567894',
    gender: 'P',
    age: 24,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  {
    id: '6',
    uuid: '6',
    name: 'Ferry Ananda',
    phone_number: '081234567895',
    gender: 'L',
    age: 30,
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-06T00:00:00Z'
  },
  {
    id: '7',
    uuid: '7',
    name: 'Maria Magdalena',
    phone_number: '081234567896',
    gender: 'P',
    age: 26,
    created_at: '2024-01-07T00:00:00Z',
    updated_at: '2024-01-07T00:00:00Z'
  },
  {
    id: '8',
    uuid: '8',
    name: 'Joko Widodo',
    phone_number: '081234567897',
    gender: 'L',
    age: 40,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z'
  },
  {
    id: '9',
    uuid: '9',
    name: 'Sri Mulyani',
    phone_number: '081234567898',
    gender: 'P',
    age: 32,
    created_at: '2024-01-09T00:00:00Z',
    updated_at: '2024-01-09T00:00:00Z'
  },
  {
    id: '10',
    uuid: '10',
    name: 'Budi Santoso',
    phone_number: '081234567899',
    gender: 'L',
    age: 27,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: '11',
    uuid: '11',
    name: 'Ani Susanti',
    phone_number: '081234567900',
    gender: 'P',
    age: 29,
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-11T00:00:00Z'
  },
  {
    id: '12',
    uuid: '12',
    name: 'Eko Prasetyo',
    phone_number: '081234567901',
    gender: 'L',
    age: 23,
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Seminar Teknologi Informasi 2024',
    date: '2024-01-15',
    description: 'Seminar tentang perkembangan teknologi informasi terkini',
    location: 'Auditorium Universitas'
  },
  {
    id: '2',
    title: 'Workshop Machine Learning',
    date: getTodayString(), // Hari ini menggunakan moment.js
    description: 'Workshop praktis tentang machine learning untuk pemula',
    location: 'Lab Komputer Gedung A'
  },
  {
    id: '3',
    title: 'Konferensi AI & Data Science',
    date: getTomorrowString(), // Besok menggunakan moment.js
    description: 'Konferensi internasional tentang AI dan Data Science',
    location: 'Convention Center'
  },
  {
    id: '4',
    title: 'Pelatihan Web Development',
    date: getYesterdayString(), // Kemarin menggunakan moment.js
    description: 'Pelatihan intensif web development dengan React',
    location: 'Ruang Training'
  }
];

export const mockAttendance: Attendance[] = [
  // Empty array - data will be populated when attendance is submitted
];

// Mock Users Data
export const mockUsers: SystemUser[] = [
  {
    uuid: '2',
    username: 'manager',
    password: 'manager123',
    role: 'ADMIN',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    uuid: '3',
    username: 'user1',
    password: 'user123',
    role: 'USER',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
  {
    uuid: '4',
    username: 'user2',
    password: 'user456',
    role: 'USER',
    is_active: false,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z'
  }
];

// Mock Master Events Data
export const mockMasterEvents: MasterEvent[] = [
  // Empty array - data will be populated when master events are created
];

// Mock Event Instances Data
export const mockEventInstances: EventInstance[] = [
  // Empty array - data will be populated when event instances are created
];
