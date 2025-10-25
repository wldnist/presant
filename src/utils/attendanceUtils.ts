// Utility Functions
import moment from 'moment';
import 'moment/locale/id'; // Import Indonesian locale
import { AttendanceStatus } from '@/types';

// Set moment locale to Indonesian
moment.locale('id');

export const getStatusColor = (status: AttendanceStatus): string => {
  switch (status) {
    case 'present':
      return 'bg-green-500';
    case 'excused':
      return 'bg-yellow-500';
    case 'sick':
      return 'bg-orange-500';
    case 'absent':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusLabel = (status: AttendanceStatus): string => {
  switch (status) {
    case 'present':
      return 'Hadir';
    case 'excused':
      return 'Ijin';
    case 'sick':
      return 'Sakit';
    case 'absent':
      return 'Absen';
    default:
      return 'Unknown';
  }
};

export const getNextStatus = (currentStatus: AttendanceStatus): AttendanceStatus => {
  switch (currentStatus) {
    case 'present':
      return 'excused';
    case 'excused':
      return 'sick';
    case 'sick':
      return 'absent';
    case 'absent':
      return 'present';
    default:
      return 'present';
  }
};

export const formatDate = (date: string | Date): string => {
  return moment(date).format('dddd, DD MMMM YYYY');
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
