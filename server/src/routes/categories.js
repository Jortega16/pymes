import { Router } from 'express';
import { z } from 'zod';
import { authRequired, roleRequired } from '../auth.js';
import { query } from '../db/pool.js';
import { slugify, toCategory } from '../utils.js';

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().default(''),
  icon: z.string().default('Store'),
  color: z.string().default('#1b998b'),
});

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(b.id)::int AS business_count
       FROM categories c
       LEFT JOIN businesses b ON b.category_id = c.id AND b.status = 'active'
       GROUP BY c.id
       ORDER BY c.name`
    );
    res.json(result.rows.map((row) => ({ ...toCategory(row), businessCount: row.business_count })));
  } catch (error) {
    next(error);
  }
});

categoriesRouter.post('/', authRequired, roleRequired('admin'), async (req, res, next) => {
  try {
    const payload = categorySchema.parse(req.body);
    const result = await query(
      `INSERT INTO categories (name, slug, description, icon, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [payload.name, slugify(payload.name), payload.description, payload.icon, payload.color]
    );
    res.status(201).json(toCategory(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

categoriesRouter.put('/:id', authRequired, roleRequired('admin'), async (req, res, next) => {
  try {
    const payload = categorySchema.parse(req.body);
    const result = await query(
      `UPDATE categories
       SET name = $1, slug = $2, description = $3, icon = $4, color = $5
       WHERE id = $6
       RETURNING *`,
      [payload.name, slugify(payload.name), payload.description, payload.icon, payload.color, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Category not found' });
    res.json(toCategory(result.rows[0]));
  } catch (error) {
    next(error);
  }
});
