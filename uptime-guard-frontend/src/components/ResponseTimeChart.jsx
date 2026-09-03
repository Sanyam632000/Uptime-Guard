import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function ResponseTimeChart({ logs = [] }) {
  // Format and reverse logs so the oldest ping is on the left and newest is on the right
  const chartData = [...logs]
    .slice(0, 20)
    .reverse()
    .map((log) => ({
      time: new Date(log.checkedAt || log.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      ms: log.responseTimeMs || 0,
      isUp: log.isUp,
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-xs text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800">
        Waiting for ping data...
      </div>
    );
  }

  return (
    <div className="h-28 w-full bg-slate-900/50 p-2 rounded-lg border border-slate-800/80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-950 border border-slate-700 p-2 rounded shadow-lg text-xs font-mono">
                    <p className="text-slate-400">{data.time}</p>
                    <p className={data.isUp ? 'text-emerald-400' : 'text-rose-400'}>
                      {data.isUp ? `${data.ms} ms` : 'Failed / Down'}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="ms"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#latencyGradient)"
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}