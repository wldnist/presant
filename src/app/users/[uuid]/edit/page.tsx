'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserRole } from '@/types';
import { MockUserService } from '@/services/mockServices';
import AppLayout from '@/components/AppLayout';
import SimpleModal from '@/components/SimpleModal';
import { useSimpleModal } from '@/hooks/useSimpleModal';

// Services
const userService = new MockUserService();

export default function UserFormPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'USER' as UserRole,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [userUuid, setUserUuid] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { modalState, hideModal, handleConfirm, handleCancel, showSuccess, showError, showConfirm } = useSimpleModal();


  // Check if this is edit mode
  useEffect(() => {
    const loadUser = async (uuid: string) => {
      try {
        setLoading(true);
        const user = await userService.getUserByUuid(uuid);
        if (user) {
          setFormData({
            username: user.username,
            password: '', // Don't show password in edit mode
            role: user.role,
            is_active: user.is_active
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        showError('Gagal memuat data user');
      } finally {
        setLoading(false);
      }
    };

    if (params?.uuid && params.uuid !== 'new') {
      setIsEdit(true);
      setUserUuid(params.uuid as string);
      loadUser(params.uuid as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.uuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || (!isEdit && !formData.password.trim())) {
      showError('Username dan password harus diisi');
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit && userUuid) {
        // Update user
        const updateData: Partial<{
          username: string;
          password: string;
          role: UserRole;
          is_active: boolean;
        }> = {
          username: formData.username,
          role: formData.role,
          is_active: formData.is_active
        };
        
        // Only update password if provided
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        await userService.updateUser(userUuid, updateData);
        showSuccess('User berhasil diperbarui', 'Berhasil', () => {
          router.push('/users');
        });
      } else {
        // Create new user
        await userService.createUser(formData);
        showSuccess('User berhasil dibuat', 'Berhasil', () => {
          router.push('/users');
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showError('Gagal menyimpan user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userUuid) return;
    
    showConfirm(
      'Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.',
      'Konfirmasi Hapus User',
      async () => {
        try {
          setLoading(true);
          await userService.deleteUser(userUuid);
          showSuccess('User berhasil dihapus', 'Berhasil', () => {
            router.push('/users');
          });
        } catch (error) {
          console.error('Error deleting user:', error);
          showError('Gagal menghapus user');
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
            <p className="text-gray-600">Memuat data user...</p>
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
                {isEdit ? 'Edit User' : 'Tambah User Baru'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Perbarui informasi user' : 'Buat user baru untuk mengakses sistem'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={() => router.push('/users')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Kembali
              </button>
              {isEdit && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Hapus User
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="Masukkan username"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password {isEdit ? '(kosongkan jika tidak ingin mengubah)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 font-medium"
                  placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password"}
                  required={!isEdit}
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900"
                  required
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                </select>
              </div>

              {/* Is Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  User aktif
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/users')}
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
                    isEdit ? 'Perbarui User' : 'Buat User'
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
