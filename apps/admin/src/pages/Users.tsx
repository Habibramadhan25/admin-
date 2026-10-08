import { useState, useEffect } from 'react';
import type { User } from '../lib/mockData';
import { Users as UsersIcon, Search, MoreVertical, UserX } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('bacayuk_users') || '[]');
    setUsers(data);
  }, []);

  const [showToast, setShowToast] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleToggleStatus = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' as 'Active' | 'Inactive' };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('bacayuk_users', JSON.stringify(updated));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2a160b]">Manajemen Pengguna</h1>
          <p className="text-[#8a6d1c]">Kelola data pengguna aplikasi BacaYuk</p>
        </div>
      </div>

      <div className="bg-[#f9f6f0] rounded-xl shadow-sm border border-[#d4c3a3] overflow-hidden">
        <div className="p-4 border-b border-[#d4c3a3] flex justify-between items-center bg-[#f0e6d2]">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a49373]" />
            <input 
              type="text" 
              placeholder="Cari pengguna..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#c2b192] rounded-lg text-sm focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0e6d2] border-b border-[#d4c3a3] text-[#8a6d1c] text-sm">
                <th className="p-4 font-medium">Pengguna</th>
                <th className="p-4 font-medium">Bergabung</th>
                <th className="p-4 font-medium">Buku Dibaca</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-[#ebdcb8] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#d4c3a3]" />
                    <div>
                      <div className="font-medium text-[#2a160b]">{user.name}</div>
                      <div className="text-xs text-[#8a6d1c]">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-4 text-[#5a3a22]">{user.joinDate}</td>
                  <td className="p-4 text-[#5a3a22]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#2a160b]">{user.booksRead}</span>
                      <span className="text-[#a49373] text-xs">({user.booksCompleted} selesai)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      user.status === 'Active' ? 'bg-emerald-100/50 text-emerald-800 border-emerald-300' : 'bg-[#f0e6d2] text-[#3a2012] border-[#d4c3a3]'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggleStatus(user.id)} className="p-2 text-[#a49373] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Ubah Status">
                        <UserX className="w-4 h-4" />
                      </button>
                      <button onClick={() => setSelectedUser(user)} className="p-2 text-[#a49373] hover:text-[#8a6d1c] hover:bg-primary/10 rounded-lg transition-colors" title="Detail">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <UsersIcon className="w-12 h-12 text-[#ebdcb8] mb-3" />
              <p className="text-[#8a6d1c] font-medium">Pengguna tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f9f6f0] rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
            <div className="p-6 text-center border-b border-[#ebdcb8] relative">
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 text-[#a49373] hover:bg-[#e6ddc5] rounded-full transition-colors">
                <UserX className="w-5 h-5 rotate-45" />
              </button>
              <img src={selectedUser.avatar} alt={selectedUser.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary/10 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#2a160b]">{selectedUser.name}</h3>
              <p className="text-[#8a6d1c]">{selectedUser.email}</p>
              <div className="mt-3 inline-flex px-3 py-1 bg-[#ebdcb8] text-[#5a3a22] rounded-full text-xs font-medium">
                Bergabung sejak {selectedUser.joinDate}
              </div>
            </div>
            <div className="p-6 bg-[#f0e6d2]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f9f6f0] p-4 rounded-xl border border-[#ebdcb8] text-center shadow-sm">
                  <div className="text-2xl font-bold text-[#8a6d1c]">{selectedUser.booksRead}</div>
                  <div className="text-xs text-[#8a6d1c] mt-1 font-medium">Buku Dibaca</div>
                </div>
                <div className="bg-[#f9f6f0] p-4 rounded-xl border border-[#ebdcb8] text-center shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">{selectedUser.booksCompleted}</div>
                  <div className="text-xs text-[#8a6d1c] mt-1 font-medium">Diselesaikan</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#ebdcb8]">
              <button onClick={() => setSelectedUser(null)} className="w-full py-2.5 bg-[#2a160b] text-[#f9f6f0] font-medium hover:bg-slate-800 rounded-xl transition-colors">Tutup Profil</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#2a160b] text-[#f9f6f0] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <UserX className="w-3 h-3 text-[#f9f6f0]" />
          </div>
          <span className="font-medium text-sm">Status pengguna berhasil diperbarui!</span>
        </div>
      )}
    </div>
  );
};
export default Users;
