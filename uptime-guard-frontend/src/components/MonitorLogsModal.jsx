import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';


const API_BASE = 'http://localhost:8000/api/monitors';

export default function MonitorLogsModal({ monitor, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!monitor) return;

        const fetchLogs = async () => {
            setLoading(true);
            try {
            const res = await axios.get(`${API_BASE}/${monitor._id}/log`);
            setLogs(res.data)
            } catch (err) {
            console.error('Error fetching logs:', err);
            setLogs([]);
            } finally {
            setLoading(false);
            }
        };

        fetchLogs();

        const socket = io("http://localhost:8000");

        socket.on('ping_log_added', (newLog) => {
            if (String(newLog.monitorId) === String(monitor._id)) {
            setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 49)]);
         }
        });

    return () => socket.disconnect();


        
    }, [monitor]);

  if (!monitor) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl shadow-2xl text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">{monitor.name} — Recent Logs</h3>
            <p className="text-xs text-slate-400">{monitor.url}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm py-8 text-center">Loading ping history...</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No logs recorded yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {logs.map((log) => (
              <div
                key={log._id}
                className="bg-slate-900 border border-slate-700/50 p-3 rounded-lg flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold ${
                      log.isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {log.statusCode ? `HTTP ${log.statusCode}` : 'FAILED'}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {new Date(log.checkedAt || log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-slate-300 font-mono">
                  {log.responseTimeMs ? `${log.responseTimeMs} ms` : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}