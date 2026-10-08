# Panduan Database MySQL - BacaYuk

Proyek ini telah dikonfigurasi menggunakan database **MySQL murni**.

## 1. Skema & Struktur Database

File SQL skema dan seed data berada di:
`apps/server/src/db/schema.sql`

Tabel yang dibuat:
1. `profiles`: Data profil pengguna, target baca, dan langganan.
2. `categories`: Kategori buku (Novel, Fiksi, Pengembangan, Sejarah, dsb).
3. `books`: Katalog buku lengkap beserta pengarang, rating, sinopsis, dan sampul.
4. `book_chapters`: Isi bab/konten bacaan untuk fitur e-reader.
5. `favorites`: Daftar buku favorit pengguna.
6. `reading_progress`: Riwayat dan progres halaman/bab yang sedang dibaca.
7. `reader_settings`: Pengaturan tampilan font, ukuran huruf, dan tema baca.

---

## 2. Cara Menjalankan MySQL

Anda dapat menggunakan salah satu dari software berikut di Windows:
- **XAMPP**: Buka XAMPP Control Panel, klik **Start** pada modul **MySQL**.
- **Laragon**: Klik **Start All** (MySQL berjalan di port 3306).
- **MySQL Installer / Service**: Pastikan service `MySQL80` atau `MySQL` running.
- **Docker**:
  ```bash
  docker run -d --name bacayuk-mysql -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -e MYSQL_DATABASE=bacayuk_db mysql:8.0
  ```

---

## 3. Konfigurasi Koneksi (`apps/server/.env`)

Sesuaikan kredensial MySQL Anda jika diperlukan:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bacayuk_db
```

---

## 4. Menjalankan Backend Server

Dari root direktori proyek:
```bash
# Jalankan server backend MySQL
npm run dev:server
```

Server akan otomatis:
1. Mendeteksi koneksi MySQL.
2. Menjalankan `schema.sql` jika database/tabel belum ada (auto-migrate & seed data otomatis).
3. Membuka REST API di `http://localhost:5000`.

Untuk menguji langsung:
- Buka browser ke: `http://localhost:5000/api/books`
- Cek status: `http://localhost:5000/api/health`
