import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '../../db/schema.sql');

const MAX_ATTEMPTS = 30;
const RETRY_DELAY_MS = 2000;

function isRetryableConnectionError(error) {
  const retryableCodes = new Set(['EAI_AGAIN', 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT']);
  return retryableCodes.has(error.code);
}

async function waitForDatabase() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (!isRetryableConnectionError(error) || attempt === MAX_ATTEMPTS) {
        throw error;
      }

      console.log(
        `Database not ready (attempt ${attempt}/${MAX_ATTEMPTS}): ${error.message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

try {
  await waitForDatabase();
  const schema = await readFile(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Database schema migrated.');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
