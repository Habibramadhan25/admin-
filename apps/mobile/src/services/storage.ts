/**
 * Layanan penyimpanan lokal per akun untuk memisahkan data setiap siswa
 */

const STORAGE_PREFIX = 'bacayuk_user_';

export const UserStorage = {
  /**
   * Mengambil daftar buku favorit khusus milik akun tertentu
   */
  getFavorites(userId?: string | null): string[] {
    if (!userId) return [];
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}_favorites`);
        if (raw) {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch (err) {
        console.warn('Gagal membaca storage favorit:', err);
      }
    }
    return [];
  },

  /**
   * Menyimpan daftar buku favorit khusus akun tertentu
   */
  saveFavorites(userId: string, favorites: string[]): void {
    if (!userId) return;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          `${STORAGE_PREFIX}${userId}_favorites`,
          JSON.stringify(favorites)
        );
      } catch (err) {
        console.warn('Gagal menyimpan storage favorit:', err);
      }
    }
  },

  /**
   * Toggle buku favorit untuk akun aktif
   */
  toggleFavorite(userId: string, bookId: string): string[] {
    const current = this.getFavorites(userId);
    const updated = current.includes(bookId)
      ? current.filter((id) => id !== bookId)
      : [...current, bookId];
    this.saveFavorites(userId, updated);
    return updated;
  },

  /**
   * Mengambil riwayat bacaan per akun
   */
  getReadingHistory(userId?: string | null): Array<{ bookId: string; progress: number; lastRead: string }> {
    if (!userId) return [];
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}_history`);
        if (raw) {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch (err) {
        console.warn('Gagal membaca riwayat:', err);
      }
    }
    return [];
  },

  /**
   * Menyimpan riwayat bacaan per akun
   */
  saveReadingProgress(userId: string, bookId: string, progress: number): void {
    if (!userId) return;
    const history = this.getReadingHistory(userId);
    const existingIndex = history.findIndex((h) => h.bookId === bookId);
    const entry = {
      bookId,
      progress,
      lastRead: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.unshift(entry);
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          `${STORAGE_PREFIX}${userId}_history`,
          JSON.stringify(history)
        );
      } catch (err) {}
    }
  },

  /**
   * Ambil sesi login aktif terakhir (jika ada)
   */
  getActiveSessionUser(): any | null {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('bacayuk_active_session_user');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Simpan sesi login aktif
   */
  setActiveSessionUser(user: any | null): void {
    if (typeof localStorage !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem('bacayuk_active_session_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('bacayuk_active_session_user');
        }
      } catch {}
    }
  },

  /**
   * Reset seluruh sesi saat logout
   */
  clearSession(): void {
    this.setActiveSessionUser(null);
  },

  /**
   * Cek cepat status autentikasi:
   * true bila ada sesi login aktif, false bila belum login
   */
  isAuthenticated(): boolean {
    return Boolean(this.getActiveSessionUser());
  },
};
