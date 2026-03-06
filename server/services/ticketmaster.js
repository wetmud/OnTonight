/**
 * Ticketmaster Discovery API service
 * Fetches and normalizes GTA events into our schema
 */

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const API_KEY = process.env.TICKETMASTER_API_KEY;

const CATEGORY_MAP = {
  'Music': 'Concerts',
  'Sports': 'Sports',
  'Arts & Theatre': 'Theatre',
  'Film': 'Other',
  'Miscellaneous': 'Other',
  'Comedy': 'Comedy',
  'Family': 'Festivals',
};

/**
 * Sleep helper for rate limiting backoff
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch one page of events from Ticketmaster with retry/backoff
 */
async function fetchPage(page = 0, retries = 3) {
  const url = new URL(BASE_URL);
  url.searchParams.set('apikey', API_KEY);
  url.searchParams.set('city', 'Toronto');
  url.searchParams.set('countryCode', 'CA');
  url.searchParams.set('radius', '80');
  url.searchParams.set('unit', 'km');
  url.searchParams.set('size', '200');
  url.searchParams.set('page', page);
  url.searchParams.set('sort', 'date,asc');

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url.toString());

      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 1000;
        console.log(`Ticketmaster rate limited. Waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        throw new Error(`Ticketmaster API error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await sleep(Math.pow(2, attempt) * 500);
    }
  }
}

/**
 * Normalize a raw Ticketmaster event into our schema shape
 */
function normalizeEvent(raw) {
  try {
    const venue = raw._embedded?.venues?.[0];
    const segment = raw.classifications?.[0]?.segment?.name;
    const genre = raw.classifications?.[0]?.genre?.name;

    const priceRange = raw.priceRanges?.[0];
    const image = raw.images?.find(i => i.ratio === '16_9' && i.width > 500)
      || raw.images?.[0];

    // Parse date/time
    const dateObj = raw.dates?.