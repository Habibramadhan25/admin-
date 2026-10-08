import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, User, Lock, Mail, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !username || !password || !confirmPassword) {
      setError('Semua form harus diisi');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Simpan data pendaftaran ke localStorage
      localStorage.setItem('registered_siswa_name', name);
      localStorage.setItem('registered_siswa_nis', username);
      
      setSuccess(true);
      setTimeout(() => {
        // Redirect to login after successful registration
        navigate('/siswa/login');
      }, 2000); // Wait for animation
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f9f6f0] flex overflow-hidden">
      {/* Full screen loading animation when success */}
      {success && (
        <div className="fixed inset-0 bg-[#3a2012] z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="book-loader-wrapper mb-8">
            <div className="relative w-24 h-16">
              <div className="absolute inset-0 bg-white/20 rounded-lg shadow-xl"></div>
              <div className="absolute right-0 top-0 w-12 h-16 bg-[#f9f6f0] rounded-r-lg book-loader-page shadow-sm border-l border-[#ebdcb8]"></div>
              <div className="absolute right-0 top-0 w-12 h-16 bg-[#f9f6f0] rounded-r-lg book-loader-page shadow-sm border-l border-[#ebdcb8]"></div>
              <div className="absolute right-0 top-0 w-12 h-16 bg-[#f9f6f0] rounded-r-lg book-loader-page shadow-sm border-l border-[#ebdcb8]"></div>
            </div>
          </div>
          <h2 className="text-[#f9f6f0] text-2xl font-bold tracking-wide animate-pulse">Pendaftaran Berhasil!</h2>
          <p className="text-white/80 mt-2 font-medium">Mengarahkan ke halaman login...</p>
        </div>
      )}

      {/* Left side - Branding (Hidden on mobile) */}
      <div className={`hidden lg:flex lg:w-1/2 bg-[#2a160b] relative items-center justify-center transition-transform duration-700 ${success ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#d4c3a3] rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-[#8a6d1c]/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <div className="relative z-10 px-12 text-center text-[#f9f6f0] max-w-lg">
          <div className="w-20 h-20 bg-[#d4c3a3] rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/10 shadow-2xl">
            <BookOpen className="w-10 h-10 text-[#8a6d1c]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            BacaYuk <span className="text-[#8a6d1c]">Admin</span>
          </h1>
          <p className="text-lg text-[#d4c3a3] leading-relaxed">
            Bergabunglah dengan BacaYuk dan mulai petualangan membaca serta mengelola perpustakaan digital Anda.
          </p>
          
          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-left">
            <p className="text-[#d4c3a3] italic mb-4">"Buku adalah pesawat, kereta api, dan jalan. Mereka adalah tujuan, dan perjalanan. Mereka adalah rumah."</p>
            <p className="text-[#f9f6f0] font-medium text-sm">— Anna Quindlen</p>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 transition-transform duration-700 ${success ? 'translate-x-full' : 'translate-x-0'} overflow-y-auto`}>
        <div className="w-full max-w-md page-transition-enter-active py-8">
          <div className="mb-10 lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ebdcb8] text-[#8a6d1c] mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-[#2a160b]">BacaYuk</h1>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#2a160b] mb-2">Daftar Akun Baru</h2>
            <p className="text-[#8a6d1c]">
              Silakan lengkapi data berikut untuk mendaftar.
            </p>
          </div>



          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#2a160b] mb-2">
                Nama Lengkap
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a49373] group-focus-within:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3 border border-[#d4c3a3] rounded-xl bg-[#f0e6d2] focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-[#8a6d1c] outline-none transition-all text-[#2a160b]"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2a160b] mb-2">
                NIS / Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a49373] group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3 border border-[#d4c3a3] rounded-xl bg-[#f0e6d2] focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-[#8a6d1c] outline-none transition-all text-[#2a160b]"
                  placeholder="Masukkan NIS atau username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2a160b] mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a49373] group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-11 pr-4 py-3 border border-[#d4c3a3] rounded-xl bg-[#f0e6d2] focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-[#8a6d1c] outline-none transition-all text-[#2a160b]"
                  placeholder="Buat password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#2a160b] mb-2">Konfirmasi Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a49373] group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-11 pr-4 py-3 border border-[#d4c3a3] rounded-xl bg-[#f0e6d2] focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-[#8a6d1c] outline-none transition-all text-[#2a160b]"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-md shadow-primary/20 text-sm font-bold text-[#f9f6f0] bg-[#3a2012] hover:bg-[#2a160b] focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 mt-6"
            >
              {loading && !success ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : success ? (
                <span>Pendaftaran Berhasil!</span>
              ) : (
                <span>Daftar Akun</span>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm">
            <span className="text-[#5a3a22]">Sudah punya akun? </span>
            <Link to="/siswa/login" className="font-bold text-[#8a6d1c] hover:text-primary/80 transition-colors">
              Masuk di sini
            </Link>
          </div>

          <div className="mt-10 text-center text-xs text-[#8a6d1c] font-medium">
            &copy; {new Date().getFullYear()} BacaYuk Admin. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
