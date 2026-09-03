

export default function DashboardStats({ monitors = [] }) {
  
// Safe navigation fallback: defaults to 0 if monitors is undefined or null
  const safeMonitors = Array.isArray(monitors) ? monitors : [];

  const total = safeMonitors.length;
  const up = safeMonitors.filter((m) => m.status === 'UP').length;
  const down = safeMonitors.filter((m) => m.status === 'DOWN').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-xl">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Monitors</p>
        <p className="text-3xl font-bold mt-1 text-white">{total}</p>
      </div>
      <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Online Systems</p>
        <p className="text-3xl font-bold text-emerald-400 mt-1">{up}</p>
      </div>
      <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Incidents</p>
        <p className="text-3xl font-bold text-rose-400 mt-1">{down}</p>
      </div>
    </div>
  );
}