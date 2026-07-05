import { Router } from 'express';
import { z } from 'zod';
import { authRequired, roleRequired } from '../auth.js';
import { query } from '../db/pool.js';
import { toBusiness } from '../utils.js';

export const clientRouter = Router();

clientRouter.get('/me/businesses', authRequired, roleRequired('client', 'admin'), async (req, res, next) => {
  try {
    const email = req.user.email;
    const result = await query(
      `SELECT b.*, c.name AS category_name, c.slug AS category_slug, c.color AS category_color
       FROM businesses b
       JOIN categories c ON c.id = b.category_id
       WHERE ($2 = 'admin') OR lower(b.owner_email) = lower($1) OR lower(b.email) = lower($1) OR b.id = $3
       ORDER BY b.updated_at DESC`,
      [email, req.user.role, req.user.business_id]
    );
    res.json({ email, businesses: result.rows.map(toBusiness) });
  } catch (error) {
    next(error);
  }
});

clientRouter.put('/businesses/:id', authRequired, roleRequired('client', 'admin'), async (req, res, next) => {
  try {
    const payload = z.object({
      name: z.string().min(2),
      categoryId: z.coerce.number().int().positive(),
      description: z.string().min(10),
      province: z.string().min(2),
      canton: z.string().default(''),
      address: z.string().default(''),
      phone: z.string().default(''),
      email: z.string().email().or(z.literal('')).default(''),
      website: z.string().url().or(z.literal('')).default(''),
      imageUrl: z.string().url().or(z.literal('')).default(''),
      galleryUrls: z.array(z.string().url()).default([]),
      story: z.string().default(''),
      services: z.array(z.string()).default([]),
      schedule: z.string().default(''),
      coverageArea: z.string().default(''),
      socialLinks: z.record(z.string(), z.string()).default({}),
      isOpen: z.boolean().default(true),
    }).parse(req.body);

    const existing = await query('SELECT owner_email, email FROM businesses WHERE id = $1', [req.params.id]);
    if (!existing.rowCount) return res.status(404).json({ message: 'Business not found' });
    const ownerMatches = req.user.role === 'admin' || [existing.rows[0].owner_email, existing.rows[0].email]
      .filter(Boolean)
      .some((email) => email.toLowerCase() === req.user.email.toLowerCase());
    if (!ownerMatches) return res.status(403).json({ message: 'Owner email does not match this business' });

    const result = await query(
      `UPDATE businesses SET
        name = $1,
        category_id = $2,
        description = $3,
        province = $4,
        canton = $5,
        address = $6,
        phone = $7,
        email = $8,
        website = $9,
        image_url = $10,
        gallery_urls = $11,
        story = $12,
        services = $13,
        schedule = $14,
        coverage_area = $15,
        social_links = $16,
        is_open = $17,
        status = 'pending',
        updated_at = now()
       WHERE id = $18
       RETURNING *`,
      [
        payload.name,
        payload.categoryId,
        payload.description,
        payload.province,
        payload.canton,
        payload.address,
        payload.phone,
        payload.email,
        payload.website,
        payload.imageUrl,
        JSON.stringify(payload.galleryUrls),
        payload.story,
        JSON.stringify(payload.services),
        payload.schedule,
        payload.coverageArea,
        JSON.stringify(payload.socialLinks),
        payload.isOpen,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});
