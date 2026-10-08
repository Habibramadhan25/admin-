export interface BookChapter {
  id: string;
  title: string;
  content: string;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  rating: number;
  reviewsCount?: number;
  language: string;
  totalPages: number;
  publisher?: string;
  publishedYear?: number;
  synopsis: string;
  progressPercentage?: number;
  lastReadTime?: string;
  isFavorite?: boolean;
  isDownloaded?: boolean;
  chapters?: BookChapter[];
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
}

export interface DailyMission {
  title: string;
  current: number;
  target: number;
  unit: string;
  rewardCoins: number;
  rewardXp: number;
}

export interface UserProfileData {
  id: string;
  name: string;
  username: string;
  school: string;
  avatarUrl: string;
  email: string;
  booksRead: number;
  readingHours: number;
  readingGoalBooks: number;
  dailyMission?: DailyMission;
}

export const MOCK_USER: UserProfileData = {
  id: 'u1',
  name: 'Rafli',
  username: 'rafli',
  email: 'rafli@example.com',
  school: 'SMP Juara Bangsa',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5PWNDaY3xaJAuXtLiYfHiRyhjRWcsmXS-cPnWIJ9EN3U1o1tyK5OICp2I3wZMg9v752rB0UJsBDNT-4HXkJt4LPn2Jr02hL300C__8s5m41mgHe4ixIIk02bGM1U5NUHLHkFrCy6OFdBlfaY9YwjZv35Z9RWAl08MVvh7NXmKQ7F_pRfL96coAzraUto0Voap0uHZjrs107W3ex5ozHl23YeIayhkTHgBMJgPQ-08ev6dyXseevc',
  booksRead: 8,
  readingHours: 24,
  readingGoalBooks: 12,
  dailyMission: {
    title: 'Membaca 15 Menit',
    current: 12,
    target: 15,
    unit: 'menit',
    rewardCoins: 50,
    rewardXp: 50,
  },
};

export const MOCK_CATEGORIES = [
  { id: 'all', name: 'Semua', slug: 'all', icon: 'auto_stories' },
  { id: 'novel', name: 'Novel', slug: 'novel', icon: 'auto_stories' },
  { id: 'self-help', name: 'Pengembangan Diri', slug: 'self-help', icon: 'trending_up' },
  { id: 'sejarah', name: 'Sejarah', slug: 'sejarah', icon: 'account_balance' },
  { id: 'motivasi', name: 'Motivasi', slug: 'motivasi', icon: 'psychology' },
  { id: 'romance', name: 'Romance', slug: 'romance', icon: 'favorite' },
  { id: 'sains', name: 'Sains', slug: 'sains', icon: 'science' },
];

