import express from 'express';
import { supabase } from '../index.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply rate limiting to all event routes
router.use(apiLimiter);

/**
 * GET /api/events
 * Query params:
 *   - city      (default: 'Toronto')
 *   - month     (1-12)
 *   - year      (e.g. 2026)
 *   - category  (e.g. 'Concerts')
 *   - limit     (default: 200)
 *   - offset    (default: 0)
 */
router.get('/', async (req, res) => {
  try {
    const {
      city = 'Toronto',
      month,
      year,
      category,
      limit = 200,
      offset = 0,
    } = req.query;

    let query = supabase
      .from('events')
      .select(`
        id,
        source,
        source_id,
        title,
        description,
        category,
        subcategory,
        event_date,
        start_time,
        end_time,
        price_min,
        price_max,
        currency,
        ticket_url,
        image_url,
        popularity_score,
        is_verified,
        venues (
          id,
          name,
          address,
          city,
          latitude,
          longitude,
          capacity,
          website
        )
      `)
      .eq('is_verified', true)
      .order('event_date', { ascending: true })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Filter by city via venue
    if (city) {
      query = query.eq('venues.city', city);
    }

    // Filter by month/year
    if (month && year) {
      const paddedMonth = String(month).padStart(2, '0');
      const startDate = `${year}-${paddedMonth}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month
      query = query.gte('event_date', startDate).lte('event_date', endDate);
    } else if (year) {
      query = query.gte('event_date', `${year}-01-01`).lte('event_date', `${year}-12-31`);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      events: data || [],
      total: count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err) {
    console.error('GET /api/events error:', err);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

/**
 * GET /api/events/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venues (*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json(data);
  } catch (err) {
    console.error('GET /api/events/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

/**
 * POST /api/events/submit
 * Public event submission (creates unverified event)
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      title,
      category,
      event_date,
      start_time,
      end_time,
      venue_id,
      price_min,
      price_max,
      ticket_url,
      description,
      image_url,
    } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ error: 'title and event_date are required.' });
    }

    const { data, error } = await supabase
      .from('events')
      .insert([{
        source: 'user_submission',
        title,
        category,
        event_date,
        start_time,
        end_time,
        venue_id,
        price_min,
        price_max,
        ticket_url,
        description,
        image_url,
        is_verified: false,
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, event: data });
  } catch (err) {
    console.error('POST /api/events/submit error:', err);
    res.status(500).json({ error: 'Failed to submit event.' });
  }
});

export default router;
