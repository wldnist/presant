'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MasterEvent, EventInstance } from '@/types';
import AppLayout from '@/components/AppLayout';
import SimpleModal from '@/components/SimpleModal';
import { useSimpleModal } from '@/hooks/useSimpleModal';
import { apiGet, apiPut, apiDelete } from '@/utils/api';

export default function EditEventInstancePage() {
  const [formData, setFormData] = useState({
    master_event_id: '',
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    recurrence_type: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    recurrence_end_date: '',
    registered_participants: [] as string[]
  });
  
  const [masterEvents, setMasterEvents] = useState<MasterEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();
  const params = useParams();
  const eventUuid = params.uuid as string;
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError, showConfirm } = useSimpleModal();

  // Load event instance and master events
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // Load master events
        const allMasterEvents = await apiGet<MasterEvent[]>('/master-events');
        setMasterEvents(allMasterEvents);
        
        // Load event instance
        const eventInstance = await apiGet<EventInstance>(`/event-instances/${eventUuid}`);
        if (!eventInstance) {
          showError('Acara tidak ditemukan', 'Error', () => {
            router.push('/events');
          });
          return;
        }

        // Populate form data
        setFormData({
          master_event_id: eventInstance.master_event_id,
          title: eventInstance.title,
          description: eventInstance.description || '',
          location: eventInstance.location || '',
          start_date: eventInstance.start_date,
          end_date: eventInstance.end_date || '',
          start_time: eventInstance.start_time || '',
          end_time: eventInstance.end_time || '',
          recurrence_type: eventInstance.recurrence_type || 'none',
          recurrence_end_date: eventInstance.recurrence_end_date || '',
          registered_participants: eventInstance.registered_participants
        });
        
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Gagal memuat data acara', 'Error', () => {
          router.push('/events');
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (eventUuid) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventUuid]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMasterEventChange = (masterEventId: string) => {
    const selectedMasterEvent = masterEvents.find(me => me.uuid === masterEventId);
    if (selectedMasterEvent) {
      setFormData(prev => ({
        ...prev,
        master_event_id: masterEventId,
        title: selectedMasterEvent.title,
        description: selectedMasterEvent.description || '',
        location: selectedMasterEvent.location || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.master_event_id) {
      showError('Master acara harus dipilih');
      return;
    }

    if (!formData.title.trim()) {
      showError('Judul acara harus diisi');
      return;
    }

    if (!formData.start_date) {
      showError('Tanggal mulai harus diisi');
      return;
    }

    try {
      setLoading(true);
      
      const eventInstanceData = {
        master_event_id: formData.master_event_id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        recurrence_type: formData.recurrence_type,
        recurrence_end_date: formData.recurrence_end_date || undefined,
        registered_participants: formData.registered_participants
      };

      await apiPut<EventInstance>(`/event-instances/${eventUuid}`, eventInstanceData);
      showSuccess('Acara berhasil diperbarui', 'Berhasil', () => {
        router.push('/events');
      });
      
    } catch (error) {
      console.error('Error updating event instance:', error);
      showError('Gagal memperbarui acara');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus acara ini? Tindakan ini tidak dapat dibatalkan.',
      'Konfirmasi Hapus Acara',
      async () => {
        try {
          setLoading(true);
          await apiDelete(`/event-instances/${eventUuid}`);
          showSuccess('Acara berhasil dihapus', 'Berhasil', () => {
            router.push('/events');
          });
        } catch (error) {
          console.error('Error deleting event instance:', error);
          showError('Gagal menghapus acara');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  if (loadingData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data acara...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
                Edit Acara
              </h1>
              <p className="text-gray-600">
                Perbarui detail acara
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Hapus Acara
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Master Event Selection */}
              <div>
                <label htmlFor="master_event_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Master Acara *
                </label>
                <select
                  id="master_event_id"
                  name="master_event_id"
                  value={formData.master_event_id}
                  onChange={(e) => handleMasterEventChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  required
                >
                  <option value="">Pilih Master Acara</option>
                  {masterEvents.map((masterEvent) => (
                    <option key={masterEvent.uuid} value={masterEvent.uuid}>
                      {masterEvent.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Acara *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="Masukkan judul acara"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="Masukkan deskripsi acara"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="Masukkan lokasi acara"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    id="end_time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Recurrence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="recurrence_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Pengulangan
                  </label>
                  <select
                    id="recurrence_type"
                    name="recurrence_type"
                    value={formData.recurrence_type}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  >
                    <option value="none">Sekali</option>
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>
                {formData.recurrence_type !== 'none' && (
                  <div>
                    <label htmlFor="recurrence_end_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Berakhir Pada
                    </label>
                    <input
                      type="date"
                      id="recurrence_end_date"
                      name="recurrence_end_date"
                      value={formData.recurrence_end_date}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                    />
                  </div>
                )}
              </div>


              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/events')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                >
                  {loading ? (
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
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
