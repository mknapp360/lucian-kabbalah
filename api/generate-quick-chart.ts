// api/generate-quick-chart.ts
// Generates a single-page Quick Chart PDF with pathway breakdowns
// Calls TarotPathwork's ephemeris endpoint for planetary positions

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createRequire } from 'node:module'

const _require = createRequire(import.meta.url)
const PDFDocument = _require('pdfkit')

// ─── Rate limiting (in-memory, per Vercel instance) ──────────────────────────

const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10       // max requests per window
const RATE_WINDOW = 60_000  // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

// ─── Ephemeris: call TarotPathwork's Python endpoint ─────────────────────────

const PLANET_NAMES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const

interface PlanetPosition {
  sign: string
  degree: number
  longitude: number
  speed: number
  isRetrograde: boolean
}

async function calculatePlanetaryPositions(date: Date): Promise<Record<string, PlanetPosition>> {
  const url = process.env.EPHEMERIS_URL || 'https://www.tarotpathwork.com/api/ephemeris'
  const body = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown')
    throw new Error(`Ephemeris API error (${res.status}): ${text}`)
  }

  return res.json()
}

// ─── Natal chart calculator (ported from TarotPathwork) ──────────────────────

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
}

const ELEMENT_WORLDS: Record<string, string> = {
  Fire: 'Atziluth', Water: 'Briah', Air: 'Yetzirah', Earth: 'Assiah',
}

const PLANETARY_INHERENT_WORLD: Record<string, string> = {
  Sun: 'Yetzirah', Moon: 'Assiah', Mercury: 'Yetzirah', Venus: 'Yetzirah',
  Mars: 'Briah', Jupiter: 'Briah', Saturn: 'Briah',
  Uranus: 'Atziluth', Neptune: 'Atziluth', Pluto: 'Atziluth',
}

const CLASSICAL_DIGNITIES: Record<string, {
  domicile: string[]; exalted: string[]; detriment: string[]; fall: string[]
}> = {
  Sun: { domicile: ['Leo'], exalted: ['Aries'], detriment: ['Aquarius'], fall: ['Libra'] },
  Moon: { domicile: ['Cancer'], exalted: ['Taurus'], detriment: ['Capricorn'], fall: ['Scorpio'] },
  Mercury: { domicile: ['Gemini', 'Virgo'], exalted: ['Virgo'], detriment: ['Sagittarius', 'Pisces'], fall: ['Pisces'] },
  Venus: { domicile: ['Taurus', 'Libra'], exalted: ['Pisces'], detriment: ['Aries', 'Scorpio'], fall: ['Virgo'] },
  Mars: { domicile: ['Aries', 'Scorpio'], exalted: ['Capricorn'], detriment: ['Taurus', 'Libra'], fall: ['Cancer'] },
  Jupiter: { domicile: ['Sagittarius', 'Pisces'], exalted: ['Cancer'], detriment: ['Gemini', 'Virgo'], fall: ['Capricorn'] },
  Saturn: { domicile: ['Capricorn', 'Aquarius'], exalted: ['Libra'], detriment: ['Cancer', 'Leo'], fall: ['Aries'] },
}

function getDignity(planet: string, sign: string): string {
  if (!CLASSICAL_DIGNITIES[planet]) return 'neutral'
  const d = CLASSICAL_DIGNITIES[planet]
  if (d.domicile.includes(sign)) return 'domicile'
  if (d.exalted.includes(sign)) return 'exalted'
  if (d.fall.includes(sign)) return 'fall'
  if (d.detriment.includes(sign)) return 'detriment'
  return 'peregrine'
}

function getPolarityLean(dignity: string): string {
  if (dignity === 'domicile') return 'strong_positive'
  if (dignity === 'exalted') return 'positive'
  if (dignity === 'detriment') return 'negative'
  if (dignity === 'fall') return 'strong_negative'
  return 'neutral'
}

