import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { businessesRouter } from './routes/businesses.js';
import { analyticsRouter } from './routes/analytics.js';
import { authRouter } from './routes/auth.js';
import { categoriesRouter } from './routes/categories.js';
import { clientRouter } from './routes/client.js';
import { couponsRouter } from './routes/coupons.js';
import { requestsRouter } from './routes/requests.js';
import { subscriptionsRouter } from './routes/subscriptions.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:4300', 'http://127.0.0.1:4300'] }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pymes-directory-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/businesses', businessesRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/client', clientRouter);

app.use((error, _req, res, _next) => {
  if (error?.name === 'ZodError') {
    return res.status(400).json({ message: 'Invalid payload', issues: error.issues });
  }

  console.error(error);
  res.status(500).json({ message: 'Unexpected server error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API running on http://0.0.0.0:${port}`);
});
