import { useState } from 'react';
import type { ActivityLog } from '../lib/mockData';
import { Activity as ActivityIcon, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react';

const Activity = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('bacayuk_activity');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleClearLogs = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat aktivitas?')) {
      localStorage.setItem('bacayuk_activity', JSON.stringify([]));
      setLogs([]);
    }
  };

  const getIcon = (status: string) => {
    if (status === 'Success') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'Warning') return <AlertCircle className="w-5 h-5 text-[#8a6d1c]" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2a160b]">Activity Log</h1>
          <p className="text-[#8a6d1c]">Catatan riwayat seluruh aktivitas di dalam sistem</p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Riwayat
          </button>
        )}
      </div>

      <div className="bg-[#f9f6f0] rounded-xl shadow-sm border border-[#d4c3a3] overflow-hidden">
        <div className="divide-y divide-slate-100">
          {logs.map(log => (
            <div key={log.id} className="p-5 hover:bg-[#ebdcb8] transition-colors flex items-start gap-4">
              <div className="mt-0.5">{getIcon(log.status)}</div>
              <div className="flex-1">
                <p className="text-[#2a160b]">
                  <span className="font-bold">{log.user}</span> {log.action} <span className="font-medium text-[#8a6d1c]">{log.target}</span>
                </p>
                <p className="text-sm text-[#8a6d1c] mt-1 flex items-center gap-1">
                  <ActivityIcon className="w-3.5 h-3.5" />
                  {log.time}
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
             <div className="p-8 text-center text-[#8a6d1c]">Belum ada aktivitas yang tercatat.</div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Activity;
