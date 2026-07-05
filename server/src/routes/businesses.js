import { Router } from 'express';
import { z } from 'zod';
import { authRequired, optionalAuth, roleRequired } from '../auth.js';
import { query } from '../db/pool.js';
import { slugify, toBusiness } from '../utils.js';

export const businessesRouter = Router();

const businessSchema = z.object({
  name: z.string().min(2),
  ownerEmail: z.string().email().or(z.literal('')).default(''),
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
  verificationNotes: z.string().default(''),
  status: z.enum(['active', 'pending', 'paused']).default('pending'),
  isOpen: z.boolean().default(true),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviewCount: z.coerce.number().int().min(0).default(0),
  plan: z.enum(['starter', 'growth', 'premium']).default('starter'),
  featured: z.boolean().default(false),
});

const listSelect = `
  SELECT b.*, c.name AS category_name, c.slug AS category_slug, c.color AS category_color
  FROM businesses b
  JOIN categories c ON c.id = b.category_id
`;

businessesRouter.get('/', optionalAuth, async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const status = String(req.query.status || 'active').trim();
    const featured = req.query.featured === 'true';
    const params = [];
    const clauses = [];

    if (status === 'all' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (status !== 'all') {
      params.push(status);
      clauses.push(`b.status = $${params.length}`);
    }
    if (category) {
      params.push(category);
      clauses.push(`c.slug = $${params.length}`);
    }
    if (featured) {
      clauses.push('b.featured = true');
    }
    if (search) {
      params.push(`%${search}%`);
      clauses.push(`(b.name ILIKE $${params.length} OR b.description ILIKE $${params.length} OR b.province ILIKE $${params.length} OR c.name ILIKE $${params.length})`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await query(`${listSelect} ${where} ORDER BY b.featured DESC, b.updated_at DESC`, params);
    res.json(result.rows.map((row) => {
      const business = toBusiness(row);
      if (req.user?.role !== 'admin') business.ownerEmail = '';
      return business;
    }));
  } catch (error) {
    next(error);
  }
});

businessesRouter.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const result = await query(`${listSelect} WHERE b.slug = $1`, [req.params.slug]);
    if (!result.rowCount) return res.status(404).json({ message: 'Business not found' });
    const business = toBusiness(result.rows[0]);
    if (req.user?.role !== 'admin') business.ownerEmail = '';

    // Fetch reviews
    const reviewsResult = await query(
      `SELECT id, author_name, rating, comment, created_at
       FROM reviews
       WHERE business_id = $1
       ORDER BY created_at DESC`,
      [business.id]
    );
    business.reviews = reviewsResult.rows.map(row => ({
      id: row.id,
      authorName: row.author_name,
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: row.created_at,
    }));

    res.json(business);
  } catch (error) {
    next(error);
  }
});

businessesRouter.post('/:slug/reviews', async (req, res, next) => {
  try {
    const payload = z.object({
      authorName: z.string().min(2),
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().min(5),
    }).parse(req.body);

    const businessResult = await query('SELECT id FROM businesses WHERE slug = $1', [req.params.slug]);
    if (!businessResult.rowCount) return res.status(404).json({ message: 'Business not found' });
    const businessId = businessResult.rows[0].id;

    // Insert review
    const insertResult = await query(
      `INSERT INTO reviews (business_id, author_name, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, author_name, rating, comment, created_at`,
      [businessId, payload.authorName, payload.rating, payload.comment]
    );

    // Recalculate stats
    const statsResult = await query(
      `SELECT
        COUNT(*)::int AS count,
        COALESCE(AVG(rating), 0)::numeric(2,1) AS avg_rating
       FROM reviews
       WHERE business_id = $1`,
      [businessId]
    );

    const { count, avg_rating } = statsResult.rows[0];

    await query(
      `UPDATE businesses
       SET rating = $1, review_count = $2
       WHERE id = $3`,
      [avg_rating, count, businessId]
    );

    const newReview = {
      id: insertResult.rows[0].id,
      authorName: insertResult.rows[0].author_name,
      rating: Number(insertResult.rows[0].rating),
      comment: insertResult.rows[0].comment,
      createdAt: insertResult.rows[0].created_at,
    };

    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
});

businessesRouter.post('/', authRequired, roleRequired('admin'), async (req, res, next) => {
  try {
    const payload = businessSchema.parse(req.body);
    const result = await query(
      `INSERT INTO businesses
       (name, slug, owner_email, category_id, description, province, canton, address, phone, email, website, image_url, gallery_urls, story, services, schedule, coverage_area, social_links, verification_notes, status, is_open, rating, review_count, plan, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       RETURNING *`,
      [
        payload.name,
        slugify(payload.name),
        payload.ownerEmail,
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
        payload.verificationNotes,
        payload.status,
        payload.isOpen,
        payload.rating,
        payload.reviewCount,
        payload.plan,
        payload.featured,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

businessesRouter.put('/:id', authRequired, roleRequired('admin'), async (req, res, next) => {
  try {
    const payload = businessSchema.parse(req.body);
    const result = await query(
      `UPDATE businesses SET
        name = $1,
        slug = $2,
        owner_email = $3,
        category_id = $4,
        description = $5,
        province = $6,
        canton = $7,
        address = $8,
        phone = $9,
        email = $10,
        website = $11,
        image_url = $12,
        gallery_urls = $13,
        story = $14,
        services = $15,
        schedule = $16,
        coverage_area = $17,
        social_links = $18,
        verification_notes = $19,
        status = $20,
        is_open = $21,
        rating = $22,
        review_count = $23,
        plan = $24,
        featured = $25,
        updated_at = now()
       WHERE id = $26
       RETURNING *`,
      [
        payload.name,
        slugify(payload.name),
        payload.ownerEmail,
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
        payload.verificationNotes,
        payload.status,
        payload.isOpen,
        payload.rating,
        payload.reviewCount,
        payload.plan,
        payload.featured,
        req.params.id,
      ]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Business not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

businessesRouter.delete('/:id', authRequired, roleRequired('admin'), async (req, res, next) => {
  try {
    const result = await query('DELETE FROM businesses WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Business not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