export const MOCK_BOOKS: BookItem[] = [
  {
    id: 'b1',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    coverUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQtSFk9DaPiVkOqPX4Ne2PfXfHbOf23UswqYriFsobuaCvVpzZOvzC7JeaU48n60ZuGlWTauJiwX98p7p3UJaZry96p5AXPoc_oQWQSvYlO06C3Xerrw4dtotVolu1CzZQ-7QDHy_yolT1Kv6BVAlgSeHMQJnfNE3dGUmSJ6VZEzPT5xDKrFxUjMopNN71kmbxHxTabRkjP5ue0db4i9I_oIohNKui9rj9QtqAkbsWIN0MznZff04',
    category: 'Novel',
    rating: 4.8,
    reviewsCount: 1256,
    language: 'Indonesia',
    totalPages: 379,
    publisher: 'Kepustakaan Populer Gramedia',
    publishedYear: 2017,
    synopsis:
      'Laut Bercerita mengisahkan tentang perjuangan, persahabatan, dan pengorbanan di masa lalu yang kelam. Sebuah novel yang mengharukan dan penuh makna tentang kehilangan dan harapan.\n\nBuku ini mengajak pembaca menyelami kisah para aktivis mahasiswa yang hilang secara misterius di era Orde Baru. Melalui dua sudut pandang, yakni Biru Laut sang aktivis dan Asmara Jati adik perempuannya, novel ini menyuarakan mereka yang dihilangkan secara paksa dan keluarga yang ditinggalkan dalam ketidakpastian.',
    progressPercentage: 68,
    lastReadTime: 'Kemarin, 21:05',
    isFavorite: true,
    isDownloaded: true,
    chapters: [
      {
        id: 'c1',
        title: '1. Biru Laut',
        content:
          'Mati, bagiku, bukan sebuah akhir melainkan sebuah ruang sunyi yang baru. Di dasar laut yang dingin dan gelap ini, aku terombang-ambing bersama karang dan lumut yang memeluk tubuhku.\n\nAku mengingat aroma kopi seduhan Asmara dan obrolan panjang di Seyegan. Kami hanya anak-anak muda yang membaca buku, mendiskusikan nasib petani, dan menginginkan keadilan. Namun di negeri ini, membaca buku tertentu bisa dianggap ancaman.',
      },
      {
        id: 'c2',
        title: '2. Rumah Seyegan',
        content:
          'Rumah di Seyegan itu sederhana sekali. Terletak di tepi sawah, selalu terdengar derit jangkrik ketika malam tiba. Di sanalah kami berkumpul, mendengarkan Mas Sunu dan Kasih membacakan puisi-puisi perjuangan.',
      },
      {
        id: 'c3',
        title: '3. Asmara Jati',
        content:
          'Kakakku tidak pernah pulang. Setiap hari minggu, ibu masih meletakkan piring dan sendok di meja makan untuknya. Kami menolak untuk melupakan.',
      },
    ],
  },
  {
    id: 'b2',
    title: 'Hujan',
    author: 'Tere Liye',
    coverUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCcEN7l7dpwrEGMXsuW982HKO4fvMfqW1blGp_Z2f7IkGoI15thUxyu0-VSjoCPEGP25xFGMScambOa2qvkiC8nMr-7sfKXm_451ZRg-vVxkkm3PZjR-l3PLyej7ghN6nthNTRAdaEsRgiVhLGTbjeksn9QeipixdiaMm7J-qFzdZrn8S5qA70D7GsfFgV8fPqzpChJddbZWS-Z7hi1uC110HM_2nE4PX64qY81dcVaVq5Ur1oNquk',
    category: 'Novel',
    rating: 4.6,
    reviewsCount: 980,
    language: 'Indonesia',
    totalPages: 320,
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2016,
    synopsis:
      'Tentang persahabatan, cinta, perpisahan, melupakan, dan tentang hujan. Novel berlatar masa depan bumi pada tahun 2042 saat teknologi canggih telah menggantikan peran manusia.\n\nLail, gadis muda yang kehilangan keluarganya akibat letusan gunung purba, bertemu dengan Esok yang menjadi tempat bertumpu. Namun saat dunia berubah dan pesawat antariksa hendak membawa manusia pergi, akankah ingatan tentang hujan harus dihapuskan selamanya?',
    progressPercentage: 100,
    lastReadTime: '15 Feb 2025',
    isFavorite: true,
    isDownloaded: true,
    chapters: [
      {
        id: 'c1',
        title: '1. Menghapus Ingatan',
        content:
          'Gadis itu duduk di ruangan bernuansa putih perak. Di hadapannya berdiri Elijah, fasilitator modifikasi ingatan paling canggih di kota itu.\n\n"Apakah kamu yakin ingin menghapus seluruh kenangan itu?" tanya Elijah lembut.\nLail menatap ke luar jendela. Hujan deras turun membasahi dinding kaca.',
      },
    ],
  },
  {
    id: 'b3',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJvvPeqahcg65ZK6Jy9E_xO1XLHUdabhd868QyFklvTiFqD5llthlpISnOrbf9PYaloJYORx9_so6m5ORMUJWCubfa7Qyqksm03-nLU7yM73JgX89KRVvHNdVADRsx_0DC_ArAm3iCpigGi2tkc0sIJeHapcpPnnSEEnTFMg8d8JdEUl9t-rkh0-Yrz8lwsfb-S8MTn4hyGmw-CJCmeVmZHRpEHS4e3PtPYDbF9CBKCg1R0gkIS8s',
    category: 'Pengembangan Diri',
    rating: 4.9,
    reviewsCount: 3410,
    language: 'Indonesia',
    totalPages: 320,
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2018,
    synopsis:
      'Perubahan Kecil yang Memberikan Hasil Luar Biasa. Cara mudah dan terbukti untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk.\n\nJika Anda kesulitan mengubah kebiasaan, masalahnya bukan pada diri Anda, melainkan sistem Anda. Buku ini membeberkan panduan praktis 4 Kaidah Perubahan Perilaku agar kita bisa bertumbuh 1% setiap hari secara konsisten.',
    progressPercentage: 100,
    lastReadTime: '28 Feb 2025',
    isFavorite: false,
    isDownloaded: false,
    chapters: [
      {
        id: 'c1',
        title: '1. Kekuatan Luar Biasa Kebiasaan Atom',
        content:
          'Sangat mudah menyepelekan perubahan kecil setiap hari. Kita sering meyakinkan diri sendiri bahwa kesuksesan besar menuntut tindakan besar. Padahal, jika Anda bertambah baik 1% setiap hari selama satu tahun, Anda akan 37 kali lipat lebih baik pada akhir tahun.',
      },
    ],
  },
  {
    id: 'b4',
    title: 'Negeri 5 Menara',
    author: 'A. Fuadi',
    coverUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDdFTEg4hx62XzVF9wHv7K9JZqvlAfFz1iLMoDWH75No9NoQtjjOJ1826tpjLIqueIbaFF2mfLE2sOZCrpSFrqsVkjEYfz-LBSNrIGgBo5mR_Vqb8NVaVznl0r69-mMgGsR0zSMLi3QIN5qY3P7knXguxS8wnVRdpUugUPFKLy08A45uiyn4bx1RFB8Fn8JIlOjniQueOz7GLc7ki1RcUg4lLkl3ZJxapPm-J4ooqlVbTaaik0XNX8',
    category: 'Novel',
    rating: 4.7,
    reviewsCount: 1540,
    language: 'Indonesia',
    totalPages: 405,
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2009,
    synopsis:
      'Man Jadda Wajada — Siapa yang bersungguh-sungguh pasti akan berhasil. Kisah enam santri dari pelosok nusantara yang dipertemukan di Pondok Madani Jawa Timur.\n\nDi bawah menara masjid, mereka merajut impian tinggi untuk menaklukkan dunia: dari Jakarta, Kairo, London, hingga Washington DC. Perjalanan persahabatan yang sarat nilai perjuangan dan ketulusan.',
    progressPercentage: 100,
    lastReadTime: '02 Jan 2025',
    isFavorite: true,
    isDownloaded: true,
    chapters: [
      {
        id: 'c1',
        title: '1. Mantra Ajaib',
        content:
          'Kiai Rais berdiri di mimbar aula utama. Suaranya lantang menggelegar ke seluruh penjuru ruangan.\n"Anak-anakku, ingatlah mantra ini seumur hidup kalian: Man jadda wajada! Siapa yang bersungguh-sungguh, dia pasti akan berhasil!"\nKata-kata itu terpatri kuat di dalam dada kami.',
      },
    ],
  },
  {
    id: 'b5',
    title: 'Dilan 1990',
    author: 'Pidi Baiq',
    coverUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA3dDti8SjOCBpwBo38AvSZkSE7BGs2xq-JHDiRJGYIzE3VtY8NvpIGRWNfAbTIYTf4nwmLox9ztiGETG64B4pj7pWXOvyH0DzUljcwipT5dlR2ecutahUmLG_wKT6nBztFyw1P-7D3dHgVCg9OkNy3-uWyv-mhEfAQYg8SD8XVx_Teddle8Fa96o7FZZlc1FRxzfxBXCuIlncLC1yoyZUkfw5rO4Pdm3vio-GHFRXSVyo7hRugTsY',
    category: 'Romance',
    rating: 4.5,
    reviewsCount: 2890,
    language: 'Indonesia',
    totalPages: 348,
    publisher: 'Pastel Books',
    publishedYear: 2014,
    synopsis:
      'Milea, kamu cantik, tapi aku belum mencintaimu. Enggak tahu kalau sore. Tunggu saja.\n\nKisah romansa masa SMA di Bandung tahun 1990 antara Milea Adnan Hussain dan Dilan, anggota geng motor yang gemar berpuitis dengan cara unik dan tak terduga.',
    progressPercentage: 20,
    lastReadTime: '3 Hari Lalu',
    isFavorite: false,
    isDownloaded: false,
    chapters: [
      {
        id: 'c1',
        title: '1. Ramalan di Buah Batu',
        content:
          'Waktu itu tahun 1990. Aku baru pindah dari Jakarta ke Bandung. Pagi itu aku berjalan kaki menuju sekolah ketika sebuah motor CB melambat di sampingku.\n"Boleh aku meramal?" kata anak laki-laki dengan jaket jeans itu. "Nanti sore kita akan bertemu di kantin."',
      },
    ],
  },
  {
    id: 'b6',
    title: 'Sapiens: Riwayat Singkat Umat Manusia',
    author: 'Yuval Noah Harari',
    coverUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCpMelGvONNbvBTd5yU8_reKQaN9Wxs5vWRyuh-g5Nmm7bFyE8HpcfkcHAz-wpZHiOsjjL0sAVSharoTwo9PDH8DjKDDSg4XC0T_EOg_4me1fAkJ_jQuuKe3AtQC5ceDZh_BfYQ0s-84G_aN-3YoofF61IYAMysfSpir0TK-MqTKR1IinHJZWHuBewZfkpBRhuo8pELW1Yc8TwHRRiRK9aX1tCgG1zJaBuSYfoGHBak63YZUwVbNic',
    category: 'Sejarah',
    rating: 4.8,
    reviewsCount: 4120,
    language: 'Indonesia',
    totalPages: 512,
    publisher: 'Kepustakaan Populer Gramedia',
    publishedYear: 2015,
    synopsis:
      'Tujuh puluh ribu tahun lalu, ada setidaknya enam spesies manusia di muka bumi. Kini hanya tersisa satu: Homo sapiens. Bagaimana spesies kera tak berdaya ini bisa menjadi penguasa planet bumi?\n\nHarari menyajikan analisis revolusioner tentang bagaimana Revolusi Kognitif, Revolusi Pertanian, dan Revolusi Sains membentuk peradaban manusia modern.',
    progressPercentage: 0,
    isFavorite: false,
    isDownloaded: false,
    chapters: [
      {
        id: 'c1',
        title: '1. Hewan yang Tidak Berarti',
        content:
          'Sekitar 13,5 miliar tahun lalu, materi, energi, waktu, dan ruang tercipta dalam peristiwa Dentuman Besar. Cerita tentang sifat-sifat dasar alam semesta ini disebut fisika.\n\nHal paling penting yang harus diketahui tentang manusia prasejarah adalah bahwa mereka tidak memiliki pengaruh signifikan terhadap lingkungannya.',
      },
    ],
  },
  {
    id: 'b7',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    coverUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBU97odCqIPVJvHrg9CV5QujTlmHjHQe9Xo2gJdb23-U8RdnwJ5qJHYiTCdGpmQ3dAOpK-9Y6Mf_moEFMS57AcYiJYL4Mo1c4oHNHdu9vdcrbkFzYxEIKxg1CL72G5BnpirvaI91hEIFiQnBmO25L5PKs-nZs7V8lVkTPv0MCbw0OZsx78kT8VbHb3aNr1Ul3G8_VmLgVGVU59stALEy2Hg_hEVRG37ItwmuzAqcgtZgsefl2cF62o',
    category: 'Novel',
    rating: 4.9,
    reviewsCount: 3890,
    language: 'Indonesia',
    totalPages: 529,
    publisher: 'Bentang Pustaka',
    publishedYear: 2005,
    synopsis:
      'Di sebuah desa kecil di Belitung, terdapat sebuah sekolah dengan bangunan yang sudah reyot. Sekolah itu hanya memiliki sepuluh murid, namun semangat mereka untuk belajar sangatlah besar.\n\nMereka adalah sepuluh anak yang memiliki mimpi besar untuk mengubah nasib keluarga dan desa mereka di tengah keterbatasan ekonomi dan kemiskinan.',
    progressPercentage: 45,
    lastReadTime: 'Hari ini, 14:20',
    isFavorite: true,
    isDownloaded: true,
    chapters: [
      {
        id: 'c1',
        title: '1. Laskar Pelangi',
        content:
          'Pagi itu, matahari bersinar cerah menembus celah-celah atap sekolah yang bocor. Bu Muslimah, guru muda yang penuh dedikasi, berdiri di depan kelas dengan senyum mengembang. Di tangannya, sebatang kapur tulis menari-nari di atas papan tulis hitam yang sudah kusam.\n\nAnak-anak duduk rapi di bangku kayu yang berderit setiap kali mereka bergerak. Mata mereka berbinar, menyerap setiap kata yang diucapkan Bu Muslimah seperti spons menyerap air. Bagi mereka, sekolah bukan sekadar tempat belajar membaca dan berhitung, melainkan jendela menuju dunia yang lebih luas.\n\nIkal, sang narator cerita, duduk di barisan depan. Di sampingnya, Lintang, anak jenius dari keluarga nelayan miskin, tengah sibuk mencatat dengan pensil yang sudah pendek.\n\nHari-hari berlalu dengan penuh canda tawa dan perjuangan. Mereka belajar di bawah bayang-bayang kemiskinan dan keterbatasan, namun semangat mereka tak pernah padam. Mereka adalah Laskar Pelangi, anak-anak yang berani bermimpi dan meraih cita-cita di tengah badai kehidupan.',
      },
      {
        id: 'c2',
        title: '2. Sepuluh Murid Baru',
        content:
          'Kecemasan itu bermula sejak pagi buta. Jika jumlah murid tidak mencapai sepuluh orang, sekolah SD Muhammadiyah Gantong yang reyot itu terpaksa ditutup oleh pengawas sekolah dari Tanjung Pandan.',
      },
      {
        id: 'c3',
        title: '3. Guruku',
        content:
          'Bu Mus dan Pak Harfan mengajar tanpa digaji sepeser pun. Mereka menghidupi diri dengan menjahit dan berkebun selepas jam sekolah. Namun tak pernah sekalipun tampak keluh kesah di wajah mulia mereka.',
      },
    ],
  },
];
