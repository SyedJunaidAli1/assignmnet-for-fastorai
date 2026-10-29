import express from 'express';

import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'CRM Backend API',
    docs: '/api',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
      public: ['POST /api/public/leads', 'GET /api/public/leads'],
      counselor: ['GET /api/leads/public', 'POST /api/leads/:id/claim', 'GET /api/leads/mine'],
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes); // no auth - the enquiry form must be public
app.use('/api/leads', leadRoutes); // JWT protected - counselor CRM views

app.use(errorHandler);

export default app;
