-- =====================================================================
-- BACA YUK! - MySQL Database Schema & Seed Data (Siswa Cerdas & Juara)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `bacayuk_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `bacayuk_db`;

-- 1. Profiles / Users Table
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL UNIQUE,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `school` VARCHAR(150) DEFAULT 'SMP Juara Bangsa',
  `avatar_url` TEXT DEFAULT NULL,
  `reading_goal_books` INT DEFAULT 25,
  `subscription_status` ENUM('free', 'premium', 'vip') DEFAULT 'free',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `icon_name` VARCHAR(50) DEFAULT 'book',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Books Table
CREATE TABLE IF NOT EXISTS `books` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `author` VARCHAR(150) NOT NULL,
  `category_id` VARCHAR(50) DEFAULT NULL,
  `cover_url` TEXT NOT NULL,
  `synopsis` TEXT NOT NULL,
  `language` VARCHAR(50) DEFAULT 'Indonesia',
  `total_pages` INT DEFAULT 150,
  `publisher` VARCHAR(150) DEFAULT NULL,
  `published_year` INT DEFAULT 2024,
  `rating` DECIMAL(3, 1) DEFAULT 4.8,
  `total_reviews` INT DEFAULT 0,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_popular` BOOLEAN DEFAULT FALSE,
  `epub_or_content_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_books_category` (`category_id`),
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Book Chapters Table
CREATE TABLE IF NOT EXISTS `book_chapters` (
  `id` VARCHAR(50) NOT NULL,
  `book_id` VARCHAR(50) NOT NULL,
  `chapter_number` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chapters_book` (`book_id`),
  CONSTRAINT `fk_chapters_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Favorites Table
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `book_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_book_fav` (`user_id`, `book_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Reading Progress Table
CREATE TABLE IF NOT EXISTS `reading_progress` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `book_id` VARCHAR(50) NOT NULL,
  `current_chapter` INT DEFAULT 1,
  `current_page` INT DEFAULT 1,
  `progress_percentage` INT DEFAULT 0,
  `status` ENUM('want_to_read', 'reading', 'completed', 'dropped') DEFAULT 'reading',
  `last_read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_book_progress` (`user_id`, `book_id`),
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Reader Settings Table
CREATE TABLE IF NOT EXISTS `reader_settings` (
  `user_id` VARCHAR(50) NOT NULL,
  `font_family` VARCHAR(50) DEFAULT 'Inter',
  `font_size` VARCHAR(20) DEFAULT 'medium',
  `theme` VARCHAR(20) DEFAULT 'matahari',
  `paper_color` VARCHAR(20) DEFAULT '#FFFFFF',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_reader_settings_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA INITIALIZATION
-- =====================================================================

-- Default Student Profile
INSERT INTO `profiles` (`id`, `username`, `full_name`, `avatar_url`, `reading_goal_books`, `subscription_status`)
VALUES 
  ('u1', 'andi_juara', 'Andi Pratama', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', 25, 'premium')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- School Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `icon_name`)
VALUES
  ('c1', 'Petualangan', 'petualangan', 'rocket'),
  ('c2', 'Sains & Robotik', 'sains', 'flask'),
  ('c3', 'Komik Seru', 'komik', 'sparkles'),
  ('c4', 'Dongeng & Fabel', 'dongeng', 'crown'),
  ('c5', 'Asah Otak', 'asah-otak', 'brain'),
  ('c6', 'Dunia Hewan', 'hewan', 'paw'),
  ('c7', 'Tokoh & Sejarah', 'sejarah', 'landmark'),
  ('c8', 'Inspirasi Juara', 'inspirasi', 'trophy')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- School & Student Books
INSERT INTO `books` (`id`, `title`, `slug`, `author`, `category_id`, `cover_url`, `synopsis`, `language`, `total_pages`, `publisher`, `published_year`, `rating`, `total_reviews`, `is_featured`, `is_popular`, `epub_or_content_url`)
VALUES
  ('b1', 'Petualangan Si Kancil & Hutan Misteri', 'kancil-hutan-misteri', 'Kak Bambang & Tim Ceria', 'c1', 
   'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', 
   'Kancil yang cerdik bersama teman-temannya harus memecahkan misteri batu bintang ajaib yang jatuh di Hutan Rimba sebelum jatuh ke tangan pemburu jahat!', 
   'Indonesia', 128, 'Pustaka Sahabat Anak', 2023, 4.9, 2450, TRUE, TRUE, NULL),

  ('b2', 'Ensiklopedia Cilik: Rahasia Planet & Bintang', 'ensiklopedia-planet-bintang', 'Dr. Stella Kartika', 'c2', 
   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', 
   'Jelajahi lubang hitam, cincin Saturnus yang mempesona, dan rahasia astronot saat melayang di luar angkasa dengan ilustrasi warna-warni memukau!', 
   'Indonesia', 160, 'Erlangga Edukasi', 2022, 4.8, 1890, TRUE, TRUE, NULL),

  ('b3', 'Komik Sains: Ekspedisi Sel Tubuh Manusia', 'komik-sains-tubuh-manusia', 'Studio Komik Nusantara', 'c3', 
   'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80', 
   'Pesawat mikroskopis Kapten Nano mengecil dan masuk ke aliran darah manusia! Saksikan pertarungan seru tentara sel darah putih melawan monster virus.', 
   'Indonesia', 140, 'Mizan Anak Cerdas', 2024, 4.9, 3120, TRUE, TRUE, NULL),

  ('b4', '25 Cerita Rakyat Nusantara Paling Legendaris', 'cerita-rakyat-nusantara', 'Ibu Sud & Kak Seto', 'c4', 
   'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', 
   'Dari Danau Toba, Malin Kundang, hingga Keong Emas. Kisah-kisah penuh pesan moral, budi pekerti, dan kecintaan pada budaya Indonesia.', 
   'Indonesia', 210, 'Gramedia Pustaka Utama', 2021, 4.7, 950, FALSE, TRUE, NULL),

  ('b5', 'Trik Kilat Matematika Gasing: Berhitung Cepat & Asik', 'matematika-gasing-seru', 'Prof. Yohanes Surya', 'c5', 
   'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80', 
   'Bikin matematika jadi game paling seru di dunia! Kuasai perkalian dan pembagian ratusan angka hanya dalam hitungan detik tanpa rumus ribet.', 
   'Indonesia', 175, 'Kandel Sains Edu', 2023, 4.9, 4210, TRUE, TRUE, NULL),

  ('b6', 'Satwa Langka Nusantara: Menyelamatkan Badak Bercula Satu', 'satwa-langka-nusantara', 'Rina Rimba & WWF Junior', 'c6', 
   'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80', 
   'Kisah penyelamatan anak badak bernama Rino di Taman Nasional Ujung Kulon. Kenali habitat hutan tropis Indonesia yang kaya dan menakjubkan.', 
   'Indonesia', 130, 'Sahabat Alam', 2023, 4.8, 880, FALSE, FALSE, NULL),

  ('b7', 'Negeri 5 Menara: Impian Meraih Bintang Dunia', 'negeri-5-menara-edisi-sekolah', 'Ahmad Fuadi', 'c8', 
   'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80', 
   'Mantra ajaib "Man Jadda Wajada" yang membakar semangat 6 sahabat asrama untuk bermimpi besar dan menaklukkan benua-benua di dunia.', 
   'Indonesia', 405, 'Gramedia Pustaka Utama', 2018, 4.8, 3890, FALSE, TRUE, NULL),

  ('b8', 'Kisah Pahlawan Kemerdekaan: Jenderal Soedirman', 'pahlawan-jenderal-soedirman', 'Drs. Supardi Sejarah', 'c7', 
   'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80', 
   'Perjuangan perang gerilya sang Panglima Besar di tengah hutan belantara demi mempertahankan kedaulatan tanah air Indonesia tercinta.', 
   'Indonesia', 190, 'Balai Pustaka', 2020, 4.7, 1120, FALSE, FALSE, NULL),

  ('b9', 'Detektif Cilik & Misteri Lukisan Istana', 'detektif-cilik-misteri', 'Maya Sastra', 'c1', 
   'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80', 
   'Tiga detektif sekolah menemukan teka-teki sandi rahasia di balik lukisan antik museum kota. Bisakah mereka memecahkannya sebelum jam berdentang 12 kali?', 
   'Indonesia', 152, 'Pustaka Fantasi', 2024, 4.9, 1670, FALSE, TRUE, NULL)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Sample Chapters
INSERT INTO `book_chapters` (`id`, `book_id`, `chapter_number`, `title`, `content`)
VALUES
  ('ch1', 'b1', 1, 'Bab 1: Batu Bintang yang Jatuh di Hutan Rimba', 
   'Malam itu langit di atas Hutan Rimba tidak seperti biasanya. Kilatan cahaya hijau keemasan meluncur cepat dan mendarat di balik Bukit Batu. Kancil yang sedang minum di tepi sungai langsung menajamkan telinganya. Ada sesuatu yang luar biasa baru saja terjadi!'),

  ('ch2', 'b1', 2, 'Bab 2: Jejak Kaki Raksasa Misterius', 
   'Keesokan paginya, Kancil mengajak sahabatnya, Tupai yang lincah dan Kura-kura yang bijak. Di tanah berlumpur dekat Bukit Batu, mereka menemukan jejak kaki besar yang belum pernah terlihat sebelumnya di seluruh penjuru hutan.'),

  ('ch3', 'b3', 1, 'Bab 1: Menembus Dinding Pembuluh Darah', 
   'Kapten Nano menarik tuas kemudi kapal mikroskopis Sel-1. Dengan sirine berbunyi pelan, mereka mulai menyusup ke dalam aliran plasma darah. Di kejauhan, sel-sel darah merah tampak meluncur anggun seperti balon rubi raksasa yang membawa oksigen ke seluruh penjuru tubuh.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- User Favorites
INSERT INTO `favorites` (`id`, `user_id`, `book_id`)
VALUES
  ('fav1', 'u1', 'b1'),
  ('fav2', 'u1', 'b2'),
  ('fav3', 'u1', 'b3'),
  ('fav4', 'u1', 'b7'),
  ('fav5', 'u1', 'b9')
ON DUPLICATE KEY UPDATE `user_id` = VALUES(`user_id`);

-- Reading Progress
INSERT INTO `reading_progress` (`id`, `user_id`, `book_id`, `current_chapter`, `current_page`, `progress_percentage`, `status`)
VALUES
  ('prog1', 'u1', 'b1', 4, 98, 85, 'reading'),
  ('prog2', 'u1', 'b2', 2, 45, 40, 'reading'),
  ('prog3', 'u1', 'b3', 3, 140, 100, 'completed')
ON DUPLICATE KEY UPDATE `progress_percentage` = VALUES(`progress_percentage`);

-- Reader Settings
INSERT INTO `reader_settings` (`user_id`, `font_family`, `font_size`, `theme`, `paper_color`)
VALUES
  ('u1', 'Inter', 'medium', 'matahari', '#FFFFFF')
ON DUPLICATE KEY UPDATE `font_family` = VALUES(`font_family`);
