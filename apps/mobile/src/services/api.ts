import { MOCK_CATEGORIES, MOCK_USER, BookItem } from '../data/mockData';
import { BookStorage } from './bookStorage';

// Konfigurasi URL API Backend MySQL
// Gunakan IP lokal jika ditest di perangkat fisik Android/iOS (misal: http://192.168.1.x:5000)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Helper fetch dengan timeout dan error handling aman
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch {
    // Fallback diam jika server MySQL offline
    return null;
  }
}

export const BooksApi = {
  /**
   * Mengambil daftar buku dari MySQL (dengan fallback ke data lokal yang tersinkronisasi)
   */
  async getBooks(category?: string, query?: string): Promise<BookItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (query) params.append('q', query);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const remoteData = await apiFetch<BookItem[]>(`/books${queryStr}`);

    if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
      return remoteData;
    }

    // Local / Storage fallback (tersinkronisasi dengan admin)
    const allBooks = BookStorage.getBooks();
    return allBooks.filter((b) => {
      const matchCat = !category || category === 'all' || b.category.toLowerCase() === category.toLowerCase();
      const matchQ = !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  },

  /**
   * Mengambil detail buku beserta chapter
   */
  async getBookById(id: string): Promise<BookItem | null> {
    const remoteBook = await apiFetch<BookItem>(`/books/${id}`);
    if (remoteBook) return remoteBook;

    return BookStorage.getBookById(id);
  },

  /**
   * Mengambil bab/chapter buku
   */
  async getBookChapters(bookId: string) {
    const remoteChapters = await apiFetch<any[]>(`/books/${bookId}/chapters`);
    return remoteChapters || [];
  },

  /**
   * Mengambil kategori dari MySQL
   */
  async getCategories() {
    const remoteCategories = await apiFetch<any[]>('/categories');
    if (remoteCategories && Array.isArray(remoteCategories) && remoteCategories.length > 0) {
      return remoteCategories;
    }
    return MOCK_CATEGORIES;
  },

  /**
   * Mengambil daftar buku favorit pengguna
   */
  async getFavorites(): Promise<string[]> {
    const remoteFavs = await apiFetch<string[]>('/favorites');
    if (remoteFavs && Array.isArray(remoteFavs)) {
      return remoteFavs;
    }
    return ['b1', 'b2', 'b3', 'b7', 'b9'];
  },

  /**
   * Toggle status favorit pada database MySQL
   */
  async toggleFavorite(bookId: string): Promise<boolean | null> {
    const res = await apiFetch<{ isFavorite: boolean }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    });
    return res ? res.isFavorite : null;
  },

  /**
   * Simpan riwayat & progres bacaan ke MySQL
   */
  async saveReadingProgress(bookId: string, currentChapter: number, progressPercentage: number) {
    return await apiFetch('/progress/update', {
      method: 'POST',
      body: JSON.stringify({
        bookId,
        currentChapter,
        progressPercentage,
      }),
    });
  },

  /**
   * Profil pengguna
   */
  async getProfile() {
    const profile = await apiFetch('/profile');
    return profile || MOCK_USER;
  }
};

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  school?: string;
  avatarUrl?: string;
  booksRead?: number;
  readingHours?: number;
  readingGoalBooks?: number;
}

// In-memory fallback untuk sesi jika backend offline
let currentSessionUser: UserProfile | null = null;
const registeredOfflineUsers: Array<{ user: UserProfile; password: string }> = [
  {
    user: {
      id: 'u1',
      username: 'andi_juara',
      name: 'Andi Pratama',
      school: 'Kelas 7 • SMP Juara Bangsa',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      booksRead: 18,
      readingHours: 42,
      readingGoalBooks: 25,
    },
    password: 'password123',
  },
];

export const AuthApi = {
  /**
   * Mendaftarkan akun siswa baru
   */
  async register(data: {
    username: string;
    fullName: string;
    email?: string;
    password: string;
    school?: string;
  }): Promise<{ success: boolean; user?: UserProfile; message: string }> {
    try {
      const res = await apiFetch<UserProfile>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (res && res.id) {
        currentSessionUser = res;
        return { success: true, user: res, message: 'Pendaftaran berhasil!' };
      }
    } catch {
      // Fallback ke penyimpanan lokal jika server offline
    }

    // Offline registration fallback
    const exists = registeredOfflineUsers.some(
      (u) => u.user.username.toLowerCase() === data.username.toLowerCase()
    );
    if (exists) {
      return { success: false, message: 'Username sudah terdaftar. Silakan pilih yang lain.' };
    }

    const newUser: UserProfile = {
      id: 'u_' + Date.now(),
      username: data.username.trim().toLowerCase(),
      name: data.fullName.trim(),
      email: data.email || `${data.username}@sekolah.id`,
      school: data.school || 'SMP Juara Bangsa',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      booksRead: 0,
      readingHours: 0,
      readingGoalBooks: 20,
    };

    registeredOfflineUsers.push({ user: newUser, password: data.password });
    currentSessionUser = newUser;

    return { success: true, user: newUser, message: 'Pendaftaran berhasil (Mode Offline)!' };
  },

  /**
   * Masuk / Login dengan username & password
   */
  async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user?: UserProfile; message: string }> {
    try {
      const res = await apiFetch<UserProfile>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: identifier, password }),
      });

      if (res && res.id) {
        currentSessionUser = res;
        return { success: true, user: res, message: 'Login berhasil!' };
      }
    } catch {
      // Lanjut ke fallback offline
    }

    // Offline login check
    const found = registeredOfflineUsers.find(
      (u) =>
        (u.user.username.toLowerCase() === identifier.toLowerCase() ||
          u.user.email?.toLowerCase() === identifier.toLowerCase()) &&
        u.password === password
    );

    if (found) {
      currentSessionUser = found.user;
      return { success: true, user: found.user, message: 'Login berhasil!' };
    }

    return {
      success: false,
      message: 'Username atau password salah. Coba lagi atau daftarkan akun baru.',
    };
  },

  /**
   * Keluar / Logout
   */
  async logout(): Promise<void> {
    currentSessionUser = null;
  },

  /**
   * Ambil data pengguna saat ini
   */
  getCurrentUser(): UserProfile | null {
    return currentSessionUser;
  },
};

