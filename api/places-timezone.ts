// api/places-timezone.ts — Proxy to Google Timezone API
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

  const { lat, lng, timestamp } = req.query;
  if (!lat || !lng || !timestamp) {
    return res.status(400).json({ error: 'Missing lat, lng, or timestamp' });
  }

  // Validate numeric ranges
  const latNum = parseFloat(lat as string);
  const lngNum = parseFloat(lng as string);
  if (isNaN(latNum) || latNum < -90 || latNum > 90 || isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const apiKey = process.env.GOOGLE_MAPS_KEY;
  const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${latNum},${lngNum}&timestamp=${encodeURIComponent(timestamp as string)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return res.status(200).json(data);
}
