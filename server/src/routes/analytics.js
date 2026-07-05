import { createHash } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { authRequired, roleRequired } from '../auth.js';
import { query } from '../db/pool.js';

export const analyticsRouter = Router();

analyticsRouter.post('/page-view', async (req, res, next) => {
  try {
    const payload = z.object({
      path: z.string().min(1),
      businessId: z.coerce.number().int().positive().optional().nullable(),
      referrer: z.string().default(''),
    }).parse(req.body);
    const ipSource = req.ip || req.socket.remoteAddress || '';
    const ipHash = createHash('sha256').update(ipSource).digest('hex');
    await query(
      `INSERT INTO page_views (business_id, path, referrer, user_agent, ip_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [payload.businessId || null, payload.path, payload.referrer, req.get('user-agent') || '', ipHash]
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/summary', authRequired, roleRequired('admin'), async (_req, res, next) => {
  try {
    const [views, topPages, topBusinesses, history, plans] = await Promise.all([
      query(
        `SELECT
          COUNT(*)::int AS total_views,
          COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '7 days')::int AS views_7d,
          COUNT(DISTINCT ip_hash)::int AS unique_visitors
         FROM page_views`
      ),
      query(
        `SELECT path, COUNT(*)::int AS views
         FROM page_views
         GROUP BY path
         ORDER BY views DESC
         LIMIT 10`
      ),
      query(
        `SELECT b.id, b.name, COUNT(pv.id)::int AS views
         FROM businesses b
         LEFT JOIN page_views pv ON pv.business_id = b.id
         GROUP BY b.id
         ORDER BY views DESC, b.name
         LIMIT 10`
      ),
      query(
        `SELECT
          d.day::date AS date,
          COUNT(pv.id)::int AS views
         FROM GENERATE_SERIES(current_date - INTERVAL '6 days', current_date, '1 day') AS d(day)
         LEFT JOIN page_views pv ON pv.created_at::date = d.day::date
         GROUP BY d.day
         ORDER BY d.day`
      ),
      query(
        `SELECT plan, COUNT(*)::int AS count
         FROM businesses
         GROUP BY plan`
      ),
    ]);

    res.json({
      totalViews: views.rows[0]?.total_views || 0,
      views7d: views.rows[0]?.views_7d || 0,
      uniqueVisitors: views.rows[0]?.unique_visitors || 0,
      topPages: topPages.rows,
      topBusinesses: topBusinesses.rows,
      views7dHistory: history.rows.map(row => ({
        date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10),
        views: row.views
      })),
      planDistribution: plans.rows,
    });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/business/:id', authRequired, roleRequired('admin', 'client'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        COUNT(*)::int AS total_views,
        COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '7 days')::int AS views_7d,
        COUNT(DISTINCT ip_hash)::int AS unique_visitors
       FROM page_views
       WHERE business_id = $1`,
      [req.params.id]
    );
    res.json({
      totalViews: result.rows[0]?.total_views || 0,
      views7d: result.rows[0]?.views_7d || 0,
      uniqueVisitors: result.rows[0]?.unique_visitors || 0,
    });
  } catch (error) {
    next(error);
  }
});
