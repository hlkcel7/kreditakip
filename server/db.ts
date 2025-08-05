import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'kreditakip',
  password: 'kreditakip123',
  database: 'kreditakip',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(pool);