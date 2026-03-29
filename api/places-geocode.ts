// api/places-geocode.ts — Proxy to Google Geocoding API
import type { VercelRequest, VercelResponse } from '@vercel/node';

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15;
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

  const { placeId } = req.query;
  if (!placeId || typeof placeId !== 'string' || placeId.length > 300) {
    return res.status(400).json({ error: 'Missing or invalid placeId' });
  }

  const apiKey = process.env.GOOGLE_MAPS_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(placeId)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return res.status(200).json(data);
}
