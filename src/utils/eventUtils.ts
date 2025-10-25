import moment from 'moment';
import 'moment/locale/id'; // Import Indonesian locale
import { Event } from '@/types';

// Set moment locale to Indonesian
moment.locale('id');

/**
 * Filter events yang terjadi pada hari ini
 * @param events Array of events
 * @returns Array of events yang terjadi hari ini
 */
export function filterEventsToday(events: Event[]): Event[] {
  const today = moment().format('YYYY-MM-DD');
  
  return events.filter(event => {
    const eventDate = moment(event.date).format('YYYY-MM-DD');
    return eventDate === today;
  });
}

/**
 * Format tanggal untuk display
 * @param dateString String tanggal dalam format YYYY-MM-DD
 * @returns String tanggal yang sudah diformat
 */
export function formatEventDate(dateString: string): string {
  return moment(dateString).format('dddd, DD MMMM YYYY');
}

/**
 * Cek apakah tanggal adalah hari ini
 * @param dateString String tanggal dalam format YYYY-MM-DD
 * @returns Boolean apakah tanggal adalah hari ini
 */
export function isToday(dateString: string): boolean {
  return moment(dateString).isSame(moment(), 'day');
}

/**
 * Format tanggal untuk display dengan format singkat
 * @param dateString String tanggal dalam format YYYY-MM-DD
 * @returns String tanggal yang sudah diformat singkat
 */
export function formatEventDateShort(dateString: string): string {
  return moment(dateString).format('DD/MM/YYYY');
}

/**
 * Cek apakah tanggal adalah masa depan
 * @param dateString String tanggal dalam format YYYY-MM-DD
 * @returns Boolean apakah tanggal adalah masa depan
 */
export function isFuture(dateString: string): boolean {
  return moment(dateString).isAfter(moment(), 'day');
}

/**
 * Cek apakah tanggal adalah masa lalu
 * @param dateString String tanggal dalam format YYYY-MM-DD
 * @returns Boolean apakah tanggal adalah masa lalu
 */
export function isPast(dateString: string): boolean {
  return moment(dateString).isBefore(moment(), 'day');
}

/**
 * Dapatkan tanggal hari ini dalam format YYYY-MM-DD
 * @returns String tanggal hari ini
 */
export function getTodayString(): string {
  return moment().format('YYYY-MM-DD');
}

/**
 * Dapatkan tanggal besok dalam format YYYY-MM-DD
 * @returns String tanggal besok
 */
export function getTomorrowString(): string {
  return moment().add(1, 'day').format('YYYY-MM-DD');
}

/**
 * Dapatkan tanggal kemarin dalam format YYYY-MM-DD
 * @returns String tanggal kemarin
 */
export function getYesterdayString(): string {
  return moment().subtract(1, 'day').format('YYYY-MM-DD');
}
