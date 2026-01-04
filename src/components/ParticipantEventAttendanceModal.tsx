'use client';

import { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/id';
import { EventInstance, MasterEvent } from '@/types';
import { AttendanceSubmission } from '@/services/interfaces';

interface ParticipantEventAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterEventTitle: string;
  eventInstances: EventInstance[];
  attendanceMap: Map<string, AttendanceSubmission>;
}

export default function ParticipantEventAttendanceModal({
  isOpen,
  onClose,
  masterEventTitle,
  eventInstances,
  attendanceMap
}: ParticipantEventAttendanceModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (attendance: AttendanceSubmission | null) => {
    if (!attendance) return 'bg-red-100 text-red-800';
    switch (attendance.status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'excused':
        return 'bg-yellow-100 text-yellow-800';
      case 'sick':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusLabel = (attendance: AttendanceSubmission | null) => {
    if (!attendance) return 'Tidak Hadir';
    switch (attendance.status) {
      case 'present':
        return 'Hadir';
      case 'excused':
        return 'Izin';
      case 'sick':
        return 'Sakit';
      default:
        return 'Tidak Hadir';
    }
  };

  // Sort by date (most recent first)
  const sortedEvents = [...eventInstances].sort((a, b) => {
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    return dateB - dateA;
  });

  return (
    <>
      {/* Modal Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto',
          padding: '20px',
          margin: 0
        }}
        onClick={onClose}
      >
        {/* Modal panel */}
        <div 
          className="bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Kehadiran: {masterEventTitle}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {eventInstances.length} pertemuan
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="divide-y divide-gray-200">
              {sortedEvents.map((event) => {
                const attendance = attendanceMap.get(event.uuid) || null;
                const statusColor = getStatusColor(attendance);
                const statusLabel = getStatusLabel(attendance);

                return (
                  <div key={event.uuid} className="py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-900">
                            {event.title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">Tanggal:</span>
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {moment(event.start_date).locale('id').format('DD MMMM YYYY')}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Waktu:</span>
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {event.start_time && event.end_time 
                                ? `${event.start_time} - ${event.end_time}`
                                : 'Tidak ditentukan'
                              }
                            </span>
                          </div>
                          {event.location && (
                            <div>
                              <span className="text-sm text-gray-500">Lokasi:</span>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {event.location}
                              </span>
                            </div>
                          )}
                          {attendance?.timestamp && (
                            <div>
                              <span className="text-sm text-gray-500">Waktu Kehadiran:</span>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {moment(attendance.timestamp).locale('id').format('DD MMM YYYY, HH:mm')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

