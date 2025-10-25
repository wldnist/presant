'use client';

import { AttendanceCardProps } from '@/types';
import { getStatusColor, getStatusLabel, getNextStatus } from '@/utils/attendanceUtils';

export default function AttendanceCard({ 
  participant, 
  status, 
  onStatusChange 
}: AttendanceCardProps) {
  const handleClick = () => {
    const nextStatus = getNextStatus(status);
    onStatusChange(participant.id, nextStatus);
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'L' ? '♂' : '♀';
  };

  return (
    <div
      className={`
        ${getStatusColor(status)} 
        rounded-lg p-4 cursor-pointer 
        transition-all duration-200 
        hover:opacity-80 hover:scale-105
        active:scale-95
        shadow-md
        relative
      `}
      onClick={handleClick}
    >
      {/* Gender indicator - top right */}
      <div className="absolute top-3 right-3 flex items-center space-x-1">
        <span className="text-white text-lg">{getGenderIcon(participant.gender)}</span>
        <span className="text-white text-sm font-medium">{participant.gender}</span>
      </div>

      <div className="text-white">
        <h3 className="font-bold text-lg mb-1 pr-16">
          {participant.name}
        </h3>
        <div className="text-sm opacity-90">
          <p className="flex items-center">
            <span className="mr-1">📱</span>
            {participant.phone_number}
          </p>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-white opacity-75">
          {getStatusLabel(status)}
        </span>
        <span className="text-xs text-white opacity-50">
          Tap to change
        </span>
      </div>
    </div>
  );
}
