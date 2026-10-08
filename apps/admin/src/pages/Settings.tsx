import { useState, useRef } from 'react';
import { Save, User, Lock, Bell, Globe, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profil');
  const [showToast, setShowToast] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(localStorage.getItem('bacayuk_admin_avatar'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (profileImage) {
      localStorage.setItem('bacayuk_admin_avatar', profileImage);
      window.dispatchEvent(new Event('avatarUpdated'));
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profil', label: 'Profil Admin', icon: User },
    { id: 'keamanan', label: 'Keamanan Akun', icon: Lock },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
    { id: 'regional', label: 'Regional & Bahasa', icon: Globe },
  ];

  return (
    <div className="space-y-6 max-w-5xl relative">
      <div>
        <h1 className="text-2xl font-bold text-[#2a160b]">Pengaturan</h1>
        <p className="text-[#8a6d1c]">Kelola preferensi dan profil akun administrator</p>
      </div>

      <div className="bg-[#f9f6f0] rounded-xl shadow-sm border border-[#d4c3a3] overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[500px]">
          <div className="w-full md:w-64 bg-[#f0e6d2] border-r border-[#d4c3a3] p-4">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-[#ebdcb8] text-[#8a6d1c]' 
                      : 'text-[#5a3a22] hover:bg-[#d4c3a3]'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex-1 p-6 md:p-8">
            {activeTab === 'profil' && (
              <>
                <h2 className="text-lg font-bold text-[#2a160b] mb-6">Informasi Profil</h2>
                
                <form className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#ebdcb8] border-2 border-primary/20 rounded-full flex items-center justify-center text-[#8a6d1c] font-bold text-3xl overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        "A"
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 border border-[#c2b192] rounded-lg text-sm font-medium hover:bg-[#ebdcb8] hover:text-[#8a6d1c] transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" /> Ubah Foto Profil
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#3a2012] mb-2">Nama Lengkap</label>
                      <input type="text" defaultValue="Administrator BacaYuk" className="w-full px-4 py-2.5 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3a2012] mb-2">Email Publik</label>
                      <input type="email" defaultValue="admin@bacayuk.com" className="w-full px-4 py-2.5 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3a2012] mb-2">Bio / Keterangan Singkat</label>
                    <textarea rows={3} className="w-full px-4 py-2.5 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors" defaultValue="Saya adalah admin utama yang mengurus seluruh konten BacaYuk."></textarea>
                  </div>

                  <div className="pt-6 border-t border-[#d4c3a3] flex justify-end">
                    <button type="button" onClick={handleSave} className="flex items-center gap-2 bg-[#3a2012] text-[#f9f6f0] px-6 py-2.5 rounded-lg hover:bg-[#2a160b] transition-colors font-medium shadow-sm">
                      <Save className="w-4 h-4" /> Simpan Perubahan
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'keamanan' && (
              <>
                <h2 className="text-lg font-bold text-[#2a160b] mb-6">Keamanan Akun</h2>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#3a2012] mb-2">Password Saat Ini</label>
                    <input type="password" placeholder="Masukkan password saat ini" className="w-full md:w-2/3 px-4 py-2.5 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a2012] mb-2">Password Baru</label>
                    <input type="password" placeholder="Minimal 8 karakter" className="w-full md:w-2/3 px-4 py-2.5 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a2012] mb-2">Konfirmasi Password Baru</label>
                    <input type="password" placeholder="Ulangi password baru" className="w-full md:w-2/3 px-4 py-2.5 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors" />
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex items-center justify-between p-4 bg-[#f0e6d2] border border-[#d4c3a3] rounded-xl">
                      <div>
                        <p className="font-bold text-[#2a160b]">Autentikasi Dua Faktor (2FA)</p>
                        <p className="text-sm text-[#8a6d1c]">Tingkatkan keamanan akun dengan verifikasi dua langkah.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#d4c3a3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3a2012]"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#d4c3a3] flex justify-end">
                    <button type="button" onClick={handleSave} className="flex items-center gap-2 bg-[#3a2012] text-[#f9f6f0] px-6 py-2.5 rounded-lg hover:bg-[#2a160b] transition-colors font-medium shadow-sm">
                      <Save className="w-4 h-4" /> Perbarui Keamanan
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'notifikasi' && (
              <>
                <h2 className="text-lg font-bold text-[#2a160b] mb-6">Preferensi Notifikasi</h2>
                
                <div className="space-y-4">
                  {[
                    { title: 'Email Aktivitas Pengguna Baru', desc: 'Dapatkan email saat ada pengguna baru yang mendaftar' },
                    { title: 'Pemberitahuan Ulasan Buku', desc: 'Notifikasi saat ada ulasan atau rating buku baru' },
                    { title: 'Peringatan Sistem & Keamanan', desc: 'Email peringatan jika ada aktivitas login yang mencurigakan' },
                    { title: 'Laporan Mingguan', desc: 'Terima ringkasan aktivitas dan metrik platform setiap minggu' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between p-4 bg-[#f9f6f0] border border-[#d4c3a3] rounded-xl hover:border-primary/30 transition-colors">
                      <div className="pr-4">
                        <p className="font-bold text-[#2a160b] mb-1">{item.title}</p>
                        <p className="text-sm text-[#8a6d1c] leading-relaxed">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" defaultChecked={i % 2 === 0} className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#d4c3a3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3a2012]"></div>
                      </label>
                    </div>
                  ))}

                  <div className="pt-6 mt-6 border-t border-[#d4c3a3] flex justify-end">
                    <button type="button" onClick={handleSave} className="flex items-center gap-2 bg-[#3a2012] text-[#f9f6f0] px-6 py-2.5 rounded-lg hover:bg-[#2a160b] transition-colors font-medium shadow-sm">
                      <Save className="w-4 h-4" /> Simpan Preferensi
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'regional' && (
              <>
                <h2 className="text-lg font-bold text-[#2a160b] mb-6">Regional & Bahasa</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#3a2012] mb-2">Bahasa Sistem</label>
                      <select className="w-full px-4 py-2.5 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors bg-[#f9f6f0]">
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English (US)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3a2012] mb-2">Zona Waktu</label>
                      <select className="w-full px-4 py-2.5 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors bg-[#f9f6f0]">
                        <option value="WIB">WIB (Waktu Indonesia Barat)</option>
                        <option value="WITA">WITA (Waktu Indonesia Tengah)</option>
                        <option value="WIT">WIT (Waktu Indonesia Timur)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3a2012] mb-2">Format Tanggal</label>
                    <div className="space-y-3 mt-3">
                      <label className="flex items-center gap-3 p-3 border border-[#d4c3a3] rounded-lg hover:bg-[#ebdcb8] cursor-pointer transition-colors">
                        <input type="radio" name="dateFormat" defaultChecked className="w-4 h-4 text-[#8a6d1c] focus:ring-primary" />
                        <span className="text-[#3a2012] text-sm">DD/MM/YYYY (contoh: 31/12/2026)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-[#d4c3a3] rounded-lg hover:bg-[#ebdcb8] cursor-pointer transition-colors">
                        <input type="radio" name="dateFormat" className="w-4 h-4 text-[#8a6d1c] focus:ring-primary" />
                        <span className="text-[#3a2012] text-sm">MM/DD/YYYY (contoh: 12/31/2026)</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#d4c3a3] flex justify-end">
                    <button type="button" onClick={handleSave} className="flex items-center gap-2 bg-[#3a2012] text-[#f9f6f0] px-6 py-2.5 rounded-lg hover:bg-[#2a160b] transition-colors font-medium shadow-sm">
                      <Save className="w-4 h-4" /> Simpan Pengaturan
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#2a160b] text-[#f9f6f0] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">Perubahan berhasil disimpan!</span>
        </div>
      )}
    </div>
  );
};
export default Settings;
