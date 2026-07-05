import { Router } from 'express';
import { z } from 'zod';
import { authRequired, roleRequired } from '../auth.js';
import { query } from '../db/pool.js';

export const requestsRouter = Router();

const requestSchema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().default(''),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  message: z.string().default(''),
  formPayload: z.record(z.string(), z.unknown()).default({}),
  declarations: z.object({
    truthfulInformation: z.literal(true),
    noApprovalGuarantee: z.literal(true),
    additionalVerification: z.literal(true),
    suspensionUnderstanding: z.literal(true),
    publicationAuthorization: z.literal(true),
  }),
});

requestsRouter.get('/', authRequired, roleRequired('admin'), async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, c.name AS category_name
       FROM registration_requests r
       LEFT JOIN categories c ON c.id = r.category_id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows.map((row) => ({
      id: row.id,
      businessName: row.business_name,
      ownerName: row.owner_name,
      email: row.email,
      phone: row.phone,
      categoryId: row.category_id,
      categoryName: row.category_name,
      message: row.message,
      formPayload: row.form_payload,
      declarations: row.declarations,
      status: row.status,
      createdAt: row.created_at,
    })));
  } catch (error) {
    next(error);
  }
});

requestsRouter.post('/', async (req, res, next) => {
  try {
    const payload = requestSchema.parse(req.body);
    const result = await query(
      `INSERT INTO registration_requests (business_name, owner_name, email, phone, category_id, message, form_payload, declarations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        payload.businessName,
        payload.ownerName,
        payload.email,
        payload.phone,
        payload.categoryId || null,
        payload.message,
        payload.formPayload,
        payload.declarations,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

requestsRouter.patch('/:id/status', authRequired, roleRequired('admin'), async (req, res, next) => {
  try {
    const payload = z.object({ status: z.enum(['new', 'contacted', 'approved', 'rejected']) }).parse(req.body);
    const result = await query(
      'UPDATE registration_requests SET status = $1 WHERE id = $2 RETURNING *',
      [payload.status, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Request not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});
