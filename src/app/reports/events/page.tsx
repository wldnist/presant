'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/id';
import { EventInstance } from '@/types';
import { AttendanceSubmission } from '@/services/interfaces';
import AppLayout from '@/components/AppLayout';
import Pagination from '@/components/Pagination';
import { apiGet } from '@/utils/api';

interface ReportData {
  event: EventInstance;
  attendance: AttendanceSubmission[];
  totalParticipants: number;
  attendedParticipants: number;
  attendanceRate: string;
}

export default function EventReportsPage() {
  const [eventInstances, setEventInstances] = useState<EventInstance[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<ReportData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load event instances
        const allEventInstances = await apiGet<EventInstance[]>('/event-instances');
        setEventInstances(allEventInstances);
        
        // Load attendance data
        const allAttendance = await apiGet<AttendanceSubmission[]>('/attendance');
        setAttendanceData(allAttendance);
        
        // Combine data
        const combinedData = allEventInstances.map(event => {
          const eventAttendance = allAttendance.filter(att => att.event_id === event.uuid);
          // Calculate only participants with status 'present' as attended
          // IMPORTANT: Only count 'present' status, not 'excused', 'sick', or 'absent'
          const presentCount = eventAttendance.filter(att => att.status === 'present').length;
          const totalParticipants = event.registered_participants.length;
          const attendanceRate = totalParticipants > 0 
            ? (presentCount / totalParticipants * 100).toFixed(1)
            : '0';
          
          // Debug logging (can be removed in production)
          if (process.env.NODE_ENV === 'development') {
            console.log(`Event: ${event.title}`, {
              totalParticipants,
              presentCount,
              attendanceRate,
              allAttendanceCount: eventAttendance.length,
              attendanceStatuses: eventAttendance.map(a => a.status)
            });
          }
          
          return {
            event,
            attendance: eventAttendance,
            totalParticipants,
            attendedParticipants: presentCount, // Only count 'present' status
            attendanceRate
          };
        });
        
        setFilteredData(combinedData);
        
      } catch (error) {
        console.error('Error loading reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when searching
    
    // Create combined data from eventInstances and attendanceData
    const combinedData = eventInstances.map(event => {
      const eventAttendance = attendanceData.filter(att => att.event_id === event.uuid);
      // Calculate only participants with status 'present' as attended
      // IMPORTANT: Only count 'present' status, not 'excused', 'sick', or 'absent'
      const presentCount = eventAttendance.filter(att => att.status === 'present').length;
      const totalParticipants = event.registered_participants.length;
      const attendanceRate = totalParticipants > 0 
        ? (presentCount / totalParticipants * 100).toFixed(1)
        : '0';
      
      return {
        event,
        attendance: eventAttendance,
        totalParticipants,
        attendedParticipants: presentCount, // Only count 'present' status
        attendanceRate
      };
    });

    // Apply search filter if needed
    if (searchQuery.trim()) {
      const filtered = combinedData.filter(item =>
        item.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.event.master_event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(combinedData);
    }
  }, [searchQuery, eventInstances, attendanceData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Dipublikasi';
      case 'ongoing':
        return 'Berlangsung';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getRecurrenceLabel = (recurrenceType?: string) => {
    switch (recurrenceType) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'monthly':
        return 'Bulanan';
      default:
        return 'Sekali';
    }
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

  return (
    <AppLayout>
      <div className="p-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Laporan Kehadiran Acara
              </h1>
              <p className="text-gray-600">
                Data kehadiran peserta pada setiap acara
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Search and Table Container */}
          <div className="bg-white shadow-sm rounded-lg border">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari acara, master acara, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acara
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal & Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peserta Terdaftar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hadir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tingkat Kehadiran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((item) => (
                    <tr key={item.event.uuid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.event.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.event.master_event.title}
                            </div>
                            {item.event.location && (
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {item.event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {moment(item.event.start_date).locale('id').format('DD MMM YYYY')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.event.start_time && item.event.end_time 
                            ? `${item.event.start_time} - ${item.event.end_time}`
                            : 'Tidak ditentukan'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.totalParticipants} peserta
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.attendedParticipants} peserta
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${item.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/reports/events/${item.event.uuid}`)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Tidak ada acara yang ditemukan' : 'Belum ada acara'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Coba ubah kata kunci pencarian' 
                    : 'Belum ada acara yang terdaftar'
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

