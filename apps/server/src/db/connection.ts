import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bacayuk_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [results] = await pool.query(sql, params);
  return results as T;
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Terhubung ke database MySQL:', process.env.DB_NAME || 'bacayuk_db');
    connection.release();
    return true;
  } catch (err: any) {
    console.error('❌ Gagal terhubung ke MySQL:', err.message);
    console.warn('⚠️  Pastikan MySQL (XAMPP / Laragon / Docker) sudah berjalan dan konfigurasi .env sesuai.');
    return false;
  }
}

