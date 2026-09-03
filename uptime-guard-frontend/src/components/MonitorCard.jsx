import { useEffect, useState } from 'react';
import ResponseTimeChart from './ResponseTimeChart';
import axios from 'axios';
import { io } from 'socket.io-client';


const API_BASE = 'http://localhost:8000/api/monitors';
const SOCKET_URL = 'http://localhost:8000';

export default function MonitorCard({ monitor, onDelete, onViewLogs }) {
 
  const isUp = monitor.status === 'UP';
  const isPending = monitor.status === 'PENDING';

  const statusBg = isUp
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : isPending
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  const dotColor = isUp ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-rose-500';


  const [logs, setLogs] = useState([]);

  // Fetch initial logs for chart on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${monitor._id}/log`);
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching card chart logs:', err);
      }
    };

    fetchLogs();

    // Connect WebSocket for live chart updates
    const socket = io(SOCKET_URL);

    socket.on('ping_log_added', (newLog) => {
      if (String(newLog.monitorId) === String(monitor._id)) {
        setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 19)]);
      }
    });

    return () => socket.disconnect();
  }, [monitor._id]);

  

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition-all flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-lg truncate max-w-[180px]" title={monitor.name}>
            {monitor.name}
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full border ${statusBg} flex items-center gap-1.5 font-medium`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            {monitor.status || 'PENDING'}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate mb-4 font-mono" title={monitor.url}>
          {monitor.url}
        </p>
      </div>

      {/* Live Response Time Area Chart */}
      <div>
        <div className="flex justify-between items-center mb-1 text-xs text-slate-400 font-medium">
          <span>Latency Trend</span>
          <span>Last {logs.length} pings</span>
        </div>
        <ResponseTimeChart logs={logs} />
      </div>

      <div className="flex items-center justify-between border-t border-slate-700/50 pt-4 mt-2">
        <button
          onClick={() => onViewLogs(monitor)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          View Logs
        </button>
        <button
          onClick={() => onDelete(monitor._id)}
          className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}