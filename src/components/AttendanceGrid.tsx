'use client';

import { AttendanceRecord, AttendanceStatus } from '@/types';
import AttendanceCard from './AttendanceCard';

interface AttendanceGridProps {
  records: AttendanceRecord[];
  onStatusChange: (participantId: string, status: AttendanceStatus) => void;
}

export default function AttendanceGrid({ records, onStatusChange }: AttendanceGridProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">Tidak ada data peserta</p>
      </div>
    );
  }

  return (
    <div className="
      grid grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      2xl:grid-cols-5
      gap-4
    ">
      {records.map((record) => (
        <AttendanceCard
          key={record.participant.id}
          participant={record.participant}
          status={record.attendance.status}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
