import { useState } from 'react';
import type { HistoryItem } from '../lib/mockData';
import { History as HistoryIcon, BookOpen } from 'lucide-react';

const History = () => {
  const [history] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bacayuk_history') || '[]');
    } catch {
      return [];
    }
  });

  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2a160b]">Riwayat Bacaan</h1>
          <p className="text-[#8a6d1c]">Pantau aktivitas membaca pengguna secara real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {history.map(item => (
          <div key={item.id} className="bg-[#f9f6f0] rounded-xl shadow-sm border border-[#d4c3a3] overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 flex gap-4">
              <img src={item.coverUrl} alt={item.bookTitle} className="w-20 h-28 object-cover rounded-md shadow-sm" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#2a160b] truncate">{item.bookTitle}</h3>
                <p className="text-sm text-[#8a6d1c] truncate">{item.author}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#8a6d1c]">{item.progress}%</span>
                    <span className="text-[#8a6d1c]">{item.currentPage} / {item.totalPages} hal</span>
                  </div>
                  <div className="w-full bg-[#ebdcb8] rounded-full h-1.5">
                    <div className="bg-[#3a2012] h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#8a6d1c]">
                  <HistoryIcon className="w-3.5 h-3.5" />
                  Terakhir: {item.lastRead}
                </div>
              </div>
            </div>
            <div className="bg-[#f0e6d2] px-5 py-3 border-t border-[#ebdcb8] flex justify-between items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                item.status === 'Sedang Dibaca' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {item.status}
              </span>
              <button onClick={() => setSelectedHistory(item)} className="text-[#8a6d1c] hover:text-primary/80 text-sm font-medium flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f9f6f0] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform scale-100 transition-all">
            <div className="p-5 border-b border-[#ebdcb8] flex items-center justify-between bg-[#f0e6d2]">
              <h3 className="text-lg font-bold text-[#2a160b] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#8a6d1c]" />
                Detail Aktivitas Membaca
              </h3>
              <button onClick={() => setSelectedHistory(null)} className="p-2 text-[#a49373] hover:bg-[#d4c3a3] rounded-full transition-colors">
                <span className="sr-only">Tutup</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex gap-5 mb-6">
                <img src={selectedHistory.coverUrl} alt={selectedHistory.bookTitle} className="w-24 h-36 object-cover rounded-lg shadow-sm border border-[#d4c3a3]" />
                <div>
                  <h4 className="text-xl font-bold text-[#2a160b] leading-tight mb-1">{selectedHistory.bookTitle}</h4>
                  <p className="text-[#8a6d1c] mb-3">{selectedHistory.author}</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    selectedHistory.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                    selectedHistory.status === 'Sedang Dibaca' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedHistory.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-[#f0e6d2] p-4 rounded-xl border border-[#ebdcb8] space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#5a3a22] font-medium">Progres Membaca</span>
                    <span className="font-bold text-[#8a6d1c]">{selectedHistory.progress}%</span>
                  </div>
                  <div className="w-full bg-[#d4c3a3] rounded-full h-2">
                    <div className="bg-[#3a2012] h-2 rounded-full" style={{ width: `${selectedHistory.progress}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-[#8a6d1c] mb-1">Halaman Saat Ini</p>
                    <p className="font-bold text-[#2a160b]">{selectedHistory.currentPage} <span className="text-[#a49373] font-normal">/ {selectedHistory.totalPages}</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a6d1c] mb-1">Aktivitas Terakhir</p>
                    <p className="font-bold text-[#2a160b] flex items-center gap-1.5">
                      <HistoryIcon className="w-3.5 h-3.5 text-[#a49373]" /> {selectedHistory.lastRead}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#ebdcb8] bg-[#f0e6d2] flex justify-end">
              <button onClick={() => setSelectedHistory(null)} className="px-5 py-2.5 bg-[#2a160b] text-[#f9f6f0] font-medium hover:bg-slate-800 rounded-xl transition-colors w-full sm:w-auto">Tutup Detail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default History;
