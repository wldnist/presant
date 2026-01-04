'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AttendanceRecord, AttendanceStatus, EventInstance } from '@/types';
import { MockAttendanceService, MockEventInstanceService } from '@/services/mockServices';
import { AttendanceSubmission } from '@/services/interfaces';
import { debounce } from '@/utils/attendanceUtils';
import moment from 'moment';
import 'moment/locale/id';
import AppLayout from '@/components/AppLayout';
import SimpleModal from '@/components/SimpleModal';
import { useSimpleModal } from '@/hooks/useSimpleModal';

// Components
import SearchBar from '@/components/SearchBar';
import AttendanceLegend from '@/components/AttendanceLegend';
import AttendanceGrid from '@/components/AttendanceGrid';
import EventSelector from '@/components/EventSelector';

// Services
const attendanceService = new MockAttendanceService();
const eventInstanceService = new MockEventInstanceService();

export default function DashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<EventInstance[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventInstance | null>(null);
  const [activeFilter, setActiveFilter] = useState<AttendanceStatus | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'L' | 'P'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { modalState, showModal, hideModal } = useSimpleModal();

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        // Ambil event instances yang aktif hari ini (dengan smart filtering berdasarkan recurrence)
        const todayEvents = await eventInstanceService.getEventsActiveToday();
        setEvents(todayEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const loadAttendanceData = useCallback(async () => {
    if (!currentEvent) {
      setRecords([]);
      setFilteredRecords([]);
      return;
    }

    try {
      setLoading(true);
      const attendanceRecords = await attendanceService.getRegisteredParticipantsWithAttendance(currentEvent.id);
      setRecords(attendanceRecords);
      setFilteredRecords(attendanceRecords);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  // Load attendance data when event changes
  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  // Handle event change
  const handleEventChange = (event: EventInstance | null) => {
    setCurrentEvent(event);
    setActiveFilter('all');
    setGenderFilter('all');
    setSearchQuery('');
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!currentEvent) return;
    
    try {
      setSubmitting(true);
      
      // Submit all current attendance records
      const attendanceData: AttendanceSubmission[] = filteredRecords.map(record => ({
        event_id: currentEvent.uuid,
        participant_id: record.participant.uuid,
        status: record.attendance.status,
        timestamp: new Date().toISOString(),
        notes: ''
      }));
      
      await attendanceService.submitAttendance(attendanceData);
      
      // Show success message
      showModal('Berhasil!', 'Kehadiran berhasil disimpan!', 'success', hideModal);
      
      // Reload records to reflect changes
      loadAttendanceData();
      
    } catch (error) {
      console.error('Error submitting attendance:', error);
      showModal('Error!', 'Gagal menyimpan kehadiran. Silakan coba lagi.', 'error', hideModal);
    } finally {
      setSubmitting(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (!currentEvent) return;
      
      const searchFunction = async () => {
        try {
          let results: AttendanceRecord[];
          
          // Get base results based on status filter
          if (activeFilter === 'all') {
            if (query.trim()) {
              results = await attendanceService.searchParticipants(query, currentEvent.id);
            } else {
              results = await attendanceService.getAttendanceByEvent(currentEvent.id);
            }
          } else {
            results = await attendanceService.filterByStatus(activeFilter, currentEvent.id);
            if (query.trim()) {
              results = results.filter(record =>
                record.participant.name.toLowerCase().includes(query.toLowerCase()) ||
                record.participant.phone_number.includes(query)
              );
            }
          }
          
          // Apply gender filter
          if (genderFilter !== 'all') {
            results = results.filter(record => record.participant.gender === genderFilter);
          }
          
          setFilteredRecords(results);
        } catch (error) {
          console.error('Error searching:', error);
        }
      };
      
      return debounce(searchFunction, 300)();
    },
    [currentEvent, activeFilter, genderFilter]
  );

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle filter change
  const handleFilterChange = async (status: AttendanceStatus | 'all') => {
    setActiveFilter(status);
    await applyFilters(status, genderFilter, searchQuery);
  };

  // Handle gender filter change
  const handleGenderFilterChange = async (gender: 'all' | 'L' | 'P') => {
    setGenderFilter(gender);
    await applyFilters(activeFilter, gender, searchQuery);
  };

  // Apply all filters
  const applyFilters = async (status: AttendanceStatus | 'all', gender: 'all' | 'L' | 'P', query: string) => {
    try {
      let results: AttendanceRecord[];
      
      // Get base results based on status filter
      if (status === 'all') {
        if (query.trim()) {
          results = await attendanceService.searchParticipants(query, currentEvent!.id);
        } else {
          results = await attendanceService.getAttendanceByEvent(currentEvent!.id);
        }
      } else {
        results = await attendanceService.filterByStatus(status, currentEvent!.id);
        if (query.trim()) {
          results = results.filter(record =>
            record.participant.name.toLowerCase().includes(query.toLowerCase()) ||
            record.participant.phone_number.includes(query)
          );
        }
      }
      
      // Apply gender filter
      if (gender !== 'all') {
        results = results.filter(record => record.participant.gender === gender);
      }
      
      setFilteredRecords(results);
    } catch (error) {
      console.error('Error filtering:', error);
    }
  };

  // Handle status change (local only, no auto-submit)
  const handleStatusChange = (participantId: string, status: AttendanceStatus) => {
    // Update local state only, no server call
    const updatedRecords = records.map(record => {
      if (record.participant.id === participantId) {
        return {
          ...record,
          attendance: {
            ...record.attendance,
            status,
            timestamp: new Date()
          }
        };
      }
      return record;
    });
    
    setRecords(updatedRecords);
    
    // Update filtered records
    const updatedFilteredRecords = filteredRecords.map(record => {
      if (record.participant.id === participantId) {
        return {
          ...record,
          attendance: {
            ...record.attendance,
            status,
            timestamp: new Date()
          }
        };
      }
      return record;
    });
    
    setFilteredRecords(updatedFilteredRecords);
  };

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat daftar acara...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <AppLayout>
        <div className="p-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Dashboard Kehadiran
            </h1>
            <p className="text-gray-600">
              Kelola kehadiran peserta acara
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Acara Hari Ini</h2>
              <p className="text-gray-600 mb-6">
                Tidak ada acara yang dijadwalkan untuk hari ini. Silakan kembali lagi besok atau hubungi administrator untuk informasi lebih lanjut.
              </p>
              <div className="text-sm text-gray-500 mb-8">
                📅 {moment().format('dddd, DD MMMM YYYY')}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Apa yang ingin Anda lakukan?
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => router.push('/events/new')}
                    className="inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Buat Acara Baru
                  </button>
                  
                  <button
                    onClick={() => router.push('/events')}
                    className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Lihat Semua Acara
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto mt-4">
                  <button
                    onClick={() => router.push('/master-events')}
                    className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Master Acara
                  </button>
                  
                  <button
                    onClick={() => router.push('/participants')}
                    className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Data Peserta
                  </button>
                </div>
              </div>
            </div>
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
                Dashboard Kehadiran
              </h1>
              <p className="text-gray-600">
                Kelola kehadiran peserta acara
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {currentEvent && (
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {filteredRecords.length} Peserta
                </span>
              )}
              {currentEvent && (
                <button
                  onClick={handleSubmitAttendance}
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Kehadiran
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Data Kehadiran
            </h2>
            
            {/* Event Selector */}
            <EventSelector
              events={events}
              selectedEvent={currentEvent}
              onEventChange={handleEventChange}
              loading={eventsLoading}
            />
            
            {currentEvent ? (
              <>
                {/* Search Bar */}
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search participant name or phone number..."
                />
                
                {/* Gender Filter */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Filter Gender:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGenderFilterChange('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                          genderFilter === 'all'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Semua
                      </button>
                      <button
                        onClick={() => handleGenderFilterChange('L')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                          genderFilter === 'L'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <span>♂</span>
                        <span>Laki-Laki</span>
                      </button>
                      <button
                        onClick={() => handleGenderFilterChange('P')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                          genderFilter === 'P'
                            ? 'bg-pink-600 text-white'
                            : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        }`}
                      >
                        <span>♀</span>
                        <span>Perempuan</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Legend/Filter */}
                <AttendanceLegend 
                  onFilterChange={handleFilterChange}
                  activeFilter={activeFilter}
                />
                
                {/* Instructions */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    (tap to change) - Ketuk kartu peserta untuk mengubah status kehadiran
                  </p>
                </div>
                
                {/* Loading state for attendance data */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Memuat data peserta...</p>
                    </div>
                  </div>
                ) : (
                  /* Attendance Grid */
                  <AttendanceGrid 
                    records={filteredRecords}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Pilih Acara</h3>
                <p className="text-sm text-gray-500 mb-4">Silakan pilih acara dari dropdown di atas untuk melihat data kehadiran peserta</p>
                
                {/* Quick Actions */}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => router.push('/events/new')}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Buat Acara Baru
                  </button>
                  
                  <button
                    onClick={() => router.push('/events')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Lihat Semua Acara
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <SimpleModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        onClose={hideModal}
      />
    </AppLayout>
  );
}
