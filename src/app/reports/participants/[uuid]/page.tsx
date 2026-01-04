'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/id';
import { Participant, EventInstance } from '@/types';
import { MockParticipantService, MockEventInstanceService, MockAttendanceService } from '@/services/mockServices';
import { AttendanceSubmission } from '@/services/interfaces';
import AppLayout from '@/components/AppLayout';
import ParticipantEventAttendanceModal from '@/components/ParticipantEventAttendanceModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EventAttendanceData {
  eventInstance: EventInstance;
  isPresent: boolean;
  attendance: AttendanceSubmission | null;
}

// Services
const participantService = new MockParticipantService();
const eventInstanceService = new MockEventInstanceService();
const attendanceService = new MockAttendanceService();

export default function ParticipantReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const participantUuid = params.uuid as string;
  
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [eventAttendanceData, setEventAttendanceData] = useState<EventAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceSubmission>>(new Map());
  const [selectedYears, setSelectedYears] = useState<Map<string, string>>(new Map());

  // Load report data
  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        
        // Validate participantUuid
        if (!participantUuid) {
          console.error('Participant UUID is missing');
          router.push('/reports/participants');
          return;
        }
        
        // Load participant
        const participantData = await participantService.getParticipantByUuid(participantUuid);
        if (!participantData) {
          console.error('Participant not found:', participantUuid);
          router.push('/reports/participants');
          return;
        }
        setParticipant(participantData);
        
        // Load all event instances
        const allEventInstances = await eventInstanceService.getAllEventInstances();
        
        // Filter event instances where this participant is registered
        const participantEvents = allEventInstances.filter(event => 
          event.registered_participants.includes(participantUuid)
        );
        
        // Load attendance data
        const allAttendance = await attendanceService.getAllAttendance();
        const participantAttendance = allAttendance.filter(att => 
          att.participant_id === participantUuid
        );
        
        // Create attendance map by event_id
        const attendanceMapData = new Map<string, AttendanceSubmission>();
        participantAttendance.forEach(att => {
          attendanceMapData.set(att.event_id, att);
        });
        setAttendanceMap(attendanceMapData);
        
        
        // Create attendance data for each event instance
        const attendanceData: EventAttendanceData[] = participantEvents.map(event => {
          const attendance = attendanceMapData.get(event.uuid) || null;
          const isPresent = attendance?.status === 'present';
          
          return {
            eventInstance: event,
            isPresent,
            attendance
          };
        });
        
        // Sort by date (most recent first)
        attendanceData.sort((a, b) => {
          const dateA = new Date(a.eventInstance.start_date).getTime();
          const dateB = new Date(b.eventInstance.start_date).getTime();
          return dateB - dateA;
        });
        
        setEventAttendanceData(attendanceData);
        
      } catch (error) {
        console.error('Error loading report data:', error);
        router.push('/reports/participants');
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [participantUuid, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data laporan...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!participant) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Peserta Tidak Ditemukan</h3>
            <p className="text-gray-500 mb-4">Peserta yang Anda cari tidak ditemukan atau telah dihapus.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getGenderLabel = (gender: string) => {
    return gender === 'L' ? 'Laki-Laki' : 'Perempuan';
  };

  // Group events by EventInstance title (acara)
  const eventsByTitle = new Map<string, EventAttendanceData[]>();
  eventAttendanceData.forEach(item => {
    const eventTitle = item.eventInstance.title;
    if (!eventsByTitle.has(eventTitle)) {
      eventsByTitle.set(eventTitle, []);
    }
    eventsByTitle.get(eventTitle)!.push(item);
  });

  // Prepare chart data for each event - group by month and year
  const chartsData = Array.from(eventsByTitle.entries()).map(([eventTitle, events]) => {
    // Group by month and year separately
    const monthYearDataMap = new Map<string, { month: string; year: string; total: number; present: number }>();
    const availableYears = new Set<string>();
    
    events.forEach(event => {
      const date = moment(event.eventInstance.start_date);
      const month = date.locale('id').format('MMM');
      const year = date.format('YYYY');
      const key = `${month}-${year}`;
      availableYears.add(year);
      
      if (!monthYearDataMap.has(key)) {
        monthYearDataMap.set(key, { month, year, total: 0, present: 0 });
      }
      const data = monthYearDataMap.get(key)!;
      data.total += 1;
      if (event.isPresent) {
        data.present += 1;
      }
    });

    // Get all available years sorted
    const years = Array.from(availableYears).sort((a, b) => parseInt(b) - parseInt(a));
    const defaultYear = years[0] || moment().format('YYYY');
    
    // Get selected year for this chart, default to latest year
    const selectedYear = selectedYears.get(eventTitle) || defaultYear;

    // Filter and prepare chart data for selected year
    const chartData = Array.from(monthYearDataMap.entries())
      .filter(([, data]) => data.year === selectedYear)
      .map(([, data]) => ({
        month: data.month,
        year: data.year,
        attendanceRate: data.total > 0 ? Number(((data.present / data.total) * 100).toFixed(1)) : 0,
        presentCount: data.present,
        totalInstances: data.total
      }))
      .sort((a, b) => {
        const dateA = moment(`${a.month} ${a.year}`, 'MMM YYYY').toDate().getTime();
        const dateB = moment(`${b.month} ${b.year}`, 'MMM YYYY').toDate().getTime();
        return dateA - dateB;
      });

    // Get first event instance for reference
    const firstEvent = events[0].eventInstance;

    return {
      eventTitle,
      eventInstance: firstEvent,
      chartData,
      events,
      availableYears: years,
      selectedYear
    };
  });

  const handleBarClick = (_data: unknown, eventTitle: string) => {
    setSelectedEventTitle(eventTitle);
  };

  // Get selected events for modal
  const selectedChartInfo = selectedEventTitle 
    ? chartsData.find(c => c.eventTitle === selectedEventTitle)
    : null;
  const selectedEvents = selectedChartInfo 
    ? selectedChartInfo.events.map(e => e.eventInstance)
    : [];
  const selectedEventTitleForModal = selectedChartInfo 
    ? selectedChartInfo.eventTitle
    : '';

  return (
    <AppLayout>
      <div className="p-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Laporan Kehadiran Peserta
              </h1>
              <p className="text-gray-600">
                {participant.name}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Participant Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Informasi Peserta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Nama:</span>
                <span className="ml-2 text-blue-700">{participant.name}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Jenis Kelamin:</span>
                <span className="ml-2 text-blue-700">{getGenderLabel(participant.gender)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Umur:</span>
                <span className="ml-2 text-blue-700">{participant.age} tahun</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Nomor Telepon:</span>
                <span className="ml-2 text-blue-700">{participant.phone_number}</span>
              </div>
            </div>
          </div>

          {/* Overall Summary */}
          {eventAttendanceData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Kehadiran</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{eventAttendanceData.length}</div>
                  <div className="text-sm text-gray-500">Total Acara</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {eventAttendanceData.filter(item => item.isPresent).length}
                  </div>
                  <div className="text-sm text-gray-500">Total Kehadiran</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {eventAttendanceData.length > 0
                      ? (
                          (eventAttendanceData.filter(item => item.isPresent).length / eventAttendanceData.length) *
                          100
                        ).toFixed(1) + '%'
                      : '0%'}
                  </div>
                  <div className="text-sm text-gray-500">Tingkat Kehadiran</div>
                </div>
              </div>
            </div>
          )}

          {/* Charts - One per Event */}
          {chartsData.length > 0 && (
            <div className="space-y-6">
              {chartsData.map((chartInfo) => {
                const maxRateForChart = Math.max(...chartInfo.chartData.map(d => d.attendanceRate), 0);
                const yAxisMaxForChart = maxRateForChart === 0 ? 100 : Math.ceil(maxRateForChart / 10) * 10;

                return (
                  <div key={chartInfo.eventTitle} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">{chartInfo.eventTitle}</h3>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Tahun:</label>
                        <select
                          value={chartInfo.selectedYear}
                          onChange={(e) => {
                            const newSelectedYears = new Map(selectedYears);
                            newSelectedYears.set(chartInfo.eventTitle, e.target.value);
                            setSelectedYears(newSelectedYears);
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {chartInfo.availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={chartInfo.chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}
                        onClick={(_data: unknown) => handleBarClick(_data, chartInfo.eventTitle)}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: '#374151' }}
                          label={{ value: 'Bulan', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
                        />
                        <YAxis 
                          domain={[0, yAxisMaxForChart]}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          allowDecimals={false}
                          label={{ value: 'Tingkat Kehadiran (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
                        />
                        <Tooltip 
                          formatter={(value: number | undefined, _name: string | undefined, props: { payload?: { totalInstances: number; presentCount: number; month: string; year: string } }) => {
                            const count = value ?? 0;
                            const total = props.payload?.totalInstances ?? 0;
                            const present = props.payload?.presentCount ?? 0;
                            const month = props.payload?.month ?? '';
                            const year = props.payload?.year ?? '';
                            return [`${count}% (${present}/${total} pertemuan)`, `${month} ${year}`];
                          }}
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                          }}
                        />
                        <Bar 
                          dataKey="attendanceRate" 
                          radius={[4, 4, 0, 0]}
                          strokeWidth={2}
                          style={{ cursor: 'pointer' }}
                        >
                          {chartInfo.chartData.map((entry, index) => {
                            // Color based on attendance rate
                            let color = '#ef4444'; // red (low)
                            if (entry.attendanceRate >= 80) {
                              color = '#10b981'; // green (high)
                            } else if (entry.attendanceRate >= 60) {
                              color = '#eab308'; // yellow (medium)
                            } else if (entry.attendanceRate >= 40) {
                              color = '#f97316'; // orange (low-medium)
                            }
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Klik pada bar untuk melihat detail kehadiran
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Detail Modal */}
          {selectedEventTitle && selectedEvents.length > 0 && (
            <ParticipantEventAttendanceModal
              isOpen={selectedEventTitle !== null}
              onClose={() => setSelectedEventTitle(null)}
              masterEventTitle={selectedEventTitleForModal}
              eventInstances={selectedEvents}
              attendanceMap={attendanceMap}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

