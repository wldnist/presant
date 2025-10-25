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
  // Acara 1: Seminar Teknologi Informasi 2024
  {
    id: '1',
    participantId: '1',
    eventId: '1',
    status: 'present',
    timestamp: new Date('2024-01-15T08:00:00')
  },
  {
    id: '2',
    participantId: '2',
    eventId: '1',
    status: 'excused',
    timestamp: new Date('2024-01-15T08:00:00')
  },
  {
    id: '3',
    participantId: '3',
    eventId: '1',
    status: 'absent',
    timestamp: new Date('2024-01-15T08:00:00')
  },
  {
    id: '4',
    participantId: '4',
    eventId: '1',
    status: 'present',
    timestamp: new Date('2024-01-15T08:00:00')
  },
  {
    id: '5',
    participantId: '5',
    eventId: '1',
    status: 'present',
    timestamp: new Date('2024-01-15T08:00:00')
  },
  {
    id: '6',
    participantId: '6',
    eventId: '1',
    status: 'absent',
    timestamp: new Date('2024-01-15T08:00:00')
  },

  // Acara 2: Workshop Machine Learning (Hari Ini)
  {
    id: '7',
    participantId: '1', // Dwi Santoso juga ikut workshop ini
    eventId: '2',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '8',
    participantId: '2', // Rina Maharani juga ikut workshop ini
    eventId: '2',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '9',
    participantId: '7', // Maria Magdalena
    eventId: '2',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '10',
    participantId: '8', // Joko Widodo
    eventId: '2',
    status: 'sick', // Status sakit
    timestamp: new Date()
  },
  {
    id: '11',
    participantId: '9', // Sri Mulyani
    eventId: '2',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '12',
    participantId: '10', // Budi Santoso
    eventId: '2',
    status: 'absent',
    timestamp: new Date()
  },
  {
    id: '13',
    participantId: '11', // Ani Susanti
    eventId: '2',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '14',
    participantId: '12', // Eko Prasetyo
    eventId: '2',
    status: 'present',
    timestamp: new Date()
  },

  // Acara 3: Konferensi AI & Data Science (Besok)
  {
    id: '15',
    participantId: '1', // Dwi Santoso juga ikut konferensi ini
    eventId: '3',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '16',
    participantId: '3', // Bambang Sutrisno
    eventId: '3',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '17',
    participantId: '4', // Ahmad Yusuf
    eventId: '3',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '18',
    participantId: '5', // Winda Ayu
    eventId: '3',
    status: 'sick', // Status sakit
    timestamp: new Date()
  },
  {
    id: '19',
    participantId: '6', // Ferry Ananda
    eventId: '3',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '20',
    participantId: '7', // Maria Magdalena juga ikut konferensi ini
    eventId: '3',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '21',
    participantId: '8', // Joko Widodo juga ikut konferensi ini
    eventId: '3',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '22',
    participantId: '9', // Sri Mulyani juga ikut konferensi ini
    eventId: '3',
    status: 'present',
    timestamp: new Date()
  },

  // Acara 4: Pelatihan Web Development (Kemarin)
  {
    id: '23',
    participantId: '2', // Rina Maharani juga ikut pelatihan ini
    eventId: '4',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '24',
    participantId: '4', // Ahmad Yusuf juga ikut pelatihan ini
    eventId: '4',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '25',
    participantId: '5', // Winda Ayu juga ikut pelatihan ini
    eventId: '4',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '26',
    participantId: '6', // Ferry Ananda juga ikut pelatihan ini
    eventId: '4',
    status: 'excused',
    timestamp: new Date()
  },
  {
    id: '27',
    participantId: '10', // Budi Santoso juga ikut pelatihan ini
    eventId: '4',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '28',
    participantId: '11', // Ani Susanti juga ikut pelatihan ini
    eventId: '4',
    status: 'present',
    timestamp: new Date()
  },
  {
    id: '29',
    participantId: '12', // Eko Prasetyo juga ikut pelatihan ini
    eventId: '4',
    status: 'absent',
    timestamp: new Date()
  }
];

