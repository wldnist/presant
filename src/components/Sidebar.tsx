'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);

  useEffect(() => {
    // Set mounted untuk menghindari hydration mismatch
    setMounted(true);
    // Auto-expand reports menu if on reports page
    if (pathname.startsWith('/reports')) {
      setReportsExpanded(true);
    }
  }, [pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Data Acara', href: '/events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Master Acara', href: '/master-events', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Data Peserta', href: '/participants', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { name: 'Data User', href: '/users', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const reportsSubmenu = [
    { name: 'Kehadiran Acara', href: '/reports/events' },
    { name: 'Kehadiran Peserta', href: '/reports/participants' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const isReportsActive = pathname.startsWith('/reports');

  return (
    <>
      {/* Overlay untuk mobile */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden transition-opacity duration-300 ${
          mounted && isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto
          ${isOpen ? 'lg:w-64' : 'lg:w-0 lg:border-r-0'}
          w-64 flex flex-col
          ${!isOpen ? 'lg:overflow-hidden' : ''}
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-200 lg:justify-center transition-opacity duration-300 ${!isOpen ? 'lg:opacity-0 lg:pointer-events-none' : ''}`}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Presant</h2>
          </div>
          {/* Close button untuk mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto p-4 transition-opacity duration-300 ${!isOpen ? 'lg:opacity-0 lg:pointer-events-none' : ''}`}>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close sidebar hanya di mobile setelah navigation
                      // Di desktop, sidebar tetap terbuka
                      if (mounted) {
                        const isMobile = window.innerWidth < 768;
                        if (isMobile) {
                          // Di mobile, tutup sidebar setelah navigasi
                          // Tidak perlu preventDefault, biarkan Link melakukan navigasi
                          // Sidebar akan ditutup setelah navigasi selesai
                          setTimeout(() => {
                            onClose();
                          }, 150); // Delay kecil untuk memastikan navigasi terjadi
                        }
                        // Di desktop, tidak perlu melakukan apa-apa
                      }
                    }}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg
                      transition-colors duration-200
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <svg
                      className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
            
            {/* Laporan dengan submenu */}
            <li>
              <button
                onClick={() => setReportsExpanded(!reportsExpanded)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${
                    isReportsActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className={`w-5 h-5 ${isReportsActive ? 'text-blue-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Laporan</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${reportsExpanded ? 'transform rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {reportsExpanded && (
                <ul className="mt-1 ml-8 space-y-1">
                  {reportsSubmenu.map((subItem) => {
                    const subActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                    return (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.href}
                          onClick={() => {
                            if (mounted) {
                              const isMobile = window.innerWidth < 768;
                              if (isMobile) {
                                setTimeout(() => {
                                  onClose();
                                }, 150);
                              }
                            }
                          }}
                          className={`
                            flex items-center px-4 py-2 rounded-lg text-sm
                            transition-colors duration-200
                            ${
                              subActive
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

