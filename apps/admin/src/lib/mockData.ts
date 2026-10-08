export interface BookChapter {
  id: string;
  title: string;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number;
  publisher: string;
  isbn: string;
  status: 'Published' | 'Draft';
  rating: number;
  readers: number;
  dateAdded: string;
  coverUrl: string;
  description: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  chapters?: BookChapter[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  joinDate: string;
  booksRead: number;
  booksCompleted: number;
  status: 'Active' | 'Inactive';
  avatar: string;
}

export interface Category {
  id: string;
  name: string;
  bookCount: number;
}

export interface HistoryItem {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  coverUrl: string;
  progress: number;
  currentPage: number;
  totalPages: number;
  lastRead: string;
  status: 'Sedang Dibaca' | 'Selesai' | 'Belum Selesai';
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  status: 'Success' | 'Warning' | 'Error';
}

export const initialBooks: Book[] = [
  {
    id: 'b1',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    category: 'Fiksi',
    year: 1980,
    publisher: 'Hasta Mitra',
    isbn: '9789799731234',
    status: 'Published',
    rating: 4.8,
    readers: 1250,
    dateAdded: '2023-01-15T10:00:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300',
    description: 'Bumi Manusia adalah buku pertama dari Tetralogi Buru karya Pramoedya Ananta Toer.'
  },
  {
    id: 'b2',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    category: 'Fiksi',
    year: 2005,
    publisher: 'Bentang Pustaka',
    isbn: '9789793062792',
    status: 'Published',
    rating: 4.9,
    readers: 3400,
    dateAdded: '2023-02-20T14:30:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
    description: 'Buku pertama dari Tetralogi Laskar Pelangi, menceritakan kisah 10 anak Belitung.'
  },
  {
    id: 'b3',
    title: 'Sapiens: Riwayat Singkat Umat Manusia',
    author: 'Yuval Noah Harari',
    category: 'Sejarah',
    year: 2011,
    publisher: 'KPG',
    isbn: '9786024242784',
    status: 'Published',
    rating: 4.7,
    readers: 890,
    dateAdded: '2023-05-10T09:15:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=300',
    description: 'Eksplorasi sejarah umat manusia dari zaman batu hingga abad ke-21.'
  },
  {
    id: 'b4',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Nonfiksi',
    year: 2018,
    publisher: 'Gramedia',
    isbn: '9786020633176',
    status: 'Published',
    rating: 4.9,
    readers: 5200,
    dateAdded: '2023-08-05T11:45:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300',
    description: 'Cara mudah dan terbukti untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk.'
  },
  {
    id: 'b5',
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    category: 'Nonfiksi',
    year: 2018,
    publisher: 'Penerbit Buku Kompas',
    isbn: '9786024125186',
    status: 'Published',
    rating: 4.8,
    readers: 2100,
    dateAdded: '2023-11-12T16:20:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=300',
    description: 'Pengantar filsafat Stoa (Stoikisme) untuk kehidupan masa kini yang lebih damai.'
  },
  {
    id: 'b6',
    title: 'Cantik Itu Luka',
    author: 'Eka Kurniawan',
    category: 'Fiksi',
    year: 2002,
    publisher: 'Gramedia Pustaka Utama',
    isbn: '9786020312583',
    status: 'Published',
    rating: 4.6,
    readers: 1750,
    dateAdded: '2024-01-20T08:00:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=300',
    description: 'Novel epik pemenang berbagai penghargaan tentang sejarah kolonialisme.'
  },
  {
    id: 'b7',
    title: 'Pulang',
    author: 'Tere Liye',
    category: 'Novel',
    year: 2015,
    publisher: 'Republika',
    isbn: '9786020822129',
    status: 'Published',
    rating: 4.8,
    readers: 4500,
    dateAdded: '2024-02-10T10:00:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300',
    description: 'Kisah tentang perjalanan menemukan arti sejati dari pulang.'
  },
  {
    id: 'b8',
    title: 'Gadis Kretek',
    author: 'Ratih Kumala',
    category: 'Fiksi',
    year: 2012,
    publisher: 'Gramedia',
    isbn: '9789792281415',
    status: 'Published',
    rating: 4.7,
    readers: 3100,
    dateAdded: '2024-02-15T09:00:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1524578964522-6321288b83ac?auto=format&fit=crop&q=80&w=300',
    description: 'Menelusuri jejak industri kretek Nusantara lewat kisah cinta masa lalu.'
  },
  {
    id: 'b9',
    title: 'Hujan',
    author: 'Tere Liye',
    category: 'Novel',
    year: 2016,
    publisher: 'Gramedia',
    isbn: '9786020324784',
    status: 'Published',
    rating: 4.6,
    readers: 5600,
    dateAdded: '2024-03-01T14:00:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=300',
    description: 'Tentang persahabatan, cinta, melupakan, dan hujan.'
  },
  {
    id: 'b10',
    title: 'Dunia Sophie',
    author: 'Jostein Gaarder',
    category: 'Pendidikan',
    year: 1991,
    publisher: 'Mizan',
    isbn: '9789794335550',
    status: 'Published',
    rating: 4.8,
    readers: 2900,
    dateAdded: '2024-03-10T11:30:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=300',
    description: 'Sebuah novel sejarah filsafat yang dibalut dalam cerita misteri.'
  },
  {
    id: 'b11',
    title: 'Tetralogi Buru: Anak Semua Bangsa',
    author: 'Pramoedya Ananta Toer',
    category: 'Sejarah',
    year: 1980,
    publisher: 'Hasta Mitra',
    isbn: '9789799731241',
    status: 'Published',
    rating: 4.9,
    readers: 1800,
    dateAdded: '2024-03-20T08:15:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?auto=format&fit=crop&q=80&w=300',
    description: 'Lanjutan dari Bumi Manusia yang mengeksplorasi perlawanan terhadap kolonialisme.'
  },
  {
    id: 'b12',
    title: 'Ronggeng Dukuh Paruk',
    author: 'Ahmad Tohari',
    category: 'Fiksi',
    year: 1982,
    publisher: 'Gramedia',
    isbn: '9789792277289',
    status: 'Published',
    rating: 4.7,
    readers: 2200,
    dateAdded: '2024-04-05T13:45:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
    description: 'Tragedi kehidupan penari ronggeng di tengah pergolakan sosial-politik.'
  },
  {
    id: 'b13',
    title: 'Negeri 5 Menara',
    author: 'A. Fuadi',
    category: 'Novel',
    year: 2009,
    publisher: 'Gramedia',
    isbn: '9789792248616',
    status: 'Published',
    rating: 4.6,
    readers: 4100,
    dateAdded: '2024-04-12T10:20:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=300',
    description: 'Man jadda wajada. Siapa yang bersungguh-sungguh, pasti berhasil.'
  },
  {
    id: 'b14',
    title: 'Garis Waktu',
    author: 'Fiersa Besari',
    category: 'Fiksi',
    year: 2016,
    publisher: 'Mediakita',
    isbn: '9789797945251',
    status: 'Published',
    rating: 4.5,
    readers: 3800,
    dateAdded: '2024-04-18T16:00:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b62f40c4?auto=format&fit=crop&q=80&w=300',
    description: 'Sebuah perjalanan menghapus luka.'
  },
  {
    id: 'b15',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'Nonfiksi',
    year: 2020,
    publisher: 'Penerbit Baca',
    isbn: '9786026486586',
    status: 'Published',
    rating: 4.8,
    readers: 6700,
    dateAdded: '2024-05-02T09:30:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=300',
    description: 'Pelajaran abadi mengenai kekayaan, ketamakan, dan kebahagiaan.'
  },
  {
    id: 'b16',
    title: 'Perahu Kertas',
    author: 'Dee Lestari',
    category: 'Novel',
    year: 2009,
    publisher: 'Bentang Pustaka',
    isbn: '9789791227780',
    status: 'Published',
    rating: 4.7,
    readers: 4200,
    dateAdded: '2024-05-15T14:15:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&q=80&w=300',
    description: 'Kisah tentang impian, persahabatan, dan cinta yang tak terduga.'
  },
  {
    id: 'b17',
    title: 'Supernova: Kesatria, Putri, dan Bintang Jatuh',
    author: 'Dee Lestari',
    category: 'Fiksi',
    year: 2001,
    publisher: 'Truedee Books',
    isbn: '9789799625700',
    status: 'Published',
    rating: 4.6,
    readers: 2500,
    dateAdded: '2024-05-20T11:00:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1505682614136-0a12f9f7beea?auto=format&fit=crop&q=80&w=300',
    description: 'Bagian pertama dari seri Supernova yang menggabungkan romansa dan sains.'
  },
  {
    id: 'b18',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    category: 'Sejarah',
    year: 2017,
    publisher: 'Kepustakaan Populer Gramedia',
    isbn: '9786024246942',
    status: 'Published',
    rating: 4.9,
    readers: 8100,
    dateAdded: '2024-06-05T08:30:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&q=80&w=300',
    description: 'Menyuarakan mereka yang hilang dalam sejarah kelam Indonesia.'
  },
  {
    id: 'b19',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Pendidikan',
    year: 2011,
    publisher: 'Gramedia',
    isbn: '9786020637174',
    status: 'Published',
    rating: 4.7,
    readers: 3400,
    dateAdded: '2024-06-12T15:45:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300',
    description: 'Mengupas dua sistem berpikir yang mengendalikan cara kita mengambil keputusan.'
  },
  {
    id: 'b20',
    title: 'Bumi',
    author: 'Tere Liye',
    category: 'Cerita Anak',
    year: 2014,
    publisher: 'Gramedia',
    isbn: '9786020301129',
    status: 'Published',
    rating: 4.8,
    readers: 5900,
    dateAdded: '2024-06-25T10:10:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300',
    description: 'Petualangan Raib di dunia paralel yang menyimpan banyak misteri.'
  },
  {
    id: 'b21',
    title: 'Si Anak Singkong',
    author: 'Chairul Tanjung',
    category: 'Nonfiksi',
    year: 2012,
    publisher: 'Kompas',
    isbn: '9789797096502',
    status: 'Draft',
    rating: 0,
    readers: 0,
    dateAdded: '2024-07-01T12:00:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300',
    description: 'Biografi perjalanan hidup pengusaha Chairul Tanjung.'
  }
];

export const initialCategories: Category[] = [
  { id: '1', name: 'Novel', bookCount: 45 },
  { id: '2', name: 'Pendidikan', bookCount: 120 },
  { id: '3', name: 'Teknologi', bookCount: 85 },
  { id: '4', name: 'Komik', bookCount: 230 },
  { id: '5', name: 'Sejarah', bookCount: 34 },
  { id: '6', name: 'Agama', bookCount: 60 },
  { id: '7', name: 'Cerita Anak', bookCount: 150 },
  { id: '8', name: 'Fiksi', bookCount: 205 },
  { id: '9', name: 'Nonfiksi', bookCount: 95 },
];

export const initialUsers: User[] = [
  {
    id: 'u1',
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    username: 'budisantoso',
    joinDate: '2023-01-10T08:00:00Z',
    booksRead: 15,
    booksCompleted: 12,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'u2',
    name: 'Siti Aminah',
    email: 'siti.aminah@email.com',
    username: 'sitiaminah',
    joinDate: '2023-03-15T14:30:00Z',
    booksRead: 42,
    booksCompleted: 38,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'u3',
    name: 'Andi Wiryawan',
    email: 'andi.w@email.com',
    username: 'andiwiryawan',
    joinDate: '2023-06-20T09:15:00Z',
    booksRead: 5,
    booksCompleted: 2,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'u4',
    name: 'Rina Kartika',
    email: 'rina.kar@email.com',
    username: 'rinakartika',
    joinDate: '2023-08-05T11:45:00Z',
    booksRead: 28,
    booksCompleted: 20,
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'u5',
    name: 'Dewi Lestari',
    email: 'dewi.l@email.com',
    username: 'dewilestari',
    joinDate: '2023-11-12T16:20:00Z',
    booksRead: 56,
    booksCompleted: 50,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  }
];

export const initialHistory: HistoryItem[] = [
  {
    id: 'h1',
    bookId: 'b1',
    bookTitle: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300',
    progress: 45,
    currentPage: 135,
    totalPages: 300,
    lastRead: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: 'Sedang Dibaca'
  },
  {
    id: 'h2',
    bookId: 'b4',
    bookTitle: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300',
    progress: 100,
    currentPage: 320,
    totalPages: 320,
    lastRead: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    status: 'Selesai'
  },
  {
    id: 'h3',
    bookId: 'b3',
    bookTitle: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=300',
    progress: 12,
    currentPage: 50,
    totalPages: 416,
    lastRead: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    status: 'Sedang Dibaca'
  }
];

export const initialActivity: ActivityLog[] = [
  {
    id: 'a1',
    user: 'Siti Aminah',
    action: 'Mendaftar',
    target: 'Akun Baru',
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    status: 'Success'
  },
  {
    id: 'a2',
    user: 'Budi Santoso',
    action: 'Menyelesaikan',
    target: 'Buku: Atomic Habits',
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    status: 'Success'
  },
  {
    id: 'a3',
    user: 'Andi Wiryawan',
    action: 'Gagal Login',
    target: 'Sistem',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'Error'
  },
  {
    id: 'a4',
    user: 'Admin',
    action: 'Menambahkan',
    target: 'Buku: Filosofi Teras',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'Success'
  },
  {
    id: 'a5',
    user: 'Rina Kartika',
    action: 'Membaca',
    target: 'Buku: Bumi Manusia',
    time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: 'Success'
  }
];

// Helper to initialize local storage
export const initLocalStorage = () => {
  if (!localStorage.getItem('bacayuk_books')) {
    localStorage.setItem('bacayuk_books', JSON.stringify(initialBooks));
  }
  if (!localStorage.getItem('bacayuk_categories')) {
    localStorage.setItem('bacayuk_categories', JSON.stringify(initialCategories));
  }
  if (!localStorage.getItem('bacayuk_users')) {
    localStorage.setItem('bacayuk_users', JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem('bacayuk_history')) {
    localStorage.setItem('bacayuk_history', JSON.stringify(initialHistory));
  }
  if (!localStorage.getItem('bacayuk_activity')) {
    localStorage.setItem('bacayuk_activity', JSON.stringify(initialActivity));
  }
};
