import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export async function initDatabase(): Promise<boolean> {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'bacayuk_db';

  console.log(`⏳ Memeriksa dan menginisialisasi database MySQL [${database}]...`);

  try {
    // 1. First connect without specifying database to create database if not exists
    const rootConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConnection.end();

    // 2. Connect to the target database and execute schema.sql
    const dbConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
    });

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf8');
      await dbConnection.query(sqlContent);
      console.log('✅ Skema tabel dan seed data MySQL berhasil diaplikasikan.');
    } else {
      console.warn('⚠️ File schema.sql tidak ditemukan di:', schemaPath);
    }

    await dbConnection.end();
    return true;
  } catch (err: any) {
    console.error('❌ Gagal inisialisasi database MySQL:', err.message);
    return false;
  }
}

// Allow standalone execution: npx tsx src/db/initDb.ts
if (require.main === module) {
  initDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
