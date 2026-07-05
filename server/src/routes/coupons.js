import { Router } from 'express';
import { z } from 'zod';
import { authRequired, roleRequired } from '../auth.js';
import { query } from '../db/pool.js';

export const couponsRouter = Router();

const couponSchema = z.object({
  businessId: z.coerce.number().int().positive(),
  title: z.string().min(3),
  code: z.string().min(2),
  discount: z.string().min(2),
  expiresAt: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

couponsRouter.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT cp.*, b.name AS business_name
       FROM coupons cp
       JOIN businesses b ON b.id = cp.business_id
       ORDER BY cp.active DESC, cp.expires_at ASC NULLS LAST`
    );
    res.json(result.rows.map((row) => ({
      id: row.id,
      businessId: row.business_id,
      businessName: row.business_name,
      title: row.title,
      code: row.code,
      discount: row.discount,
      expiresAt: row.expires_at,
      active: row.active,
    })));
  } catch (error) {
    next(error);
  }
});

couponsRouter.post('/', authRequired, roleRequired('admin'), async (req, res, next) => {
  try {
    const payload = couponSchema.parse(req.body);
    const result = await query(
      `INSERT INTO coupons (business_id, title, code, discount, expires_at, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [payload.businessId, payload.title, payload.code, payload.discount, payload.expiresAt || null, payload.active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});
