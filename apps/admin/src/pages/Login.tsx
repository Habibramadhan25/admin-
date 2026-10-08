import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  Bookmark,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError('Username dan kata sandi wajib diisi');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Izinkan akun admin atau demo
      if (
        (trimmedUser === 'admin' && password === 'admin123') ||
        (trimmedUser === 'siswa' && password === 'siswa123')
      ) {
        localStorage.setItem('bacayuk_admin_auth', 'true');
        localStorage.setItem(
          'bacayuk_admin_user',
          JSON.stringify({
            name: trimmedUser === 'admin' ? 'Administrator' : 'Pengelola Siswa',
            role: 'Admin Perpustakaan',
            username: trimmedUser,
          })
        );
        window.dispatchEvent(new Event('auth_changed'));
        navigate('/');
      } else {
        setError('Username atau kata sandi salah. (Gunakan admin / admin123)');
        setLoading(false);
      }
    }, 900);
  };

  const handleDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('bacayuk_admin_auth', 'true');
      localStorage.setItem(
        'bacayuk_admin_user',
        JSON.stringify({
          name: 'Administrator',
          role: 'Admin Perpustakaan',
          username: 'admin',
        })
      );
      window.dispatchEvent(new Event('auth_changed'));
      navigate('/');
    }, 600);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans-classic select-none"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 40% 30%, rgba(255, 240, 220, 0.12) 0%, rgba(28, 12, 6, 0.65) 100%), url("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=2400")',
      }}
    >
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* ========================================================= */}
        {/* KOLOM KIRI: Lembaran Kertas Antik Klasik (Parchment Paper) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 relative group">
          {/* Bayangan halus lembaran kertas di atas meja kayu */}
          <div className="absolute inset-0 bg-[#1c0c06]/30 rounded-3xl transform translate-x-1.5 translate-y-2.5 blur-md" />

          <div className="relative bg-[#FAF6EE] text-[#3B1710] p-6 sm:p-9 lg:p-10 rounded-3xl shadow-2xl border border-[#E8DFC9] flex flex-col justify-between overflow-hidden">
            {/* Tekstur cahaya lembut kertas */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-[#EFE4D0]/40" />

            {/* Bagian Atas: Logo, Badge, Headline, Quote */}
            <div className="relative z-10">
              {/* Brand Logo & Wordmark */}
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="/admin/logo.png"
                  alt="BacaYuk Logo"
                  style={{ width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px' }}
                  className="w-12 h-12 object-contain drop-shadow shrink-0"
                />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#3B1710] font-serif-classic leading-tight">
                    BacaYuk
                  </h1>
                  <p className="text-[11px] font-semibold text-[#8A6D1C] tracking-wide">
                    Perpustakaan Digital Pelajar
                  </p>
                </div>
              </div>

              {/* Stitched Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFE4D0] text-[#6E4F28] rounded-full text-xs font-bold border border-[#D5C2A5] shadow-inner mb-5">
                <BookOpen className="w-3.5 h-3.5 text-[#8A6D1C]" />
                <span className="tracking-wide">GERAKAN LITERASI SEKOLAH</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#2C1810] font-serif-classic leading-[1.25] mb-5 tracking-tight">
                Membuka cakrawala ilmu,<br />
                satu halaman setiap hari.
              </h2>

              {/* Golden Framed Quote Card */}
              <div className="bg-[#F5ECDC]/85 border-2 border-[#D4AF37]/50 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm relative">
                <p className="font-serif-classic italic text-[#4A2E1B] text-sm sm:text-[15px] leading-relaxed">
                  “Buku adalah lentera yang tak pernah padam di tengah pekatnya
                  ketidaktahuan. Setiap kata yang dibaca adalah langkah kecil
                  menuju cita-cita luhur.”
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-[#8A6D1C] tracking-wide">
                  <span className="w-5 h-[1.5px] bg-[#8A6D1C]" />
                  <span>Pustaka Juara BacaYuk</span>
                </div>
              </div>
            </div>

            {/* Bagian Bawah: 3 Feature Rows */}
            <div className="relative z-10 space-y-4 pt-2 border-t border-[#E8DFC9]/70">
              {/* Feature 1 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EFE4D0] border border-[#D5C2A5] flex items-center justify-center shrink-0 shadow-sm text-lg">
                  📚
                </div>
                <div className="text-sm">
                  <span className="font-bold text-[#2C1810]">
                    1.200+ Buku Terkurasi
                  </span>{' '}
                  <span className="text-[#6D5A47]">
                    — Sastra, fiksi, cerita rakyat & ensiklopedia anak.
                  </span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EFE4D0] border border-[#D5C2A5] flex items-center justify-center shrink-0 shadow-sm text-lg">
                  📝
                </div>
                <div className="text-sm">
                  <span className="font-bold text-[#2C1810]">
                    Jurnal Baca & Streak
                  </span>{' '}
                  <span className="text-[#6D5A47]">
                    — Catat jam membaca harian dan progres bacaan.
                  </span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EFE4D0] border border-[#D5C2A5] flex items-center justify-center shrink-0 shadow-sm text-lg">
                  🏅
                </div>
                <div className="text-sm">
                  <span className="font-bold text-[#2C1810]">
                    Lencana Kehormatan
                  </span>{' '}
                  <span className="text-[#6D5A47]">
                    — Kumpulkan poin literasi untuk sekolahmu.
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Paper Curl Corner (sudut lipatan kertas di kanan bawah) */}
            <div className="paper-curl-corner" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* KOLOM KANAN: Kartu Form Tumpukan Kertas (Paper Stack)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 relative max-w-md w-full mx-auto flex flex-col justify-center">
          {/* Efek tumpukan kertas fisik (Paper stack rotation) */}
          <div className="absolute inset-0 bg-[#EFE8DC] rounded-3xl transform rotate-2 shadow-xl border border-[#D5C2A5]" />
          <div className="absolute inset-0 bg-[#E6DBCA] rounded-3xl transform -rotate-1.5 shadow-lg border border-[#D5C2A5]" />

          {/* Kartu Formulir Utama */}
          <div className="relative bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl shadow-2xl border border-[#E8DFC9] flex flex-col justify-between z-10">
            <div>
              {/* Header Tab Pill (Persis Mockup) */}
              <div className="bg-[#EFE8DC] p-1.5 rounded-2xl flex items-center mb-5 border border-[#DCD0BA]">
                <div className="w-full py-2 px-3.5 bg-white rounded-xl shadow-sm flex items-center justify-center gap-2 font-bold text-xs sm:text-sm text-[#3B1710]">
                  <ArrowRight className="w-4 h-4 text-[#8A6D1C]" />
                  <span>Masuk</span>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
                {error && (
                  <div className="p-2.5 bg-[#F7E4DE] border border-[#E6BDB1] text-[#8C2F1D] text-xs font-semibold rounded-xl flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Field 1: Username atau Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#3B1710] mb-1">
                    Username atau Email
                  </label>
                  <div className="relative flex items-center bg-[#EFE8DC]/80 border border-[#D5C2A5] rounded-xl focus-within:border-[#8A6D1C] focus-within:bg-[#FAF6EE] focus-within:ring-2 focus-within:ring-[#8A6D1C]/20 transition-all">
                    <div className="absolute left-3.5 flex items-center pointer-events-none text-[#8A6D1C]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full py-2.5 sm:py-3 pl-10 pr-4 bg-transparent text-[#3B1710] font-medium placeholder-[#9E8E75] outline-none text-xs sm:text-sm"
                      placeholder="Masukkan username (cth: admin)"
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                {/* Field 2: Kata Sandi */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#3B1710] mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative flex items-center bg-[#EFE8DC]/80 border border-[#D5C2A5] rounded-xl focus-within:border-[#8A6D1C] focus-within:bg-[#FAF6EE] focus-within:ring-2 focus-within:ring-[#8A6D1C]/20 transition-all">
                    <div className="absolute left-3.5 flex items-center pointer-events-none text-[#8A6D1C]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-2.5 sm:py-3 pl-10 pr-10 bg-transparent text-[#3B1710] font-medium placeholder-[#9E8E75] outline-none text-xs sm:text-sm"
                      placeholder="Masukkan kata sandi akun"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#8A6D1C] hover:text-[#5A3A22] p-1 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tombol Masuk Utama (Mahogany Leather Button) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 bg-[#3B1710] hover:bg-[#280F0A] active:translate-y-0.5 text-[#FAF7F2] font-bold rounded-xl shadow-[0_5px_15px_rgba(59,23,16,0.3)] transition-all flex items-center justify-center gap-2 text-sm sm:text-[15px] cursor-pointer disabled:opacity-70 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin text-[#E3CE9E]" />
                      <span>Memverifikasi Akses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Perpustakaan</span>
                      <ArrowRight className="w-4 h-4 text-[#E3CE9E]" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Access Card at Bottom (Akses Cepat Demo) */}
            <div className="mt-5 pt-4 border-t border-[#E8DFC9] bg-[#EFE8DC]/70 border border-[#DCD0BA] rounded-xl p-3.5 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-md bg-[#E3CE9E]/60 flex items-center justify-center text-[#8A6D1C]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-[#3B1710]">
                  Akses Cepat Siswa / Admin (Demo)
                </h4>
              </div>
              <p className="text-[11px] text-[#7A6A5A] mb-3 leading-relaxed">
                Ingin menguji tampilan &amp; koleksi tanpa mendaftar?
              </p>

              <button
                type="button"
                onClick={handleDemo}
                disabled={loading}
                className="w-full py-2.5 px-3 bg-[#FAF7F2] hover:bg-white border border-[#D5C2A5] rounded-xl text-[#3B1710] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>👆</span>
                <span>Gunakan Akun Uji Coba Admin</span>
              </button>

              <div className="mt-2 text-center text-[10.5px] font-medium text-[#8A6D1C]">
                Username: <code className="font-bold">admin</code> / Sandi:{' '}
                <code className="font-bold">admin123</code>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
