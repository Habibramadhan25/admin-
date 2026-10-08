import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();
const DEFAULT_USER_ID = 'u1';

// GET /api/progress - get user reading history / progress list
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || DEFAULT_USER_ID;

    const query = `
      SELECT 
        rp.id,
        rp.user_id AS userId,
        rp.book_id AS bookId,
        rp.current_chapter AS currentChapter,
        rp.current_page AS currentPage,
        rp.progress_percentage AS progressPercentage,
        rp.status,
        rp.last_read_at AS lastReadAt,
        b.title AS bookTitle,
        b.author AS bookAuthor,
        b.cover_url AS bookCoverUrl,
        b.total_pages AS totalPages,
        c.name AS category
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE rp.user_id = ?
      ORDER BY rp.last_read_at DESC
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching reading progress:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/progress/update - record / update reading progress
router.post('/update', async (req: Request, res: Response) => {
  try {
    const {
      bookId,
      currentChapter = 1,
      currentPage = 1,
      progressPercentage = 0,
      status = 'reading',
    } = req.body;
    const userId = req.body.userId || DEFAULT_USER_ID;

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'bookId diperlukan' });
    }

    const progId = `prog_${Date.now()}`;
    const query = `
      INSERT INTO reading_progress 
        (id, user_id, book_id, current_chapter, current_page, progress_percentage, status, last_read_at)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        current_chapter = VALUES(current_chapter),
        current_page = VALUES(current_page),
        progress_percentage = VALUES(progress_percentage),
        status = VALUES(status),
        last_read_at = NOW()
    `;

    await pool.query<ResultSetHeader>(query, [
      progId,
      userId,
      bookId,
      currentChapter,
      currentPage,
      progressPercentage,
      status,
    ]);

    return res.json({ success: true, message: 'Progres baca berhasil disimpan' });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
