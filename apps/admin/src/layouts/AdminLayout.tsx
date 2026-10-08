import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  BookCopy, 
  PlusCircle, 
  Tags, 
  Users, 
  Star, 
  History, 
  Activity, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  Search,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatar, setAvatar] = useState(localStorage.getItem('bacayuk_admin_avatar') || '');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatar(localStorage.getItem('bacayuk_admin_avatar') || '');
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bacayuk_admin_auth');
    window.dispatchEvent(new Event('auth_changed'));
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Kelola Buku', path: '/books', icon: BookCopy },
    { name: 'Tambah Buku', path: '/books/add', icon: PlusCircle },
    { name: 'Kategori', path: '/categories', icon: Tags },
    { name: 'Pengguna', path: '/users', icon: Users },
    { name: 'Rating Buku', path: '/ratings', icon: Star },
    { name: 'Riwayat Bacaan', path: '/history', icon: History },
    { name: 'Activity Log', path: '/activity', icon: Activity },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f0e6d2] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#2a160b]/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#f9f6f0] border-r border-[#d4c3a3] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-[#d4c3a3]">
            <div className="flex items-center gap-2 text-[#3a2012] font-black font-serif text-2xl">
              <img src="/admin/logo.png" alt="BacaYuk Logo" className="w-9 h-9 object-contain" />
              <span>BacaYuk</span>
            </div>
            <button 
              className="ml-auto lg:hidden text-[#8a6d1c] hover:text-[#3a2012]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-colors ${
                    isActive 
                      ? 'bg-[#ebdcb8] text-[#8a6d1c] border border-[#d4c3a3]' 
                      : 'text-[#5a3a22] hover:bg-[#e6ddc5] hover:text-[#2a160b]'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-[#d4c3a3]">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg font-bold text-[#5a3a22] hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#f9f6f0] border-b border-[#d4c3a3] flex items-center justify-between px-4 lg:px-8 z-10 shrink-0 relative shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[#8a6d1c] hover:text-[#3a2012]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a49373]" />
              <input 
                type="text" 
                placeholder="Cari sesuatu..." 
                className="w-full pl-10 pr-4 py-2 bg-[#ebdcb8] border-transparent rounded-full text-sm focus:bg-[#f9f6f0] focus:border-[#d4c3a3] focus:ring-2 focus:ring-[#8a6d1c]/20 outline-none transition-all placeholder-[#a49373] text-[#3a2012]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 relative">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-[#3a2012]">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-xs font-bold text-[#8a6d1c]">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`relative p-2 text-[#5a3a22] hover:bg-[#ebdcb8] rounded-full transition-colors ${showNotifications ? 'bg-[#ebdcb8]' : ''}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 bg-[#f9f6f0] rounded-2xl shadow-xl border border-[#d4c3a3] z-50 overflow-hidden transform origin-top-right animate-in fade-in scale-95 duration-200">
                    <div className="p-4 border-b border-[#d4c3a3] bg-[#ebdcb8]/50 flex justify-between items-center">
                      <h3 className="font-bold text-[#2a160b]">Notifikasi</h3>
                      <button className="text-xs text-[#8a6d1c] font-bold hover:underline">Tandai semua dibaca</button>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      <div className="p-4 border-b border-[#d4c3a3] hover:bg-[#ebdcb8]/30 transition-colors cursor-pointer flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ebdcb8] text-[#8a6d1c] flex items-center justify-center shrink-0 border border-[#d4c3a3]">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-[#3a2012]"><span className="font-bold">Budi Santoso</span> mendaftar sebagai pengguna baru.</p>
                          <p className="text-xs text-[#a49373] mt-1 font-bold">2 menit yang lalu</p>
                        </div>
                      </div>
                      <div className="p-4 border-b border-[#d4c3a3] hover:bg-[#ebdcb8]/30 transition-colors cursor-pointer flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ebdcb8] text-[#8a6d1c] flex items-center justify-center shrink-0 border border-[#d4c3a3]">
                          <Star className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-[#3a2012]"><span className="font-bold">Siti Aminah</span> memberikan ulasan 5 bintang pada buku "Laskar Pelangi".</p>
                          <p className="text-xs text-[#a49373] mt-1 font-bold">1 jam yang lalu</p>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-[#ebdcb8]/30 transition-colors cursor-pointer flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ebdcb8] text-[#8a6d1c] flex items-center justify-center shrink-0 border border-[#d4c3a3]">
                          <BookCopy className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-[#3a2012]">Laporan mingguan BacaYuk telah berhasil dibuat.</p>
                          <p className="text-xs text-[#a49373] mt-1 font-bold">1 hari yang lalu</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-[#d4c3a3] text-center bg-[#ebdcb8]">
                      <button className="text-sm text-[#3a2012] font-bold hover:text-[#5a3a22] transition-colors">Lihat Semua Notifikasi</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className={`focus:outline-none rounded-full ring-2 ring-transparent transition-all ${showProfileMenu ? 'ring-[#8a6d1c]/50' : 'hover:ring-[#8a6d1c]/30'}`}
              >
                {avatar ? (
                  <img src={avatar} alt="Admin" className="h-9 w-9 rounded-full object-cover shadow-sm border border-[#d4c3a3]" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[#ebdcb8] flex items-center justify-center text-[#8a6d1c] font-bold shadow-sm border border-[#d4c3a3]">
                    A
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-[#f9f6f0] rounded-xl shadow-xl border border-[#d4c3a3] z-50 overflow-hidden transform origin-top-right animate-in fade-in scale-95 duration-200">
                    <div className="p-4 border-b border-[#d4c3a3] bg-[#ebdcb8]">
                      <p className="font-bold text-[#2a160b] truncate">Administrator BacaYuk</p>
                      <p className="text-xs text-[#8a6d1c] font-bold truncate mt-0.5">admin@bacayuk.com</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[#5a3a22] hover:bg-[#ebdcb8] hover:text-[#3a2012] font-bold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" /> Pengaturan Akun
                      </button>
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/activity');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[#5a3a22] hover:bg-[#ebdcb8] hover:text-[#3a2012] font-bold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Activity className="w-4 h-4" /> Log Aktivitas
                      </button>
                    </div>
                    <div className="p-2 border-t border-[#d4c3a3]">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 font-bold"
                      >
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto page-transition-enter-active">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
