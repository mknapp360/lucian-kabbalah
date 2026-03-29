// api/places-autocomplete.ts — Proxy to Google Places Autocomplete (cities only)
import type { VercelRequest, VercelResponse } from '@vercel/node';

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;      // autocomplete fires on keystrokes, needs higher limit
const RATE_WINDOW = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { input } = req.query;
  if (!input || typeof input !== 'string' || input.length > 200) {
    return res.status(400).json({ error: 'Missing or invalid input' });
  }

  const apiKey = process.env.GOOGLE_MAPS_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return res.status(200).json(data);
}
