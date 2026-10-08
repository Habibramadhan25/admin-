import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();
const DEFAULT_USER_ID = 'u1';

// GET /api/profile - get user profile
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || DEFAULT_USER_ID;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id, 
        username, 
        full_name AS fullName, 
        avatar_url AS avatarUrl, 
        reading_goal_books AS readingGoalBooks, 
        subscription_status AS subscriptionStatus, 
        created_at AS createdAt
      FROM profiles 
      WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/profile - update user profile
router.put('/', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || DEFAULT_USER_ID;
    const { fullName, readingGoalBooks, avatarUrl } = req.body;

    await pool.query<ResultSetHeader>(
      `UPDATE profiles 
       SET full_name = COALESCE(?, full_name),
           reading_goal_books = COALESCE(?, reading_goal_books),
           avatar_url = COALESCE(?, avatar_url)
       WHERE id = ?`,
      [fullName, readingGoalBooks, avatarUrl, userId]
    );

    return res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
