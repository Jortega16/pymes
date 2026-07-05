import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '../../db/seed.sql');

try {
  const seed = await readFile(seedPath, 'utf8');
  await pool.query(seed);
  console.log('Database seeded.');
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
