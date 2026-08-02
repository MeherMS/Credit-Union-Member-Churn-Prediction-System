'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface FeatureRadarChartProps {
  data: Array<{
    feature: string;
    importance: number;
  }>;
  title?: string;
}

export default function FeatureRadarChart({
  data,
  title = 'Top Risk Factors',
}: FeatureRadarChartProps) {
  // Transform data for Recharts
  const chartData = data
    .slice(0, 5)
    .map((item) => ({
      name: item.feature.replace(/_/g, ' ').toUpperCase(),
      value: parseFloat(item.importance.toFixed(1)),
    }))
    .sort((a, b) => b.value - a.value);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600">No feature data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Importance %"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Feature List */}
      <div className="mt-6 space-y-2">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-gray-700">{item.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
              <span className="text-gray-900 font-semibold w-12 text-right">
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}