import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import eventsRouter from './routes/events.js';
import venuesRouter from './routes/venues.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Supabase client ──────────────────────────────────────────────────────────
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/events', eventsRouter);
app.use('/api/venues', venuesRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`EventPulse API running on port ${PORT}`);
});
