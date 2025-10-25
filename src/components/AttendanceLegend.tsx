'use client';

import { AttendanceLegendProps } from '@/types';
import { AttendanceStatus } from '@/types';

export default function AttendanceLegend({ 
  onFilterChange, 
  activeFilter 
}: AttendanceLegendProps) {
  const statusOptions: { status: AttendanceStatus | 'all'; label: string; color: string }[] = [
    { status: 'all', label: 'Semua', color: 'bg-gray-500' },
    { status: 'present', label: 'Hadir', color: 'bg-green-500' },
    { status: 'excused', label: 'Ijin', color: 'bg-yellow-500' },
    { status: 'sick', label: 'Sakit', color: 'bg-orange-500' },
    { status: 'absent', label: 'Absen', color: 'bg-red-500' }
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {statusOptions.map((option) => (
        <button
          key={option.status}
          onClick={() => onFilterChange(option.status)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            transition-all duration-200
            ${activeFilter === option.status 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : 'hover:opacity-80'
            }
          `}
        >
          <div className={`w-4 h-4 rounded ${option.color}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}
