'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Helper function untuk mendapatkan initial sidebar state
function getInitialSidebarState(): boolean {
  if (typeof window === 'undefined') return false;
  
  const savedSidebarState = localStorage.getItem('presant_sidebar_open');
  if (savedSidebarState !== null) {
    return savedSidebarState === 'true';
  }
  
  // Default: open di desktop, closed di mobile
  const isDesktop = window.innerWidth >= 768;
  // Simpan default state ke localStorage
  localStorage.setItem('presant_sidebar_open', String(isDesktop));
  return isDesktop;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // Set initial state langsung dari localStorage menggunakan lazy initialization
  // Ini mencegah flash/close saat navigasi karena state langsung diinisialisasi dengan benar
  const [sidebarOpen, setSidebarOpen] = useState(() => getInitialSidebarState());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Ref untuk menyimpan state sidebar dan mencegah reset saat navigasi
  const sidebarStateRef = useRef(sidebarOpen);

  // Sync ref dengan state
  useEffect(() => {
    sidebarStateRef.current = sidebarOpen;
  }, [sidebarOpen]);

  // Set mounted flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle resize - terpisah dari initialization
  useEffect(() => {
    if (!mounted) return;
    
    const checkMobile = () => {
      const isDesktop = window.innerWidth >= 768;
      // Jika resize ke mobile, close sidebar
      // Tapi jangan ubah jika user sudah set preference
      if (!isDesktop && sidebarOpen) {
        setSidebarOpen(false);
        localStorage.setItem('presant_sidebar_open', 'false');
      }
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted, sidebarOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Simpan ke localStorage
    if (mounted) {
      localStorage.setItem('presant_sidebar_open', String(newState));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => {
            // Hanya tutup jika belum tertutup (prevent multiple calls)
            if (sidebarStateRef.current) {
              setSidebarOpen(false);
              sidebarStateRef.current = false;
              // Simpan state ke localStorage saat sidebar ditutup
              if (mounted) {
                localStorage.setItem('presant_sidebar_open', 'false');
              }
            }
          }} 
        />

        {/* Main Content - menyesuaikan width ketika sidebar di-hide */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          {/* Top Bar dengan Menu Toggle dan User Info */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              {/* Menu Toggle - Mobile & Desktop */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                {/* Hamburger Icon - tetap hamburger dengan animasi subtle */}
                <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                      sidebarOpen ? 'opacity-60' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                      sidebarOpen ? 'opacity-60' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                      sidebarOpen ? 'opacity-60' : 'opacity-100'
                    }`}
                  />
                </div>
              </button>

              {/* Spacer untuk desktop */}
              <div className="hidden lg:block flex-1"></div>

              {/* User Menu */}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* User Info */}
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>

                    {/* Dropdown Icon */}
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {/* User Info in Dropdown */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{user.username}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

