'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function ReportsPage() {
  const router = useRouter();

  // Redirect to default submenu (Laporan Kehadiran Acara)
  useEffect(() => {
    router.replace('/reports/events');
  }, [router]);

  // Show loading while redirecting
  return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengarahkan...</p>
        </div>
      </div>
    </AppLayout>
  );
}
