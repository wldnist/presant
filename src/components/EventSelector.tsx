import { EventInstance } from '@/types';
import { formatEventDate, isToday, formatEventDateShort } from '@/utils/eventUtils';

interface EventSelectorProps {
  events: EventInstance[];
  selectedEvent: EventInstance | null;
  onEventChange: (event: EventInstance | null) => void;
  loading?: boolean;
}

export default function EventSelector({ 
  events, 
  selectedEvent, 
  onEventChange, 
  loading = false 
}: EventSelectorProps) {
  const handleEventChange = (eventId: string) => {
    if (eventId === '') {
      onEventChange(null);
    } else {
      const event = events.find(e => e.uuid === eventId);
      onEventChange(event || null);
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor="event-select" className="block text-sm font-medium text-gray-700 mb-2">
        Pilih Acara Hari Ini
      </label>
      <div className="relative">
        <select
          id="event-select"
          value={selectedEvent?.uuid || ''}
          onChange={(e) => handleEventChange(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{ 
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            minHeight: '48px'
          }}
        >
          <option value="">
            {loading ? 'Memuat acara...' : '-- Pilih Acara Hari Ini --'}
          </option>
          {events.map((event) => (
            <option 
              key={event.uuid} 
              value={event.uuid}
              style={{ 
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                padding: '8px'
              }}
            >
              {event.title}
              {event.recurrence_type && event.recurrence_type !== 'none' ? 
                ` [${event.recurrence_type === 'daily' ? 'Harian' : 
                   event.recurrence_type === 'weekly' ? 'Mingguan' : 
                   event.recurrence_type === 'monthly' ? 'Bulanan' : ''}]` :
                ` (${formatEventDateShort(event.start_date)})`
              }
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {selectedEvent && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-blue-900">{selectedEvent.title}</h3>
            {isToday(selectedEvent.start_date) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Hari Ini
              </span>
            )}
          </div>
          <p className="text-sm text-blue-700">
            📅 {selectedEvent.recurrence_type && selectedEvent.recurrence_type !== 'none' ? 
              `${selectedEvent.recurrence_type === 'daily' ? 'Setiap hari' : 
                selectedEvent.recurrence_type === 'weekly' ? 'Setiap minggu' : 
                selectedEvent.recurrence_type === 'monthly' ? 'Setiap bulan' : ''}` :
              formatEventDate(selectedEvent.start_date)
            }
            {selectedEvent.recurrence_type && selectedEvent.recurrence_type !== 'none' && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {selectedEvent.recurrence_type === 'daily' ? 'Harian' : 
                 selectedEvent.recurrence_type === 'weekly' ? 'Mingguan' : 
                 selectedEvent.recurrence_type === 'monthly' ? 'Bulanan' : ''}
              </span>
            )}
          </p>
          {selectedEvent.location && (
            <p className="text-sm text-blue-700">📍 {selectedEvent.location}</p>
          )}
          {selectedEvent.description && (
            <p className="text-sm text-blue-600 mt-1">{selectedEvent.description}</p>
          )}
        </div>
      )}
      
      {events.length === 0 && !loading && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              Tidak ada acara yang dijadwalkan untuk hari ini
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
