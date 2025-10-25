'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/id';
import { EventInstance } from '@/types';
import { MockEventInstanceService, MockAttendanceService } from '@/services/mockServices';
import { AttendanceSubmission } from '@/services/interfaces';
import ProtectedRoute from '@/components/ProtectedRoute';
import Pagination from '@/components/Pagination';

interface ReportData {
  event: EventInstance;
  attendance: AttendanceSubmission[];
  totalParticipants: number;
  attendedParticipants: number;
  attendanceRate: string;
}

// Services
const eventInstanceService = new MockEventInstanceService();
const attendanceService = new MockAttendanceService();

export default function ReportsPage() {
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
        const allEventInstances = await eventInstanceService.getAllEventInstances();
        setEventInstances(allEventInstances);
        
        // Load attendance data
        const allAttendance = await attendanceService.getAllAttendance();
        setAttendanceData(allAttendance);
        
        // Combine data
        const combinedData = allEventInstances.map(event => {
          const eventAttendance = allAttendance.filter(att => att.event_id === event.uuid);
          return {
            event,
            attendance: eventAttendance,
            totalParticipants: event.registered_participants.length,
            attendedParticipants: eventAttendance.length,
            attendanceRate: event.registered_participants.length > 0 
              ? (eventAttendance.length / event.registered_participants.length * 100).toFixed(1)
              : '0'
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
      return {
        event,
        attendance: eventAttendance,
        totalParticipants: event.registered_participants.length,
        attendedParticipants: eventAttendance.length,
        attendanceRate: event.registered_participants.length > 0 
          ? (eventAttendance.length / event.registered_participants.length * 100).toFixed(1)
          : '0'
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
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data laporan...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Laporan Kehadiran
                </h1>
                <p className="text-gray-600">
                  Data kehadiran peserta pada setiap acara
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali ke Dashboard
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Beranda
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                placeholder="Cari acara, master acara, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white shadow-sm rounded-lg border">
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
                      Status
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
                        <div className="text-sm font-medium text-gray-900">
                          {item.event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.event.master_event.title}
                        </div>
                        {item.event.location && (
                          <div className="text-sm text-gray-500 mt-1">
                            📍 {item.event.location}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {moment(item.event.start_date).locale('id').format('DD MMM YYYY')}
                        </div>
                        {item.event.start_time && item.event.end_time && (
                          <div className="text-sm text-gray-500">
                            {item.event.start_time} - {item.event.end_time}
                          </div>
                        )}
                        {item.event.recurrence_type && item.event.recurrence_type !== 'none' && (
                          <div className="text-sm text-blue-600">
                            🔄 {getRecurrenceLabel(item.event.recurrence_type)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(item.event.status)}`}>
                          {getStatusLabel(item.event.status)}
                        </span>
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
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${item.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 font-medium">
                            {item.attendanceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/reports/${item.event.uuid}`)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data laporan</h3>
                <p className="mt-1 text-sm text-gray-500">Belum ada acara yang memiliki data kehadiran.</p>
              </div>
            )}

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200">
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
      </div>
    </ProtectedRoute>
  );
}
