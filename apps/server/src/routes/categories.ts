import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { RowDataPacket } from 'mysql2';

const router = Router();

// GET /api/categories - get all categories with count of books
router.get('/', async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.icon_name AS icon,
        COUNT(b.id) AS count
      FROM categories c
      LEFT JOIN books b ON b.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.icon_name
      ORDER BY count DESC, c.name ASC
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query);
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching categories from MySQL:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
