'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/id';
import { Participant } from '@/types';
import { MockParticipantService } from '@/services/mockServices';
import AppLayout from '@/components/AppLayout';
import SimpleModal from '@/components/SimpleModal';
import Pagination from '@/components/Pagination';
import { useSimpleModal } from '@/hooks/useSimpleModal';

// Services
const participantService = new MockParticipantService();

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError, showConfirm } = useSimpleModal();

  // Load participants
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setLoading(true);
        const allParticipants = await participantService.getAllParticipants();
        setParticipants(allParticipants);
        setFilteredParticipants(allParticipants);
      } catch (error) {
        console.error('Error loading participants:', error);
        showError('Gagal memuat data participants');
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once on mount

  // Filter participants based on search query
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when searching
    if (searchQuery.trim()) {
      const filtered = participants.filter(participant =>
        participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.phone_number.includes(searchQuery) ||
        participant.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.age.toString().includes(searchQuery)
      );
      setFilteredParticipants(filtered);
    } else {
      setFilteredParticipants(participants);
    }
  }, [searchQuery, participants]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (uuid: string) => {
    router.push(`/participants/${uuid}/edit`);
  };

  const handleDelete = async (uuid: string) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus participant ini? Tindakan ini tidak dapat dibatalkan.',
      'Konfirmasi Hapus Participant',
      async () => {
        try {
          await participantService.deleteParticipant(uuid);
          showSuccess('Participant berhasil dihapus');
          // Reload participants
          const updatedParticipants = await participantService.getAllParticipants();
          setParticipants(updatedParticipants);
          setFilteredParticipants(updatedParticipants);
        } catch (error) {
          console.error('Error deleting participant:', error);
          showError('Gagal menghapus participant');
        }
      }
    );
  };

  const getGenderBadgeColor = (gender: string) => {
    return gender === 'L' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-pink-100 text-pink-800';
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
            <p className="text-gray-600">Memuat data participants...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 sm:px-6 lg:px-8 py-6">
        {/* Simple Modal */}
        <SimpleModal
          isOpen={modalState.isOpen}
          onClose={hideModal}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
        />
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Manajemen Participant
              </h1>
              <p className="text-gray-600">
                Kelola peserta yang dapat mengikuti acara
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={() => router.push('/participants/new')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Tambah Participant
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search name, phone number, gender, or age..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Participants Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AKSI
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
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenderBadgeColor(participant.gender)}`}>
                          {getGenderLabel(participant.gender)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.age} years old
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.created_at ? moment(participant.created_at).locale('id').format('DD MMM YYYY') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(participant.uuid)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(participant.uuid)}
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

            {/* Empty State */}
            {filteredParticipants.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchQuery ? 'Tidak ada participant yang ditemukan' : 'Belum ada participant'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan participant baru'}
                </p>
                {!searchQuery && (
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/participants/new')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Tambah Participant
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredParticipants.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
