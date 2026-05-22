import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeatherChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(day => ({
    name: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    Temp: day.temperature,
    Max: day.maxTemp,
    Min: day.minTemp
  }));

  return (
    <div className="h-[300px] w-full mt-6 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
      <h3 className="text-lg font-semibold mb-4 text-white">Temperature Trends</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} />
          <YAxis stroke="#cbd5e1" fontSize={12} unit="°C" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="Temp" stroke="#00d2ff" strokeWidth={3} dot={{ r: 4, fill: '#00d2ff' }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Max" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          <Line type="monotone" dataKey="Min" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