// Mock Users Data
export const mockUsers: SystemUser[] = [
  {
    uuid: '1',
    username: 'admin',
    password: 'admin123',
    role: 'SUPERADMIN',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
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
  {
    id: '1',
    uuid: 'master-1',
    title: 'Workshop Pengembangan Web',
    description: 'Workshop tentang pengembangan web modern menggunakan React dan Node.js',
    location: 'Ruang Seminar A',
    estimated_duration: 180, // 3 jam
    max_participants: 30,
    requirements: ['Laptop', 'Koneksi Internet', 'Pengetahuan dasar HTML/CSS'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    uuid: 'master-2',
    title: 'Pelatihan Manajemen Proyek',
    description: 'Pelatihan tentang metodologi manajemen proyek dan tools yang digunakan',
    location: 'Ruang Meeting B',
    estimated_duration: 240, // 4 jam
    max_participants: 20,
    requirements: ['Notebook', 'Pengalaman kerja minimal 1 tahun'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    uuid: 'master-3',
    title: 'Seminar Kewirausahaan',
    description: 'Seminar tentang tips dan trik memulai bisnis startup',
    location: 'Auditorium Utama',
    estimated_duration: 120, // 2 jam
    max_participants: 100,
    requirements: ['Motivasi tinggi', 'Ide bisnis'],
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
];

// Mock Event Instances Data
export const mockEventInstances: EventInstance[] = [
  {
    id: '1',
    uuid: 'instance-1',
    master_event_id: 'master-1',
    master_event: mockMasterEvents[0],
    title: 'Workshop Pengembangan Web - Batch 1',
    description: 'Workshop tentang pengembangan web modern menggunakan React dan Node.js',
    location: 'Ruang Seminar A',
    start_date: '2024-01-15',
    end_date: '2024-01-15',
    start_time: '09:00',
    end_time: '12:00',
    recurrence_type: 'none',
    max_participants: 30,
    registered_participants: ['1', '2', '3'],
    status: 'published',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    uuid: 'instance-2',
    master_event_id: 'master-1',
    master_event: mockMasterEvents[0],
    title: 'Workshop Pengembangan Web - Batch 2',
    description: 'Workshop tentang pengembangan web modern menggunakan React dan Node.js',
    location: 'Ruang Seminar A',
    start_date: '2024-01-22',
    end_date: '2024-01-22',
    start_time: '09:00',
    end_time: '12:00',
    recurrence_type: 'weekly',
    recurrence_end_date: '2024-02-22',
    max_participants: 30,
    registered_participants: ['4', '5'],
    status: 'draft',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  },
  {
    id: '3',
    uuid: 'instance-3',
    master_event_id: 'master-2',
    master_event: mockMasterEvents[1],
    title: 'Pelatihan Manajemen Proyek - Januari 2024',
    description: 'Pelatihan tentang metodologi manajemen proyek dan tools yang digunakan',
    location: 'Ruang Meeting B',
    start_date: '2024-01-20',
    end_date: '2024-01-20',
    start_time: '08:00',
    end_time: '12:00',
    recurrence_type: 'monthly',
    recurrence_end_date: '2024-06-20',
    max_participants: 20,
    registered_participants: ['1', '3', '6'],
    status: 'ongoing',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  // Single event instance with weekly recurrence
  {
    id: '4',
    uuid: 'weekly-event',
    master_event_id: 'master-2',
    master_event: mockMasterEvents[1],
    title: 'Pelatihan Digital Marketing',
    description: 'Pelatihan tentang strategi digital marketing untuk bisnis',
    location: 'Ruang Training B',
    start_date: '2024-01-08', // Senin pertama
    end_date: '2024-01-08',
    start_time: '14:00',
    end_time: '17:00',
    recurrence_type: 'weekly',
    recurrence_end_date: '2024-01-29', // Berakhir pada Senin terakhir
    max_participants: 25,
    registered_participants: ['1', '4', '5'],
    status: 'published',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  }
];