function leanLabel(lean: string): string {
  const map: Record<string, string> = {
    strong_positive: 'Strong toward',
    positive: 'Leaning toward',
    neutral: 'Balanced between',
    negative: 'Leaning toward',
    strong_negative: 'Strong toward',
  }
  return map[lean] || lean
}

function dignityLabel(d: string): string {
  const map: Record<string, string> = {
    domicile: 'Domicile', exalted: 'Exalted', peregrine: 'Peregrine',
    detriment: 'Detriment', fall: 'Fall',
  }
  return map[d] || d
}

interface SimplePosition { sign: string; degree: number }

async function calculateChart(year: number, month: number, day: number, hour: number, minute: number) {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  const ephemerisPositions = await calculatePlanetaryPositions(date)

  const planets: Record<string, SimplePosition> = {}
  for (const name of PLANET_NAMES) {
    const pos = ephemerisPositions[name]
    planets[name] = { sign: pos.sign, degree: pos.degree }
  }

  const worldScores: Record<string, number> = { Atziluth: 0, Briah: 0, Yetzirah: 0, Assiah: 0 }
  for (const planet of PLANET_NAMES) {
    worldScores[PLANETARY_INHERENT_WORLD[planet]] += 3
    const element = SIGN_ELEMENTS[planets[planet].sign]
    worldScores[ELEMENT_WORLDS[element]] += 2
  }

  const totalScore = Object.values(worldScores).reduce((a, b) => a + b, 0)
  const worldPercentages: Record<string, number> = {}
  let dominantWorld = 'Yetzirah', lowestWorld = 'Assiah'
  let maxScore = -1, minScore = Infinity

  for (const [world, score] of Object.entries(worldScores)) {
    worldPercentages[world] = Math.round((score / totalScore) * 1000) / 10
    if (score > maxScore) { maxScore = score; dominantWorld = world }
    if (score < minScore) { minScore = score; lowestWorld = world }
  }

  return { planets, worldPercentages, dominantWorld, lowestWorld }
}

// ─── Double letter path data ─────────────────────────────────────────────────

const DOUBLE_LETTERS = [
  { letter: 'Beth (ב)', planet: 'Saturn', from: 'Kether', to: 'Binah', positive: 'Life', negative: 'Death' },
  { letter: 'Gimel (ג)', planet: 'Jupiter', from: 'Kether', to: 'Tiphereth', positive: 'Peace', negative: 'Evil' },
  { letter: 'Daleth (ד)', planet: 'Mars', from: 'Chokmah', to: 'Binah', positive: 'Wisdom', negative: 'Folly' },
  { letter: 'Kaph (כ)', planet: 'Sun', from: 'Chesed', to: 'Netzach', positive: 'Wealth', negative: 'Poverty' },
  { letter: 'Pe (פ)', planet: 'Venus', from: 'Netzach', to: 'Hod', positive: 'Prosperity', negative: 'Desolation' },
  { letter: 'Resh (ר)', planet: 'Mercury', from: 'Hod', to: 'Yesod', positive: 'Beauty', negative: 'Ugliness' },
  { letter: 'Tav (ת)', planet: 'Moon', from: 'Yesod', to: 'Malkuth', positive: 'Mastery', negative: 'Slavery' },
]

const PLANETARY_SEPHIROT: Record<string, string> = {
  Sun: 'Tiphereth', Moon: 'Yesod', Mercury: 'Hod', Venus: 'Netzach',
  Mars: 'Geburah', Jupiter: 'Chesed', Saturn: 'Binah',
  Uranus: 'Chokmah', Neptune: 'Kether', Pluto: 'Daath',
}

const PILLAR_LABELS: Record<string, string> = {
  Moon: 'Emotional Foundation', Mercury: 'Communication & Perception',
  Venus: 'Love & Attraction', Sun: 'Identity & Self-Expression',
  Mars: 'Boundaries & Assertiveness', Jupiter: 'Growth & Generosity',
  Saturn: 'Structure & Legacy',
}

// ─── PDF generation ──────────────────────────────────────────────────────────

const GOLD = '#bb9258'
const INK = '#1a1612'
const MID = '#3d352d'
const LIGHT = '#6b6155'
const PARCHMENT = '#f5f0e8'

