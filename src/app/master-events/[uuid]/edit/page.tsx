'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MasterEvent } from '@/types';
import { MockMasterEventService } from '@/services/mockServices';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleModal from '@/components/SimpleModal';
import { useSimpleModal } from '@/hooks/useSimpleModal';

// Services
const masterEventService = new MockMasterEventService();

export default function EditMasterEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    estimated_duration: '',
    requirements: [] as string[]
  });
  
  const [requirementInput, setRequirementInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();
  const params = useParams();
  const masterEventUuid = params.uuid as string;
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError } = useSimpleModal();

  // Load master event data
  useEffect(() => {
    const loadMasterEvent = async () => {
      try {
        setLoadingData(true);
        const masterEvent = await masterEventService.getMasterEventByUuid(masterEventUuid);
        if (!masterEvent) {
          showError('Master acara tidak ditemukan');
          setTimeout(() => router.push('/master-events'), 1500);
          return;
        }

        // Populate form data
        setFormData({
          title: masterEvent.title,
          description: masterEvent.description || '',
          location: masterEvent.location || '',
          estimated_duration: masterEvent.estimated_duration?.toString() || '',
          requirements: masterEvent.requirements || []
        });
        
      } catch (error) {
        console.error('Error loading master event:', error);
        showError('Gagal memuat data master acara');
        setTimeout(() => router.push('/master-events'), 1500);
      } finally {
        setLoadingData(false);
      }
    };

    if (masterEventUuid) {
      loadMasterEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterEventUuid]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showError('Judul master acara harus diisi');
      return;
    }

    try {
      setLoading(true);
      
      const masterEventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
        requirements: formData.requirements.length > 0 ? formData.requirements : undefined
      };

      await masterEventService.updateMasterEvent(masterEventUuid, masterEventData);
      showSuccess('Master acara berhasil diperbarui');
      
      // Redirect to master events list
      setTimeout(() => {
        router.push('/master-events');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating master event:', error);
      showError('Gagal memperbarui master acara');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showError(
      'Apakah Anda yakin ingin menghapus master acara ini?',
      'Konfirmasi Hapus',
      async () => {
        try {
          setLoading(true);
          await masterEventService.deleteMasterEvent(masterEventUuid);
          showSuccess('Master acara berhasil dihapus');
          setTimeout(() => router.push('/master-events'), 1500);
        } catch (error) {
          console.error('Error deleting master event:', error);
          showError('Gagal menghapus master acara');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  if (loadingData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data master acara...</p>
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
                  Edit Master Acara
                </h1>
                <p className="text-gray-600">
                  Perbarui template master acara
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={() => router.push('/master-events')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Hapus Master Acara
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Master Acara *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="Masukkan judul master acara"
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
                  placeholder="Masukkan deskripsi master acara"
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
                  placeholder="Masukkan lokasi master acara"
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Durasi (menit)
                </label>
                <input
                  type="number"
                  id="estimated_duration"
                  name="estimated_duration"
                  value={formData.estimated_duration}
                  onChange={handleInputChange}
                  min="1"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="120"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persyaratan
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
                      placeholder="Masukkan persyaratan"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                    />
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Tambah
                    </button>
                  </div>
                  {formData.requirements.length > 0 && (
                    <div className="space-y-2">
                      {formData.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                          <span className="text-sm text-gray-700">{requirement}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/master-events')}
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
    </ProtectedRoute>
  );
}
