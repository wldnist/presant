'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AttendanceStatusChartProps {
  participants: Array<{ status: string }>;
}

interface StatusCount {
  present: number;
  excused: number;
  sick: number;
  absent: number;
}

export default function AttendanceStatusChart({ participants }: AttendanceStatusChartProps) {
  // Calculate status counts
  const statusCounts: StatusCount = participants.reduce(
    (acc, participant) => {
      const status = participant.status || 'absent';
      if (status === 'present') acc.present++;
      else if (status === 'excused') acc.excused++;
      else if (status === 'sick') acc.sick++;
      else acc.absent++;
      return acc;
    },
    { present: 0, excused: 0, sick: 0, absent: 0 }
  );

  const total = participants.length;

  // Prepare data for Recharts
  const chartData = [
    {
      name: 'Hadir',
      count: statusCounts.present,
      fill: '#10b981', // green-500
    },
    {
      name: 'Izin',
      count: statusCounts.excused,
      fill: '#eab308', // yellow-500
    },
    {
      name: 'Sakit',
      count: statusCounts.sick,
      fill: '#f97316', // orange-500
    },
    {
      name: 'Tidak Hadir',
      count: statusCounts.absent,
      fill: '#ef4444', // red-500
    },
  ];

  // Calculate Y-axis domain (round up to nearest 5 or 10)
  const maxCount = Math.max(statusCounts.present, statusCounts.excused, statusCounts.sick, statusCounts.absent, 1);
  const getYAxisMax = (max: number) => {
    if (max === 0) return 10;
    if (max <= 5) return 5;
    if (max <= 10) return 10;
    return Math.ceil(max / 5) * 5;
  };
  const yAxisMax = getYAxisMax(maxCount);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Statistik Kehadiran</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#374151' }}
            label={{ value: 'Status Kehadiran', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' } }}
          />
          <YAxis 
            domain={[0, yAxisMax]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            allowDecimals={false}
          />
          <Tooltip 
            formatter={(value: number | undefined) => {
              const count = value ?? 0;
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
              return [`${count} (${percentage}%)`, 'Jumlah'];
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
            dataKey="count" 
            radius={[4, 4, 0, 0]}
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-4">
          {chartData.map((item) => {
            const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
            return (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.fill }}></div>
                <span className="text-sm text-gray-700">{item.name}:</span>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                <span className="text-sm text-gray-500">({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
