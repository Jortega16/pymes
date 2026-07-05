import { Router } from 'express';
import { z } from 'zod';
import { signToken, verifyPassword, authRequired } from '../auth.js';
import { query } from '../db/pool.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const payload = z.object({
      email: z.string().email(),
      password: z.string().min(1),
      role: z.enum(['admin', 'client']).optional(),
    }).parse(req.body);

    const result = await query('SELECT * FROM users WHERE lower(email) = lower($1) AND active = true', [payload.email]);
    if (!result.rowCount) return res.status(401).json({ message: 'Credenciales inválidas' });

    const user = result.rows[0];
    if (payload.role && user.role !== payload.role) return res.status(403).json({ message: 'Rol no autorizado' });
    if (!verifyPassword(payload.password, user.password_hash)) return res.status(401).json({ message: 'Credenciales inválidas' });

    res.json({
      token: signToken(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessId: user.business_id,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authRequired, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    businessId: req.user.business_id,
  });
});
