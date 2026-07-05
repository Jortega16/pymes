import { Router } from 'express';
import { z } from 'zod';
import { authRequired, roleRequired } from '../auth.js';
import { query } from '../db/pool.js';

export const subscriptionsRouter = Router();

subscriptionsRouter.use(authRequired, roleRequired('admin'));

const subscriptionSchema = z.object({
  businessId: z.coerce.number().int().positive(),
  plan: z.enum(['starter', 'growth', 'premium']),
  status: z.enum(['trialing', 'active', 'past_due', 'paused', 'canceled']),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']),
  amountCents: z.coerce.number().int().min(0),
  currency: z.string().default('CRC'),
  nextPaymentAt: z.string().optional().nullable(),
  lastPaymentAt: z.string().optional().nullable(),
  paymentMethod: z.string().default(''),
});

function toSubscription(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: row.business_name,
    plan: row.plan,
    status: row.status,
    billingCycle: row.billing_cycle,
    amountCents: row.amount_cents,
    currency: row.currency,
    nextPaymentAt: row.next_payment_at,
    lastPaymentAt: row.last_payment_at,
    paymentMethod: row.payment_method,
  };
}

subscriptionsRouter.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT s.*, b.name AS business_name
       FROM subscriptions s
       JOIN businesses b ON b.id = s.business_id
       ORDER BY s.next_payment_at ASC NULLS LAST, b.name`
    );
    res.json(result.rows.map(toSubscription));
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.put('/:id', async (req, res, next) => {
  try {
    const payload = subscriptionSchema.parse(req.body);
    const result = await query(
      `UPDATE subscriptions SET
        business_id = $1,
        plan = $2,
        status = $3,
        billing_cycle = $4,
        amount_cents = $5,
        currency = $6,
        next_payment_at = $7,
        last_payment_at = $8,
        payment_method = $9,
        updated_at = now()
       WHERE id = $10
       RETURNING *`,
      [
        payload.businessId,
        payload.plan,
        payload.status,
        payload.billingCycle,
        payload.amountCents,
        payload.currency,
        payload.nextPaymentAt || null,
        payload.lastPaymentAt || null,
        payload.paymentMethod,
        req.params.id,
      ]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Subscription not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.post('/:id/payments', async (req, res, next) => {
  try {
    const payload = z.object({
      amountCents: z.coerce.number().int().min(0),
      status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('paid'),
      dueAt: z.string().optional().nullable(),
      paidAt: z.string().optional().nullable(),
      reference: z.string().default(''),
      notes: z.string().default(''),
    }).parse(req.body);

    const subscription = await query('SELECT * FROM subscriptions WHERE id = $1', [req.params.id]);
    if (!subscription.rowCount) return res.status(404).json({ message: 'Subscription not found' });

    const row = subscription.rows[0];
    const result = await query(
      `INSERT INTO payments (subscription_id, business_id, amount_cents, currency, status, due_at, paid_at, reference, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [row.id, row.business_id, payload.amountCents, row.currency, payload.status, payload.dueAt || null, payload.paidAt || null, payload.reference, payload.notes]
    );

    if (payload.status === 'paid') {
      await query(
        `UPDATE subscriptions
         SET last_payment_at = COALESCE($1::date, CURRENT_DATE),
             next_payment_at = COALESCE($1::date, CURRENT_DATE) + INTERVAL '1 month',
             status = 'active',
             updated_at = now()
         WHERE id = $2`,
        [payload.paidAt || null, row.id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.get('/payments', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*, b.name AS business_name
       FROM payments p
       JOIN businesses b ON b.id = p.business_id
       ORDER BY p.created_at DESC
       LIMIT 100`
    );
    res.json(result.rows.map((row) => ({
      id: row.id,
      businessId: row.business_id,
      businessName: row.business_name,
      amountCents: row.amount_cents,
      currency: row.currency,
      status: row.status,
      dueAt: row.due_at,
      paidAt: row.paid_at,
      reference: row.reference,
      notes: row.notes,
      createdAt: row.created_at,
    })));
  } catch (error) {
    next(error);
  }
});
