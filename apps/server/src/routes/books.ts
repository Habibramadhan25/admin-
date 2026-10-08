import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { RowDataPacket } from 'mysql2';

const router = Router();

// GET /api/books - list books with optional search, category, featured, popular query params
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, category, featured, popular } = req.query;

    let query = `
      SELECT 
        b.id,
        b.title,
        b.slug,
        b.author,
        b.category_id AS categoryId,
        c.name AS category,
        b.cover_url AS coverUrl,
        b.synopsis,
        b.language,
        b.total_pages AS totalPages,
        b.publisher,
        b.published_year AS publishedYear,
        b.rating,
        b.total_reviews AS reviewsCount,
        b.is_featured AS isFeatured,
        b.is_popular AS isPopular,
        b.epub_or_content_url AS epubOrContentUrl,
        b.created_at AS createdAt
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (q && typeof q === 'string' && q.trim().length > 0) {
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR c.name LIKE ?)`;
      const searchPattern = `%${q.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
      query += ` AND (LOWER(c.name) = LOWER(?) OR LOWER(c.slug) = LOWER(?))`;
      params.push(category.trim(), category.trim());
    }

    if (featured === 'true' || featured === '1') {
      query += ` AND b.is_featured = 1`;
    }

    if (popular === 'true' || popular === '1') {
      query += ` AND b.is_popular = 1`;
    }

    query += ` ORDER BY b.rating DESC, b.created_at DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching books from MySQL:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/books/:id - get single book with chapter count
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        b.id,
        b.title,
        b.slug,
        b.author,
        b.category_id AS categoryId,
        c.name AS category,
        b.cover_url AS coverUrl,
        b.synopsis,
        b.language,
        b.total_pages AS totalPages,
        b.publisher,
        b.published_year AS publishedYear,
        b.rating,
        b.total_reviews AS reviewsCount,
        b.is_featured AS isFeatured,
        b.is_popular AS isPopular,
        b.epub_or_content_url AS epubOrContentUrl,
        b.created_at AS createdAt
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ? OR b.slug = ?
      LIMIT 1
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error('Error fetching book detail:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/books/:id/chapters - get book chapters
router.get('/:id/chapters', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        book_id AS bookId,
        chapter_number AS chapterNumber,
        title,
        content,
        created_at AS createdAt
      FROM book_chapters
      WHERE book_id = ?
      ORDER BY chapter_number ASC
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
