import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();
const DEFAULT_USER_ID = 'u1';

// GET /api/favorites - list favorite book IDs for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || DEFAULT_USER_ID;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT book_id AS bookId FROM favorites WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const favoriteIds = rows.map((r) => r.bookId);
    return res.json({ success: true, data: favoriteIds });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/favorites/toggle - toggle favorite status
router.post('/toggle', async (req: Request, res: Response) => {
  try {
    const { bookId } = req.body;
    const userId = req.body.userId || DEFAULT_USER_ID;

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'bookId diperlukan' });
    }

    // Check if already favorited
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM favorites WHERE user_id = ? AND book_id = ?`,
      [userId, bookId]
    );

    if (existing.length > 0) {
      // Remove from favorites
      await pool.query(
        `DELETE FROM favorites WHERE user_id = ? AND book_id = ?`,
        [userId, bookId]
      );
      return res.json({ success: true, isFavorite: false, message: 'Dihapus dari favorit' });
    } else {
      // Add to favorites
      const favId = `fav_${Date.now()}`;
      await pool.query<ResultSetHeader>(
        `INSERT INTO favorites (id, user_id, book_id) VALUES (?, ?, ?)`,
        [favId, userId, bookId]
      );
      return res.json({ success: true, isFavorite: true, message: 'Ditambahkan ke favorit' });
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
