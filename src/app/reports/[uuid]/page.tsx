'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function ReportDetailRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const eventUuid = params.uuid as string;

  // Redirect to new route structure
  useEffect(() => {
    if (eventUuid) {
      router.replace(`/reports/events/${eventUuid}`);
    } else {
      router.replace('/reports/events');
    }
  }, [eventUuid, router]);

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