const DIGNITY_COLORS: Record<string, string> = {
  exalted: '#b8943f',
  domicile: '#5a8a5a',
  peregrine: '#8a7f6f',
  detriment: '#c07030',
  fall: '#a04040',
}

const WORLD_COLORS: Record<string, string> = {
  Atziluth: '#8b3a4a', Briah: '#3a4a6b', Yetzirah: '#bb9258', Assiah: '#4a5a4a',
}

function generateQuickChartPDF(
  birthInfo: { name: string; date: string; time: string; location: string },
  planets: Record<string, SimplePosition>,
  worldPercentages: Record<string, number>,
  dominantWorld: string,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 36, bufferPages: true })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pw = 612 - 72 // page width minus margins

    // ── Title ──────────────────────────────────────────────────────────
    doc.moveDown(0.5)
    doc.fontSize(22).font('Helvetica-Bold').fillColor(GOLD)
      .text('Natal Quick Chart', { align: 'center' })
    doc.moveDown(0.15)
    doc.fontSize(16).font('Helvetica-Bold').fillColor(INK)
      .text(birthInfo.name, { align: 'center' })
    doc.moveDown(0.1)
    doc.fontSize(9).font('Helvetica').fillColor(LIGHT)
      .text(`${birthInfo.date}  |  ${birthInfo.time}  |  ${birthInfo.location}`, { align: 'center' })

    // Gold rule
    doc.moveDown(0.5)
    const ruleY = doc.y
    doc.moveTo(36, ruleY).lineTo(576, ruleY).strokeColor(GOLD).lineWidth(1).opacity(0.6).stroke()
    doc.opacity(1)
    doc.moveDown(0.5)

    // ── Two-column layout ──────────────────────────────────────────────
    const colLeft = 36
    const colRight = 310
    const colWidth = 260

    // LEFT COLUMN: Tree of Life Activation + Four Worlds
    const startY = doc.y

    doc.fontSize(11).font('Helvetica-Bold').fillColor(GOLD).text('Tree of Life Activation', colLeft, startY, { width: colWidth })
    doc.moveDown(0.3)

    const planetList = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    for (const planet of planetList) {
      const data = planets[planet]
      if (!data) continue
      const seph = PLANETARY_SEPHIROT[planet] || ''
      const dignity = getDignity(planet, data.sign)
      const isClassical = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(planet)
      const dignityStr = isClassical ? `  (${dignityLabel(dignity)})` : ''

      doc.fontSize(8).font('Helvetica-Bold').fillColor(INK)
        .text(`${planet}`, colLeft, doc.y, { continued: true, width: colWidth })
      doc.font('Helvetica').fillColor(MID)
        .text(`  ${data.sign} ${data.degree.toFixed(1)}°  →  ${seph}`, { continued: true })
      if (isClassical) {
        doc.fillColor(DIGNITY_COLORS[dignity] || LIGHT)
          .text(dignityStr, { continued: false })
      } else {
        doc.text('', { continued: false })
      }
      doc.moveDown(0.05)
    }

    // Four Worlds
    doc.moveDown(0.5)
    doc.fontSize(11).font('Helvetica-Bold').fillColor(GOLD).text('Four Worlds', colLeft, doc.y, { width: colWidth })
    doc.moveDown(0.3)

    const worlds = ['Atziluth', 'Briah', 'Yetzirah', 'Assiah'] as const
    for (const world of worlds) {
      const pct = worldPercentages[world] || 0
      const isDominant = world === dominantWorld
      const barLen = Math.max(Math.round(pct / 100 * 25), 1)
      const bar = '\u2588'.repeat(barLen)
      const suffix = isDominant ? '  PRIMARY' : ''

      doc.fontSize(isDominant ? 9 : 8)
        .font(isDominant ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(WORLD_COLORS[world])
        .text(`${world.padEnd(12)} ${bar}  ${pct}%${suffix}`, colLeft, doc.y, { width: colWidth })
      doc.moveDown(0.1)
    }

    // Stelliums
    const signPlanets: Record<string, string[]> = {}
    for (const [planet, data] of Object.entries(planets)) {
      if (!signPlanets[data.sign]) signPlanets[data.sign] = []
      signPlanets[data.sign].push(planet)
    }
    const stelliums = Object.entries(signPlanets)
      .filter(([_, list]) => list.length >= 3)
      .map(([sign, list]) => ({ sign, planets: list }))

    if (stelliums.length > 0) {
      doc.moveDown(0.5)
      doc.fontSize(11).font('Helvetica-Bold').fillColor(GOLD).text('Stelliums', colLeft, doc.y, { width: colWidth })
      doc.moveDown(0.2)
      for (const s of stelliums) {
        doc.fontSize(8).font('Helvetica').fillColor(MID)
          .text(`${s.sign}: ${s.planets.join(', ')}`, colLeft, doc.y, { width: colWidth })
        doc.moveDown(0.05)
      }
    }

    // Dignity summary
    const classicalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
    const allDignities = classicalPlanets.map(p => getDignity(p, planets[p].sign))
    const dignifiedCount = allDignities.filter(d => d === 'domicile' || d === 'exalted').length
    const debilitatedCount = allDignities.filter(d => d === 'detriment' || d === 'fall').length
    const peregrineCount = allDignities.filter(d => d === 'peregrine').length

    doc.moveDown(0.5)
    doc.fontSize(11).font('Helvetica-Bold').fillColor(GOLD).text('Dignity Summary', colLeft, doc.y, { width: colWidth })
    doc.moveDown(0.2)
    doc.fontSize(8).font('Helvetica').fillColor(MID)
      .text(`Dignified: ${dignifiedCount}  |  Peregrine: ${peregrineCount}  |  Debilitated: ${debilitatedCount}`, colLeft, doc.y, { width: colWidth })

    // RIGHT COLUMN: Seven Pathway Breakdowns
    doc.fontSize(11).font('Helvetica-Bold').fillColor(GOLD).text('The Seven Pathways', colRight, startY, { width: colWidth })
    let rightY = startY + 18

    for (const dl of DOUBLE_LETTERS) {
      const data = planets[dl.planet]
      const dignity = getDignity(dl.planet, data.sign)
      const lean = getPolarityLean(dignity)
      const color = DIGNITY_COLORS[dignity] || LIGHT

      // Determine which polarity the path leans toward
      let leanTarget: string
      if (lean.includes('positive')) {
        leanTarget = dl.positive
      } else if (lean.includes('negative')) {
        leanTarget = dl.negative
      } else {
        leanTarget = `${dl.positive} / ${dl.negative}`
      }

      // Path header
      doc.fontSize(9).font('Helvetica-Bold').fillColor(color)
        .text(`${dl.letter}  —  ${dl.planet}`, colRight, rightY, { width: colWidth })
      rightY += 12

      // Path details
      doc.fontSize(7.5).font('Helvetica').fillColor(MID)
        .text(`${dl.from} ↔ ${dl.to}  |  ${data.sign} ${data.degree.toFixed(1)}°  |  ${dignityLabel(dignity)}`, colRight, rightY, { width: colWidth })
      rightY += 10

      // Polarity
      doc.fontSize(7.5).font('Helvetica').fillColor(INK)
        .text(`Polarity: ${dl.positive} / ${dl.negative}`, colRight, rightY, { continued: true, width: colWidth })
      doc.font('Helvetica-Bold').fillColor(color)
        .text(`  →  ${leanLabel(lean)} ${leanTarget}`)
      rightY += 11

      // Pillar label
      const pillarLabel = PILLAR_LABELS[dl.planet]
      doc.fontSize(7).font('Helvetica').fillColor(LIGHT)
        .text(`Pillar: ${pillarLabel}`, colRight, rightY, { width: colWidth })
      rightY += 14

      // Separator line
      doc.moveTo(colRight, rightY).lineTo(colRight + colWidth - 10, rightY)
        .strokeColor(GOLD).lineWidth(0.3).opacity(0.4).stroke()
      doc.opacity(1)
      rightY += 8
    }

    // ── Interpretation Guide (bottom section, full width) ────────────
    const bottomY = Math.max(doc.y + 10, rightY + 5)
    doc.moveTo(36, bottomY).lineTo(576, bottomY).strokeColor(GOLD).lineWidth(1).opacity(0.6).stroke()
    doc.opacity(1)

    doc.fontSize(9).font('Helvetica-Bold').fillColor(GOLD)
      .text('Reading Your Chart', 36, bottomY + 8, { width: pw })
    doc.moveDown(0.2)

    doc.fontSize(7).font('Helvetica').fillColor(MID)
      .text(
        'Start from the foundation (bottom of the Tree) and read upward. ' +
        'Moon (Tav), Mercury (Resh), and Venus (Pe) form your emotional and relational base. ' +
        'Sun (Kaph) at the center represents your core identity. ' +
        'Mars (Daleth), Jupiter (Gimel), and Saturn (Beth) shape your higher structures. ' +
        'Dignified planets lean toward the aligned polarity. Debilitated planets lean toward the shadow expression. ' +
        'Peregrine planets are balanced, with neither polarity dominating by default.',
        36, doc.y, { width: pw, lineGap: 2 }
      )

    // Footer
    doc.moveDown(0.3)
    doc.moveTo(36, doc.y).lineTo(576, doc.y).strokeColor(GOLD).lineWidth(0.3).opacity(0.3).stroke()
    doc.opacity(1)
    doc.moveDown(0.2)
    doc.fontSize(7).font('Helvetica').fillColor(LIGHT)
      .text('LucianKabbalah.com  |  Sefer Yetzirah planetary attributions (Hayman critical edition)', 36, doc.y, { width: pw / 2, align: 'left' })

    doc.end()
  })
}

