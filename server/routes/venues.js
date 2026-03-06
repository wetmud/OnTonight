import express from 'express';
import { supabase } from '../index.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
router.use(apiLimiter);

/**
 * GET /api/venues
 * Query params: city, limit, offset
 */
router.get('/', async (req, res) => {
  try {
    const { city = 'Toronto', limit = 100, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('city', city)
      .order('name', { ascending: true })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({ venues: data || [] });
  } catch (err) {
    console.error('GET /api/venues error:', err);
    res.status(500).json({ error: 'Failed to fetch venues.' });
  }
});

/**
 * GET /api/venues/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Venue not found.' });
    }

    res.json(data);
  } catch (err) {
    console.error('GET /api/venues/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch venue.' });
  }
});

export default router;
