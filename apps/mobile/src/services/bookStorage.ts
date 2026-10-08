import { useState, useEffect } from 'react';
import { MOCK_BOOKS, BookItem } from '../data/mockData';

const STORAGE_KEY = 'bacayuk_books';

/**
 * Normalisasi data buku dari format Admin / LocalStorage ke format BookItem Mobile
 */
export function mapRawToBookItem(raw: any): BookItem {
  if (!raw) return MOCK_BOOKS[0];

  const defaultCover =
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';

  const chapters =
    Array.isArray(raw.chapters) && raw.chapters.length > 0
      ? raw.chapters
      : [
          {
            id: 'c1',
            title: `1. ${raw.title || 'Awal Bacaan'}`,
            content: `${
              raw.description || raw.synopsis || 'Selamat membaca buku ini.'
            }\n\nBab pertama dari buku ini dimulai di sini. Nikmati petualangan membaca Anda bersama perpustakaan digital BacaYuk! Lembaran demi lembaran membuka cakrawala pengetahuan yang lebih luas.`,
          },
          {
            id: 'c2',
            title: '2. Bab Lanjutan',
            content:
              'Setiap halaman memberikan inspirasi baru untuk terus belajar dan memahami sudut pandang kehidupan yang berharga.',
          },
        ];

  return {
    id: String(raw.id),
    title: raw.title || 'Tanpa Judul',
    author: raw.author || 'Anonim',
    coverUrl: raw.coverUrl || defaultCover,
    category: raw.category || 'Umum',
    rating: typeof raw.rating === 'number' && raw.rating > 0 ? raw.rating : 4.8,
    reviewsCount: raw.readers || raw.reviewsCount || 120,
    language: raw.language || 'Indonesia',
    totalPages: raw.totalPages || 180,
    publisher: raw.publisher || 'Penerbit BacaYuk',
    publishedYear:
      raw.publishedYear ||
      (typeof raw.year === 'number' ? raw.year : new Date().getFullYear()),
    synopsis:
      raw.synopsis ||
      raw.description ||
      'Sinopsis lengkap buku ini belum dimasukkan oleh pengelola perpustakaan.',
    progressPercentage: raw.progressPercentage || 0,
    lastReadTime: raw.lastReadTime,
    isFavorite: Boolean(raw.isFavorite),
    isDownloaded: Boolean(raw.isDownloaded),
    chapters,
    fileName: raw.fileName,
    fileSize: raw.fileSize,
    fileType: raw.fileType,
    fileUrl: raw.fileUrl,
  };
}

export const BookStorage = {
  /**
   * Mengambil semua daftar buku (dari localStorage yang terhubung dengan Admin)
   */
  getBooks(): BookItem[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter hanya buku yang dipublikasikan jika memiliki properti status
            const filtered = parsed.filter(
              (b: any) => !b.status || b.status === 'Published'
            );
            return filtered.map(mapRawToBookItem);
          }
        } else {
          // Jika belum ada data di localStorage, inisialisasi dengan data awal MOCK_BOOKS
          localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_BOOKS));
        }
      } catch (err) {
        console.warn('Gagal membaca buku dari storage:', err);
      }
    }
    return MOCK_BOOKS;
  },

  /**
   * Mengambil detail satu buku berdasarkan ID
   */
  getBookById(id: string): BookItem | null {
    const all = this.getBooks();
    return all.find((b) => String(b.id) === String(id)) || null;
  },
};

/**
 * Hook reaktif agar halaman otomatis update saat admin menambahkan / menghapus buku
 */
export function useBooks() {
  const [books, setBooks] = useState<BookItem[]>(() => BookStorage.getBooks());

  useEffect(() => {
    const refresh = () => {
      setBooks(BookStorage.getBooks());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', refresh);
      window.addEventListener('bacayuk_books_updated', refresh);
      window.addEventListener('focus', refresh);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', refresh);
        window.removeEventListener('bacayuk_books_updated', refresh);
        window.removeEventListener('focus', refresh);
      }
    };
  }, []);

  return { books, refreshBooks: () => setBooks(BookStorage.getBooks()) };
}
