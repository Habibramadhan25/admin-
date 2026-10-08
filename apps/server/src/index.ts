import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './db/connection';
import { initDatabase } from './db/initDb';
import booksRouter from './routes/books';
import categoriesRouter from './routes/categories';
import favoritesRouter from './routes/favorites';
import progressRouter from './routes/progress';
import profileRouter from './routes/profile';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/progress', progressRouter);
app.use('/api/profile', profileRouter);

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'ok',
    service: 'bacayuk-mysql-server',
    database: 'MySQL',
    dbConnected: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'BacaYuk MySQL API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: [
      '/api/books',
      '/api/categories',
      '/api/favorites',
      '/api/progress',
      '/api/profile',
      '/api/health',
    ],
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 BacaYuk MySQL API Server berjalan pada http://localhost:${PORT}`);
  
  // Auto-init DB schema & verify MySQL connection
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('📦 Memeriksa skema tabel MySQL...');
      await initDatabase();
    }
  } catch (err: any) {
    console.warn('⚠️ Gagal inisialisasi awal database:', err.message);
  }
});
