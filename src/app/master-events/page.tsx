'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/id';
import { MasterEvent } from '@/types';
import { MockMasterEventService } from '@/services/mockServices';
import AppLayout from '@/components/AppLayout';
import SimpleModal from '@/components/SimpleModal';
import Pagination from '@/components/Pagination';
import { useSimpleModal } from '@/hooks/useSimpleModal';

// Services
const masterEventService = new MockMasterEventService();

export default function MasterEventsPage() {
  const [masterEvents, setMasterEvents] = useState<MasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMasterEvents, setFilteredMasterEvents] = useState<MasterEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError, showConfirm } = useSimpleModal();

  // Load master events
  useEffect(() => {
    const loadMasterEvents = async () => {
      try {
        setLoading(true);
        const allMasterEvents = await masterEventService.getAllMasterEvents();
        setMasterEvents(allMasterEvents);
        setFilteredMasterEvents(allMasterEvents);
      } catch (error) {
        console.error('Error loading master events:', error);
        showError('Gagal memuat data master acara');
      } finally {
        setLoading(false);
      }
    };

    loadMasterEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once on mount

  // Filter master events based on search query
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when searching
    if (searchQuery.trim()) {
      const filtered = masterEvents.filter(masterEvent =>
        masterEvent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (masterEvent.description && masterEvent.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (masterEvent.location && masterEvent.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredMasterEvents(filtered);
    } else {
      setFilteredMasterEvents(masterEvents);
    }
  }, [searchQuery, masterEvents]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMasterEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMasterEvents = filteredMasterEvents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (uuid: string) => {
    router.push(`/master-events/${uuid}/edit`);
  };

  const handleDelete = async (uuid: string) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus master acara ini? Tindakan ini tidak dapat dibatalkan.',
      'Konfirmasi Hapus Master Acara',
      async () => {
        try {
          await masterEventService.deleteMasterEvent(uuid);
          showSuccess('Master acara berhasil dihapus');
          // Reload master events
          const updatedMasterEvents = await masterEventService.getAllMasterEvents();
          setMasterEvents(updatedMasterEvents);
          setFilteredMasterEvents(updatedMasterEvents);
        } catch (error) {
          console.error('Error deleting master event:', error);
          showError('Gagal menghapus master acara');
        }
      }
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
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

      <div className="p-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Master Acara
              </h1>
              <p className="text-gray-600">
                Kelola template acara yang dapat digunakan berulang
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => router.push('/master-events/new')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Tambah Master Acara
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
                  placeholder="Cari judul, deskripsi, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Master Events Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persyaratan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMasterEvents.map((masterEvent) => (
                    <tr key={masterEvent.uuid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {masterEvent.title}
                        </div>
                        {masterEvent.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {masterEvent.description.length > 100 
                              ? `${masterEvent.description.substring(0, 100)}...` 
                              : masterEvent.description
                            }
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {masterEvent.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {masterEvent.estimated_duration ? `${masterEvent.estimated_duration} menit` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {masterEvent.requirements && masterEvent.requirements.length > 0 ? (
                          <div className="space-y-1">
                            {masterEvent.requirements.slice(0, 2).map((req, index) => (
                              <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {req}
                              </div>
                            ))}
                            {masterEvent.requirements.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{masterEvent.requirements.length - 2} lainnya
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {masterEvent.created_at ? moment(masterEvent.created_at).locale('id').format('DD MMM YYYY') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(masterEvent.uuid)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(masterEvent.uuid)}
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

            {filteredMasterEvents.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Tidak ada master acara yang ditemukan' : 'Belum ada master acara'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Coba ubah kata kunci pencarian' 
                    : 'Klik tombol "Tambah Master Acara" untuk menambahkan master acara pertama'
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredMasterEvents.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
