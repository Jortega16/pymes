import crypto from 'node:crypto';
import { query } from './db/pool.js';

const tokenSecret = process.env.AUTH_SECRET || 'dev-secret-change-me';
const tokenTtlMs = 1000 * 60 * 60 * 12;

export function verifyPassword(password, passwordHash) {
  const [scheme, iterationsValue, salt, expected] = passwordHash.split('$');
  if (scheme !== 'pbkdf2' || !iterationsValue || !salt || !expected) return false;
  const actual = crypto
    .pbkdf2Sync(password, salt, Number(iterationsValue), Buffer.from(expected, 'hex').length, 'sha256')
    .toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

export function signToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    businessId: user.business_id || null,
    exp: Date.now() + tokenTtlMs,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', tokenSecret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function readToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', tokenSecret).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Date.now()) return null;
  return payload;
}

export async function authRequired(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = readToken(token);
  if (!payload) return res.status(401).json({ message: 'Authentication required' });

  const result = await query('SELECT id, email, name, role, business_id, active FROM users WHERE id = $1 AND active = true', [payload.sub]);
  if (!result.rowCount) return res.status(401).json({ message: 'Invalid session' });
  req.user = result.rows[0];
  next();
}

export async function optionalAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = readToken(token);
  if (!payload) return next();

  const result = await query('SELECT id, email, name, role, business_id, active FROM users WHERE id = $1 AND active = true', [payload.sub]);
  if (result.rowCount) req.user = result.rows[0];
  next();
}

export function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
