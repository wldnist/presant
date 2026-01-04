'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/id';
import { EventInstance } from '@/types';
import { MockEventInstanceService } from '@/services/mockServices';
import AppLayout from '@/components/AppLayout';
import SimpleModal from '@/components/SimpleModal';
import Pagination from '@/components/Pagination';
import ManageEventParticipantsModal from '@/components/ManageEventParticipantsModal';
import { useSimpleModal } from '@/hooks/useSimpleModal';

// Services
const eventInstanceService = new MockEventInstanceService();

export default function EventInstancesPage() {
  const [eventInstances, setEventInstances] = useState<EventInstance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEventInstances, setFilteredEventInstances] = useState<EventInstance[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [selectedEventUuid, setSelectedEventUuid] = useState<string | null>(null);
  const router = useRouter();
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError, showConfirm } = useSimpleModal();

  // Load event instances
  useEffect(() => {
    const loadEventInstances = async () => {
      try {
        const allEventInstances = await eventInstanceService.getAllEventInstances();
        setEventInstances(allEventInstances);
        setFilteredEventInstances(allEventInstances);
      } catch (error) {
        console.error('Error loading event instances:', error);
        showError('Gagal memuat data acara');
      }
    };

    loadEventInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once on mount

  // Filter event instances based on search query
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when searching
    if (searchQuery.trim()) {
      const filtered = eventInstances.filter(eventInstance =>
        eventInstance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eventInstance.master_event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (eventInstance.description && eventInstance.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (eventInstance.location && eventInstance.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredEventInstances(filtered);
    } else {
      setFilteredEventInstances(eventInstances);
    }
  }, [searchQuery, eventInstances]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEventInstances.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEventInstances = filteredEventInstances.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (uuid: string) => {
    router.push(`/events/${uuid}/edit`);
  };

  const handleManageParticipants = (uuid: string) => {
    setSelectedEventUuid(uuid);
    setParticipantsModalOpen(true);
  };

  const handleCloseParticipantsModal = () => {
    setParticipantsModalOpen(false);
    setSelectedEventUuid(null);
  };

  const handleParticipantsSaved = async () => {
    // Reload event instances setelah save berhasil
    try {
      const updatedEventInstances = await eventInstanceService.getAllEventInstances();
      setEventInstances(updatedEventInstances);
      setFilteredEventInstances(updatedEventInstances);
    } catch (error) {
      console.error('Error reloading event instances:', error);
    }
  };

  const handleDelete = async (uuid: string) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus acara ini? Tindakan ini tidak dapat dibatalkan.',
      'Konfirmasi Hapus Acara',
      async () => {
        try {
          await eventInstanceService.deleteEventInstance(uuid);
          showSuccess('Acara berhasil dihapus');
          // Reload event instances
          const updatedEventInstances = await eventInstanceService.getAllEventInstances();
          setEventInstances(updatedEventInstances);
          setFilteredEventInstances(updatedEventInstances);
        } catch (error) {
          console.error('Error deleting event instance:', error);
          showError('Gagal menghapus acara');
        }
      }
    );
  };

  const getRecurrenceLabel = (recurrenceType: string) => {
    switch (recurrenceType) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'monthly':
        return 'Bulanan';
      case 'none':
        return 'Sekali';
      default:
        return 'Sekali';
    }
  };

  return (
    <AppLayout>
      <SimpleModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Manage Participants Modal */}
      {selectedEventUuid && (
        <ManageEventParticipantsModal
          isOpen={participantsModalOpen}
          onClose={handleCloseParticipantsModal}
          eventUuid={selectedEventUuid}
          onSave={handleParticipantsSaved}
        />
      )}

      <div className="p-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Manajemen Acara
              </h1>
              <p className="text-gray-600">
                Kelola instansi acara dengan peserta dan pengaturan berulang
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => router.push('/events/new')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Tambah Acara
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari judul acara, master acara, deskripsi, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Event Instances Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acara
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Master Acara
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal & Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengulangan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peserta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEventInstances.map((eventInstance) => (
                    <tr key={eventInstance.uuid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {eventInstance.title}
                        </div>
                        {eventInstance.location && (
                          <div className="text-sm text-gray-500 mt-1">
                            📍 {eventInstance.location}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/master-events/${eventInstance.master_event.uuid}/edit`)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                        >
                          {eventInstance.master_event.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {moment(eventInstance.start_date).locale('id').format('DD MMM YYYY')}
                        </div>
                        {eventInstance.start_time && eventInstance.end_time && (
                          <div className="text-sm text-gray-500">
                            {eventInstance.start_time} - {eventInstance.end_time}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getRecurrenceLabel(eventInstance.recurrence_type || 'none')}
                        </div>
                        {eventInstance.recurrence_end_date && (
                          <div className="text-sm text-gray-500">
                            Sampai {moment(eventInstance.recurrence_end_date).locale('id').format('DD MMM YYYY')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {eventInstance.registered_participants.length} peserta
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleManageParticipants(eventInstance.uuid)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Peserta
                          </button>
                          <button
                            onClick={() => handleEdit(eventInstance.uuid)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(eventInstance.uuid)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEventInstances.length === 0 && (
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
                    : 'Klik tombol "Tambah Acara" untuk menambahkan acara pertama'
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredEventInstances.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
