import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import crypto from 'crypto';

const router = Router();

/**
 * Hash password dengan SHA-256 dan salt sederhana
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_bacayuk_salt_2026').digest('hex');
}

/**
 * POST /api/auth/register
 * Mendaftarkan akun siswa baru ke database MySQL
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, fullName, email, password, school } = req.body;

    if (!username || !fullName || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, Nama Lengkap, dan Password wajib diisi.',
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanFullName = String(fullName).trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanUsername}@sekolah.id`;
    const cleanSchool = school ? String(school).trim() : 'SMP Juara Bangsa';
    const pwdHash = hashPassword(password);

    // Cek apakah username sudah dipakai
    const existing = await query<any[]>(
      'SELECT id FROM profiles WHERE username = ? OR email = ? LIMIT 1',
      [cleanUsername, cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username atau Email sudah terdaftar. Silakan gunakan yang lain.',
      });
    }

    const newId = 'u_' + Date.now();
    const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`;

    await query(
      `INSERT INTO profiles (id, username, full_name, email, password_hash, school, avatar_url, reading_goal_books, subscription_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, cleanUsername, cleanFullName, cleanEmail, pwdHash, cleanSchool, defaultAvatar, 20, 'free']
    );

    const userProfile = {
      id: newId,
      username: cleanUsername,
      name: cleanFullName,
      email: cleanEmail,
      school: cleanSchool,
      avatarUrl: defaultAvatar,
      booksRead: 0,
      readingHours: 0,
      readingGoalBooks: 20,
    };

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran akun berhasil!',
      data: userProfile,
    });
  } catch (err: any) {
    console.error('Error during register:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat pendaftaran.',
      error: err.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Masuk dengan username/email dan password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan Password wajib diisi.',
      });
    }

    const cleanIdentifier = String(username).trim().toLowerCase();
    const pwdHash = hashPassword(password);

    // Cari berdasarkan username atau email
    const users = await query<any[]>(
      `SELECT id, username, full_name, email, password_hash, school, avatar_url, reading_goal_books
       FROM profiles 
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [cleanIdentifier, cleanIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak ditemukan. Silakan periksa kembali username Anda.',
      });
    }

    const user = users[0];

    // Jika password_hash terisi di DB, cek kecocokannya
    if (user.password_hash && user.password_hash !== pwdHash) {
      return res.status(401).json({
        success: false,
        message: 'Password yang Anda masukkan salah.',
      });
    }

    // Ambil jumlah buku yang sudah dibaca dari reading_progress
    const progressCount = await query<any[]>(
      `SELECT COUNT(*) as count FROM reading_progress WHERE user_id = ? AND status = 'completed'`,
      [user.id]
    );
    const booksRead = progressCount[0]?.count || 0;

    const userProfile = {
      id: user.id,
      username: user.username,
      name: user.full_name,
      email: user.email || `${user.username}@sekolah.id`,
      school: user.school || 'SMP Juara Bangsa',
      avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      booksRead,
      readingHours: 0,
      readingGoalBooks: user.reading_goal_books || 20,
    };

    return res.json({
      success: true,
      message: 'Login berhasil!',
      data: userProfile,
    });
  } catch (err: any) {
    console.error('Error during login:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.',
      error: err.message,
    });
  }
});

export default router;
