'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Participant } from '@/types';
import AppLayout from '@/components/AppLayout';
import SimpleModal from '@/components/SimpleModal';
import { useSimpleModal } from '@/hooks/useSimpleModal';
import { apiGet, apiPut, apiPost, apiDelete } from '@/utils/api';

export default function ParticipantFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    gender: 'L' as 'L' | 'P',
    age: 0
  });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [participantUuid, setParticipantUuid] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError, showConfirm } = useSimpleModal();

  // Check if this is edit mode
  useEffect(() => {
    const loadParticipant = async (uuid: string) => {
      try {
        setLoading(true);
        const participant = await apiGet<Participant>(`/participants/${uuid}`);
        if (participant) {
          setFormData({
            name: participant.name,
            phone_number: participant.phone_number,
            gender: participant.gender,
            age: participant.age
          });
        }
      } catch (error) {
        console.error('Error loading participant:', error);
        showError('Gagal memuat data participant');
      } finally {
        setLoading(false);
      }
    };

    if (params?.uuid && params.uuid !== 'new') {
      setIsEdit(true);
      setParticipantUuid(params.uuid as string);
      loadParticipant(params.uuid as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.uuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone_number.trim() || formData.age <= 0) {
      showError('Name, phone number, and age must be filled');
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit && participantUuid) {
        // Update participant
        await apiPut<Participant>(`/participants/${participantUuid}`, formData);
        showSuccess('Participant updated successfully', 'Success', () => {
          router.push('/participants');
        });
      } else {
        // Create new participant
        await apiPost<Participant>('/participants', formData);
        showSuccess('Participant created successfully', 'Success', () => {
          router.push('/participants');
        });
      }
    } catch (error) {
      console.error('Error saving participant:', error);
      showError('Failed to save participant');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!participantUuid) return;
    
    showConfirm(
      'Apakah Anda yakin ingin menghapus participant ini? Tindakan ini tidak dapat dibatalkan.',
      'Konfirmasi Hapus Participant',
      async () => {
        try {
          setLoading(true);
          await apiDelete(`/participants/${participantUuid}`);
          showSuccess('Participant deleted successfully', 'Success', () => {
            router.push('/participants');
          });
        } catch (error) {
          console.error('Error deleting participant:', error);
          showError('Failed to delete participant');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading && isEdit) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data participant...</p>
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
                {isEdit ? 'Edit Participant' : 'Tambah Participant Baru'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Perbarui informasi participant' : 'Buat participant baru untuk mengikuti acara'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              {isEdit && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Hapus Participant
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900"
                  required
                >
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="Enter age"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/participants')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200 flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEdit ? 'Memperbarui...' : 'Membuat...'}
                    </>
                  ) : (
                    isEdit ? 'Perbarui Participant' : 'Buat Participant'
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