// ─── Main handler ────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limit by IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' })
  }

  const { name, birthDate, birthTime, latitude, longitude, birthLocation } = req.body

  if (!name || !birthDate || !birthTime || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, birthDate, birthTime, latitude, longitude' })
  }

  // Input validation
  if (typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ error: 'Name must be a string under 100 characters' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return res.status(400).json({ error: 'birthDate must be YYYY-MM-DD format' })
  }
  if (!/^\d{2}:\d{2}$/.test(birthTime)) {
    return res.status(400).json({ error: 'birthTime must be HH:MM format' })
  }
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90 ||
      typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid coordinates' })
  }

  try {
    // Convert local time to UTC using Google Timezone API
    const localDateTime = new Date(`${birthDate}T${birthTime}:00`)
    let utcOffsetSeconds = 0

    try {
      const apiKey = process.env.GOOGLE_MAPS_KEY
      const tzRes = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${Math.floor(localDateTime.getTime() / 1000)}&key=${apiKey}`
      )
      if (tzRes.ok) {
        const tzData = await tzRes.json()
        utcOffsetSeconds = (tzData.rawOffset || 0) + (tzData.dstOffset || 0)
      }
    } catch { /* fallback: treat as UTC */ }

    const utcDate = new Date(localDateTime.getTime() - utcOffsetSeconds * 1000)

    const chart = await calculateChart(
      utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1,
      utcDate.getUTCDate(), utcDate.getUTCHours(), utcDate.getUTCMinutes()
    )

    const birthInfo = {
      name,
      date: birthDate,
      time: birthTime,
      location: birthLocation || 'Unknown',
    }

    const pdfBuffer = await generateQuickChartPDF(
      birthInfo,
      chart.planets,
      chart.worldPercentages,
      chart.dominantWorld,
    )

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="quick-chart-${name.replace(/\s+/g, '-').toLowerCase()}.pdf"`)
    return res.send(pdfBuffer)

  } catch (err: any) {
    console.error('Quick chart generation error:', err)
    return res.status(500).json({ error: err.message || 'Failed to generate chart' })
  }
}
