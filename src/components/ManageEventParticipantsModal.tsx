'use client';

import { useState, useEffect } from 'react';
import { EventInstance, Participant, ParticipantFilters } from '@/types';
import { MockEventInstanceService, MockParticipantService } from '@/services/mockServices';
import ParticipantFilter from './ParticipantFilter';
import SimpleModal from './SimpleModal';
import { useSimpleModal } from '@/hooks/useSimpleModal';

// Services
const eventInstanceService = new MockEventInstanceService();
const participantService = new MockParticipantService();

interface ManageEventParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventUuid: string;
  onSave?: () => void; // Callback setelah save berhasil untuk refresh data di parent
}

export default function ManageEventParticipantsModal({
  isOpen,
  onClose,
  eventUuid,
  onSave
}: ManageEventParticipantsModalProps) {
  const [eventInstance, setEventInstance] = useState<EventInstance | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError } = useSimpleModal();

  // Load event instance and participants when modal opens
  useEffect(() => {
    if (isOpen && eventUuid) {
      const loadData = async () => {
        try {
          setLoading(true);
          
          // Load event instance
          const event = await eventInstanceService.getEventInstanceByUuid(eventUuid);
          if (!event) {
            showError('Acara tidak ditemukan');
            onClose();
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, eventUuid]);

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedParticipants(selectedIds);
  };

  const handleFilterChange = (_filters: ParticipantFilters) => {
    // Filter change is handled by ParticipantFilter component
    // Parameter diperlukan untuk memenuhi interface, tapi tidak digunakan di sini
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
      
      // Callback untuk refresh data di parent
      if (onSave) {
        onSave();
      }
      
    } catch (error) {
      console.error('Error saving participants:', error);
      showError('Gagal menyimpan perubahan peserta');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <SimpleModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Modal Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto',
          padding: '20px',
          margin: 0
        }}
        onClick={onClose}
      >
        {/* Modal panel */}
        <div 
          className="bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          style={{
            position: 'relative',
            zIndex: 10000
          }}
          onClick={(e) => e.stopPropagation()}
        >
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Kelola Peserta Acara
                  </h3>
                  {eventInstance && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{eventInstance.title}</span>
                      {' • '}
                      <span className="text-gray-500">Master: {eventInstance.master_event.title}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="bg-white px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data peserta...</p>
                  </div>
                </div>
              ) : eventInstance ? (
                <div className="space-y-6">
                  {/* Event Info */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-900 mb-2">Informasi Acara</h4>
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
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Acara Tidak Ditemukan</h3>
                  <p className="text-gray-500">Acara yang Anda cari tidak ditemukan atau telah dihapus.</p>
                </div>
              )}
            </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading || !eventInstance}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-md transition-colors duration-200 flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    </>
  );
}

