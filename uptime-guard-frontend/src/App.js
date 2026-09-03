import { useEffect, useState } from 'react';
import DashboardStats from './components/DashboardStats';
import MonitorCard from './components/MonitorCard';
import AddMonitorModal from './components/AddMonitorModal';
import MonitorLogsModal from './components/MonitorLogsModal';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:8000/api/monitors';

export default function App() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState(null);

  const fetchMonitors = async () => {
    try {
      const res = await axios.get(API_BASE);
      const data =  res.data;
      setMonitors(data);
    } catch (err) {
      console.error('Failed to fetch monitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial REST fetch on load
    fetchMonitors();

    // 2. Connect to WebSockets
    const socket = io("http://localhost:8000");

    // 3. Listen for live status updates from background checks
    socket.on('monitor_ping', (data) => {
      setMonitors((prevMonitors) =>
        prevMonitors.map((m) =>
          String(m._id) === String(data.monitorId)
            ? { ...m, status: data.status }
            : m
        )
      );
    });

    // 4. Listen for deleted monitors
    socket.on('monitor_deleted', (data) => {
      setMonitors((prevMonitors) =>
        prevMonitors.filter((m) => String(m._id) !== String(data.monitorId))
      );
    });

    return () => socket.disconnect();
  }, []);

  const handleAddMonitor = async (newMonitorData) => {
    try {

      await axios.post(API_BASE, newMonitorData);

      setIsModalOpen(false);
      fetchMonitors();

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to connect to backend.';
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleDeleteMonitor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this monitor and all its logs/incidents?')) return;

    try {
      
      await axios.delete(`${API_BASE}/${id}`);
      fetchMonitors();

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error deleting monitor.';
      alert(errorMsg);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="text-xl font-bold tracking-tight text-white">UptimeGuard</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
        >
          + Add Monitor
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <DashboardStats monitors={monitors} />

        <h2 className="text-lg font-semibold mb-4 text-slate-300">Monitored Services</h2>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading monitors...</p>
        ) : monitors.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No monitors configured yet. Click "+ Add Monitor" to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitors.map((monitor) => (
              <MonitorCard
                key={monitor._id}
                monitor={monitor}
                onDelete={handleDeleteMonitor}
                onViewLogs={(m) => setSelectedMonitor(m)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddMonitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMonitor}
      />

      <MonitorLogsModal
        monitor={selectedMonitor}
        onClose={() => setSelectedMonitor(null)}
      />
    </div>
  );
}