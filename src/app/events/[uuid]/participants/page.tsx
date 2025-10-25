'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EventInstance, Participant, ParticipantFilters } from '@/types';
import { MockEventInstanceService, MockParticipantService } from '@/services/mockServices';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleModal from '@/components/SimpleModal';
import ParticipantFilter from '@/components/ParticipantFilter';
import { useSimpleModal } from '@/hooks/useSimpleModal';

// Services
const eventInstanceService = new MockEventInstanceService();
const participantService = new MockParticipantService();

export default function EventParticipantsPage() {
  const params = useParams();
  const router = useRouter();
  const eventUuid = params.uuid as string;
  
  const [eventInstance, setEventInstance] = useState<EventInstance | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError } = useSimpleModal();

  // Load event instance and participants
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load event instance
        const event = await eventInstanceService.getEventInstanceByUuid(eventUuid);
        if (!event) {
          showError('Acara tidak ditemukan');
          router.push('/events');
          return;
        }
        setEventInstance(event);
        
        // Load all participants
        const allParticipants = await participantService.getAllParticipants();
        setParticipants(allParticipants);
        
        // Set currently registered participants as selected
        setSelectedParticipants(event.registered_participants);
        
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventUuid]);

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedParticipants(selectedIds);
  };

  const handleFilterChange = (filters: ParticipantFilters) => {
    // Filter change is handled by ParticipantFilter component
    // This function is required by the interface but we don't need to do anything here
  };

  const handleSave = async () => {
    if (!eventInstance) return;

    try {
      setSaving(true);
      
      // Get current registered participants
      const currentRegistered = eventInstance.registered_participants;
      
      // Find participants to add and remove
      const toAdd = selectedParticipants.filter(id => !currentRegistered.includes(id));
      const toRemove = currentRegistered.filter(id => !selectedParticipants.includes(id));
      
      // Add new participants
      for (const participantId of toAdd) {
        await eventInstanceService.registerParticipant(eventUuid, participantId);
      }
      
      // Remove unselected participants
      for (const participantId of toRemove) {
        await eventInstanceService.unregisterParticipant(eventUuid, participantId);
      }
      
      showSuccess(`Peserta acara berhasil diperbarui. ${toAdd.length} ditambahkan, ${toRemove.length} dihapus.`);
      
      // Reload event instance to get updated data
      const updatedEvent = await eventInstanceService.getEventInstanceByUuid(eventUuid);
      if (updatedEvent) {
        setEventInstance(updatedEvent);
      }
      
    } catch (error) {
      console.error('Error saving participants:', error);
      showError('Gagal menyimpan perubahan peserta');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    router.push('/events');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data peserta...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!eventInstance) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acara Tidak Ditemukan</h3>
            <p className="text-gray-500 mb-4">Acara yang Anda cari tidak ditemukan atau telah dihapus.</p>
            <button
              onClick={() => router.push('/events')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Kembali ke Daftar Acara
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SimpleModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Kelola Peserta Acara
                </h1>
                <p className="text-gray-600">
                  <span className="font-medium">{eventInstance.title}</span>
                  <br />
                  <span className="text-sm text-gray-500">
                    Master: {eventInstance.master_event.title}
                  </span>
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Event Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Informasi Acara</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Tanggal:</span>
                  <span className="ml-2 text-blue-700">
                    {new Date(eventInstance.start_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {eventInstance.start_time && eventInstance.end_time && (
                  <div>
                    <span className="font-medium text-blue-800">Waktu:</span>
                    <span className="ml-2 text-blue-700">
                      {eventInstance.start_time} - {eventInstance.end_time}
                    </span>
                  </div>
                )}
                {eventInstance.location && (
                  <div>
                    <span className="font-medium text-blue-800">Lokasi:</span>
                    <span className="ml-2 text-blue-700">{eventInstance.location}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-blue-800">Peserta Terdaftar:</span>
                  <span className="ml-2 text-blue-700">
                    {eventInstance.registered_participants.length}
                    {eventInstance.max_participants && ` / ${eventInstance.max_participants}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Participant Filter */}
            <ParticipantFilter
              participants={participants}
              selectedParticipants={selectedParticipants}
              onSelectionChange={handleSelectionChange}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
