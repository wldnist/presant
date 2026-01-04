'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/id';
import { EventInstance, Participant, AttendanceRecord } from '@/types';
import { AttendanceSubmission } from '@/services/interfaces';
import AppLayout from '@/components/AppLayout';
import Pagination from '@/components/Pagination';
import AttendanceStatusChart from '@/components/AttendanceStatusChart';
import { apiGet } from '@/utils/api';

interface ReportDetailData {
  event: EventInstance;
  attendance: AttendanceSubmission[];
  participants: ParticipantWithAttendance[];
  totalParticipants: number;
  attendedParticipants: number;
  attendanceRate: string;
}

interface ParticipantWithAttendance {
  id: string;
  uuid: string;
  name: string;
  phone_number: string;
  gender: 'L' | 'P';
  age: number;
  created_at?: string;
  updated_at?: string;
  attendance: AttendanceSubmission | null;
  status: string;
}


export default function EventReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventUuid = params.uuid as string;
  
  const [reportData, setReportData] = useState<ReportDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState<ParticipantWithAttendance[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load report data
  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        
        // Validate eventUuid
        if (!eventUuid) {
          console.error('Event UUID is missing');
          router.push('/reports/events');
          return;
        }
        
        // Load event instance
        const event = await apiGet<EventInstance>(`/event-instances/${eventUuid}`);
        if (!event) {
          console.error('Event not found:', eventUuid);
          router.push('/reports/events');
          return;
        }
        
        // Load attendance data for this event
        // API returns AttendanceRecord[] which has structure: { participant, attendance }
        const attendanceRecords = await apiGet<AttendanceRecord[]>(`/attendance?event_id=${eventUuid}`);
        
        // Load participants
        const allParticipants = await apiGet<Participant[]>('/participants');
        const eventParticipants = allParticipants.filter(p => 
          event.registered_participants.includes(p.uuid)
        );
        
        // Create attendance map using participant UUID as key
        // AttendanceRecord structure: { participant: Participant, attendance: Attendance }
        const attendanceMap = new Map();
        attendanceRecords.forEach(record => {
          // Use participant.uuid as key, and store the attendance object
          attendanceMap.set(record.participant.uuid, record.attendance);
        });
        
        // Combine participant data with attendance
        const participantsWithAttendance = eventParticipants.map(participant => {
          const attendance = attendanceMap.get(participant.uuid);
          return {
            ...participant,
            attendance: attendance || null,
            status: attendance?.status || 'absent'
          };
        });
        
        // Convert AttendanceRecord[] to AttendanceSubmission[] for compatibility
        // Note: timestamp might be a Date object or a string (after JSON serialization)
        const eventAttendance: AttendanceSubmission[] = attendanceRecords.map(record => {
          const timestamp = record.attendance.timestamp;
          const timestampString = timestamp instanceof Date 
            ? timestamp.toISOString() 
            : (typeof timestamp === 'string' ? timestamp : new Date(timestamp).toISOString());
          
          return {
            event_id: record.attendance.eventId,
            participant_id: record.attendance.participantId,
            status: record.attendance.status,
            timestamp: timestampString,
            notes: ''
          };
        });
        
        // Calculate only participants with status 'present' as attended
        // IMPORTANT: Only count 'present' status, not 'excused', 'sick', or 'absent'
        const presentParticipants = participantsWithAttendance.filter(p => p.status === 'present').length;
        const totalParticipants = event.registered_participants.length;
        const attendanceRate = totalParticipants > 0 
          ? (presentParticipants / totalParticipants * 100).toFixed(1)
          : '0';
        
        // Debug logging (can be removed in production)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Event Detail: ${event.title}`, {
            totalParticipants,
            presentParticipants,
            attendanceRate,
            allAttendanceCount: eventAttendance.length,
            participantsStatuses: participantsWithAttendance.map(p => ({ name: p.name, status: p.status }))
          });
        }
        
        const reportData: ReportDetailData = {
          event,
          attendance: eventAttendance,
          participants: participantsWithAttendance,
          totalParticipants,
          attendedParticipants: presentParticipants, // Only count 'present' status
          attendanceRate
        };
        
        setReportData(reportData);
        setFilteredParticipants(participantsWithAttendance);
        
      } catch (error) {
        console.error('Error loading report data:', error);
        // Don't redirect immediately, show error state instead
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [eventUuid, router]);

  // Filter participants based on search query
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when searching
    if (!reportData) return;
    
    if (searchQuery.trim()) {
      const filtered = reportData.participants.filter(participant =>
        participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.phone_number.includes(searchQuery.toLowerCase())
      );
      setFilteredParticipants(filtered);
    } else {
      setFilteredParticipants(reportData.participants);
    }
  }, [searchQuery, reportData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'excused':
        return 'bg-yellow-100 text-yellow-800';
      case 'sick':
        return 'bg-orange-100 text-orange-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'excused':
        return 'Izin';
      case 'sick':
        return 'Sakit';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return status;
    }
  };

  const getGenderLabel = (gender: string) => {
    return gender === 'L' ? 'Laki-Laki' : 'Perempuan';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data laporan...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!reportData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Laporan Tidak Ditemukan</h3>
            <p className="text-gray-500 mb-4">Laporan yang Anda cari tidak ditemukan atau telah dihapus.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Detail Laporan Kehadiran
              </h1>
              <p className="text-gray-600">
                {reportData.event.title}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Event Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Informasi Acara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Tanggal:</span>
                <span className="ml-2 text-blue-700">
                  {moment(reportData.event.start_date).locale('id').format('DD MMMM YYYY')}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Waktu:</span>
                <span className="ml-2 text-blue-700">
                  {reportData.event.start_time && reportData.event.end_time 
                    ? `${reportData.event.start_time} - ${reportData.event.end_time}`
                    : 'Tidak ditentukan'
                  }
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Lokasi:</span>
                <span className="ml-2 text-blue-700">{reportData.event.location || 'Tidak ditentukan'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Master Acara:</span>
                <span className="ml-2 text-blue-700">{reportData.event.master_event.title}</span>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Kehadiran</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{reportData.totalParticipants}</div>
                <div className="text-sm text-gray-500">Total Peserta</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{reportData.attendedParticipants}</div>
                <div className="text-sm text-gray-500">Hadir</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{reportData.attendanceRate}%</div>
                <div className="text-sm text-gray-500">Tingkat Kehadiran</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${reportData.attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Attendance Status Chart */}
          <div className="mb-6">
            <AttendanceStatusChart participants={reportData.participants} />
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari nama atau nomor telepon peserta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peserta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Kelamin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Umur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Kehadiran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu Kehadiran
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentParticipants.map((participant) => (
                    <tr key={participant.uuid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {participant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              📞 {participant.phone_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getGenderLabel(participant.gender)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.age} tahun
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(participant.status)}`}>
                          {getStatusLabel(participant.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.attendance?.timestamp 
                          ? moment(participant.attendance.timestamp).locale('id').format('DD MMM YYYY, HH:mm')
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredParticipants.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada peserta</h3>
                <p className="mt-1 text-sm text-gray-500">Belum ada peserta yang terdaftar untuk acara ini.</p>
              </div>
            )}

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredParticipants.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

