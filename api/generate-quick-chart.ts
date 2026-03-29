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
  { letter: 'Beth', abbr: 'B', planet: 'Saturn', from: 'Kether', to: 'Binah', positive: 'Life', negative: 'Death' },
  { letter: 'Gimel', abbr: 'G', planet: 'Jupiter', from: 'Kether', to: 'Tiphereth', positive: 'Peace', negative: 'Evil' },
  { letter: 'Daleth', abbr: 'D', planet: 'Mars', from: 'Chokmah', to: 'Binah', positive: 'Wisdom', negative: 'Folly' },
  { letter: 'Kaph', abbr: 'K', planet: 'Sun', from: 'Chesed', to: 'Netzach', positive: 'Wealth', negative: 'Poverty' },
  { letter: 'Pe', abbr: 'P', planet: 'Venus', from: 'Netzach', to: 'Hod', positive: 'Prosperity', negative: 'Desolation' },
  { letter: 'Resh', abbr: 'R', planet: 'Mercury', from: 'Hod', to: 'Yesod', positive: 'Beauty', negative: 'Ugliness' },
  { letter: 'Tav', abbr: 'T', planet: 'Moon', from: 'Yesod', to: 'Malkuth', positive: 'Mastery', negative: 'Slavery' },
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

// ─── Tree of Life layout (coordinates for PDF drawing) ───────────────────────

const SEPHIROT_POS: Record<string, { x: number; y: number }> = {
  Kether:    { x: 150, y: 30 },
  Chokmah:   { x: 250, y: 80 },
  Binah:     { x: 50,  y: 80 },
  Chesed:    { x: 250, y: 180 },
  Geburah:   { x: 50,  y: 180 },
  Tiphereth: { x: 150, y: 230 },
  Netzach:   { x: 250, y: 310 },
  Hod:       { x: 50,  y: 310 },
  Yesod:     { x: 150, y: 370 },
  Malkuth:   { x: 150, y: 430 },
}

// All 22 paths: [from, to, type]
const ALL_PATHS: [string, string, string][] = [
  // Mother letters
  ['Kether', 'Chokmah', 'mother'],
  ['Geburah', 'Hod', 'mother'],
  ['Hod', 'Malkuth', 'mother'],
  // Double letters (highlighted with dignity color)
  ['Kether', 'Binah', 'double'],
  ['Kether', 'Tiphereth', 'double'],
  ['Chokmah', 'Binah', 'double'],
  ['Chesed', 'Netzach', 'double'],
  ['Netzach', 'Hod', 'double'],
  ['Hod', 'Yesod', 'double'],
  ['Yesod', 'Malkuth', 'double'],
  // Simple letters
  ['Chokmah', 'Tiphereth', 'simple'],
  ['Chokmah', 'Chesed', 'simple'],
  ['Binah', 'Tiphereth', 'simple'],
  ['Binah', 'Geburah', 'simple'],
  ['Chesed', 'Geburah', 'simple'],
  ['Chesed', 'Tiphereth', 'simple'],
  ['Geburah', 'Tiphereth', 'simple'],
  ['Tiphereth', 'Netzach', 'simple'],
  ['Tiphereth', 'Yesod', 'simple'],
  ['Tiphereth', 'Hod', 'simple'],
  ['Netzach', 'Yesod', 'simple'],
  ['Netzach', 'Malkuth', 'simple'],
]

function findDoubleLetterForPath(from: string, to: string) {
  return DOUBLE_LETTERS.find(
    dl => (dl.from === from && dl.to === to) || (dl.from === to && dl.to === from)
  ) || null
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
    const sephR = 16    // sephirah circle radius
    const pathLabelR = 8 // path label circle radius

    // ── Title ──────────────────────────────────────────────────────────
    doc.moveDown(0.3)
    doc.fontSize(20).font('Helvetica-Bold').fillColor(GOLD)
      .text('Natal Quick Chart', { align: 'center' })
    doc.moveDown(0.1)
    doc.fontSize(14).font('Helvetica-Bold').fillColor(INK)
      .text(birthInfo.name, { align: 'center' })
    doc.moveDown(0.05)
    doc.fontSize(8.5).font('Helvetica').fillColor(LIGHT)
      .text(`${birthInfo.date}  |  ${birthInfo.time}  |  ${birthInfo.location}`, { align: 'center' })

    // Gold rule
    doc.moveDown(0.4)
    const ruleY = doc.y
    doc.moveTo(36, ruleY).lineTo(576, ruleY).strokeColor(GOLD).lineWidth(1).opacity(0.6).stroke()
    doc.opacity(1)

    // ══════════════════════════════════════════════════════════════════
    // TWO-COLUMN LAYOUT
    // Left: Tree of Life graphic (drawn) + planetary positions beneath
    // Right: Seven Pathways + Four Worlds + Dignity Summary
    // ══════════════════════════════════════════════════════════════════

    const treeOffsetX = 36    // left margin for tree area
    const treeOffsetY = ruleY + 10
    const colRight = 320
    const colRightW = 250
    const startY = treeOffsetY

    // ── LEFT: Draw Tree of Life ────────────────────────────────────────

    // Draw all 22 paths
    for (const [from, to, type] of ALL_PATHS) {
      const f = SEPHIROT_POS[from]
      const t = SEPHIROT_POS[to]
      const fx = treeOffsetX + f.x
      const fy = treeOffsetY + f.y
      const tx = treeOffsetX + t.x
      const ty = treeOffsetY + t.y

      if (type === 'double') {
        const dl = findDoubleLetterForPath(from, to)
        if (dl) {
          const dignity = getDignity(dl.planet, planets[dl.planet].sign)
          const color = DIGNITY_COLORS[dignity] || '#8a7f6f'

          // Glow underlay
          doc.save()
          doc.moveTo(fx, fy).lineTo(tx, ty)
            .strokeColor(color).lineWidth(7).opacity(0.2).stroke()
          doc.restore()

          // Main path stroke
          doc.moveTo(fx, fy).lineTo(tx, ty)
            .strokeColor(color).lineWidth(3.5).opacity(1).stroke()

          // Letter label circle at midpoint
          const mx = (fx + tx) / 2
          const my = (fy + ty) / 2
          doc.circle(mx, my, pathLabelR).fill(color)
          doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff')
            .text(dl.abbr, mx - pathLabelR, my - 3.5, { width: pathLabelR * 2, align: 'center' })
        }
      } else {
        // Mother or simple letter: thin dashed gray
        doc.save()
        doc.moveTo(fx, fy).lineTo(tx, ty)
          .strokeColor('#c0b8a8').lineWidth(0.8).dash(3, { space: 3 }).opacity(0.5).stroke()
        doc.restore()
        doc.undash()
      }
    }

    // Draw sephiroth circles on top
    const SEPH_FILL = '#1e1b4b'
    const SEPH_STROKE_COLOR = '#6366f1'
    for (const [name, pos] of Object.entries(SEPHIROT_POS)) {
      const cx = treeOffsetX + pos.x
      const cy = treeOffsetY + pos.y

      doc.circle(cx, cy, sephR).fillAndStroke(SEPH_FILL, SEPH_STROKE_COLOR)
      doc.lineWidth(1.5)
      doc.fontSize(6).font('Helvetica-Bold').fillColor('#ffffff')
        .text(name, cx - sephR - 2, cy - 3, { width: sephR * 2 + 4, align: 'center' })
    }

    // Pillar labels under tree
    const pillarY = treeOffsetY + 450
    doc.fontSize(7).font('Helvetica').fillColor(LIGHT)
    doc.text('Severity', treeOffsetX + 50 - 25, pillarY, { width: 50, align: 'center' })
    doc.text('Balance', treeOffsetX + 150 - 25, pillarY, { width: 50, align: 'center' })
    doc.text('Mercy', treeOffsetX + 250 - 25, pillarY, { width: 50, align: 'center' })

    // Dignity legend under tree
    const legendY = pillarY + 14
    const legendX = treeOffsetX + 15
    doc.fontSize(6.5).font('Helvetica-Bold').fillColor(MID)
      .text('Dignity:', legendX, legendY, { continued: false })
    const legendItems = [
      { label: 'Exalted', color: DIGNITY_COLORS.exalted },
      { label: 'Domicile', color: DIGNITY_COLORS.domicile },
      { label: 'Peregrine', color: DIGNITY_COLORS.peregrine },
      { label: 'Detriment', color: DIGNITY_COLORS.detriment },
      { label: 'Fall', color: DIGNITY_COLORS.fall },
    ]
    let lx = legendX + 42
    for (const item of legendItems) {
      doc.circle(lx, legendY + 3, 3).fill(item.color)
      doc.fontSize(6).font('Helvetica').fillColor(MID)
        .text(item.label, lx + 5, legendY, { continued: false })
      lx += 45
    }

    // Planetary positions table under the legend
    const tableY = legendY + 16
    doc.fontSize(8).font('Helvetica-Bold').fillColor(GOLD)
      .text('Planetary Positions', treeOffsetX, tableY, { width: 270 })

    const planetList = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Uranus', 'Neptune', 'Pluto']
    let tblY = tableY + 12
    for (const planet of planetList) {
      const data = planets[planet]
      if (!data) continue
      const seph = PLANETARY_SEPHIROT[planet] || ''
      const dignity = getDignity(planet, data.sign)
      const isClassical = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(planet)

      doc.fontSize(7).font('Helvetica-Bold').fillColor(INK)
        .text(planet, treeOffsetX, tblY, { width: 48, continued: false })
      doc.fontSize(7).font('Helvetica').fillColor(MID)
        .text(`${data.sign} ${data.degree.toFixed(1)}`, treeOffsetX + 48, tblY, { width: 65, continued: false })
      doc.fillColor(LIGHT)
        .text(seph, treeOffsetX + 113, tblY, { width: 55, continued: false })
      if (isClassical) {
        doc.fillColor(DIGNITY_COLORS[dignity] || LIGHT).font('Helvetica-Bold')
          .text(dignityLabel(dignity), treeOffsetX + 168, tblY, { width: 55, continued: false })
      }
      tblY += 10
    }

    // ── RIGHT COLUMN: Seven Pathways ───────────────────────────────────

    doc.fontSize(10).font('Helvetica-Bold').fillColor(GOLD)
      .text('The Seven Pathways', colRight, startY, { width: colRightW })
    let rightY = startY + 16

    for (const dl of DOUBLE_LETTERS) {
      const data = planets[dl.planet]
      const dignity = getDignity(dl.planet, data.sign)
      const lean = getPolarityLean(dignity)
      const color = DIGNITY_COLORS[dignity] || LIGHT

      let leanTarget: string
      if (lean.includes('positive')) leanTarget = dl.positive
      else if (lean.includes('negative')) leanTarget = dl.negative
      else leanTarget = `${dl.positive} / ${dl.negative}`

      // Path header with colored dot
      doc.circle(colRight + 4, rightY + 4, 4).fill(color)
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(color)
        .text(`${dl.letter}`, colRight + 12, rightY, { continued: true, width: colRightW - 12 })
      doc.fillColor(MID).font('Helvetica')
        .text(` - ${dl.planet}`, { continued: false })
      rightY += 11

      // Path + sign info
      doc.fontSize(7).font('Helvetica').fillColor(LIGHT)
        .text(`${dl.from} to ${dl.to}  |  ${data.sign} ${data.degree.toFixed(1)}  |  ${dignityLabel(dignity)}`, colRight + 12, rightY, { width: colRightW - 12 })
      rightY += 9

      // Polarity lean
      doc.fontSize(7).font('Helvetica').fillColor(INK)
        .text(`${dl.positive} / ${dl.negative}:`, colRight + 12, rightY, { continued: true, width: colRightW - 12 })
      doc.font('Helvetica-Bold').fillColor(color)
        .text(` ${leanLabel(lean)} ${leanTarget}`, { continued: false })
      rightY += 9

      // Pillar label
      doc.fontSize(6.5).font('Helvetica').fillColor(LIGHT)
        .text(PILLAR_LABELS[dl.planet], colRight + 12, rightY, { width: colRightW - 12 })
      rightY += 12

      // Separator
      doc.moveTo(colRight + 12, rightY).lineTo(colRight + colRightW - 5, rightY)
        .strokeColor(GOLD).lineWidth(0.3).opacity(0.3).stroke()
      doc.opacity(1)
      rightY += 7
    }

    // Four Worlds (right column, below pathways)
    rightY += 3
    doc.fontSize(10).font('Helvetica-Bold').fillColor(GOLD)
      .text('Four Worlds', colRight, rightY, { width: colRightW })
    rightY += 14

    const worlds = ['Atziluth', 'Briah', 'Yetzirah', 'Assiah'] as const
    for (const world of worlds) {
      const pct = worldPercentages[world] || 0
      const isDominant = world === dominantWorld

      // Draw bar
      const barMaxW = 90
      const barW = Math.max(pct / 100 * barMaxW, 3)
      const barX = colRight + 65
      const barH = 7

      doc.fontSize(7).font(isDominant ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(WORLD_COLORS[world])
        .text(world, colRight, rightY, { width: 62 })

      doc.rect(barX, rightY + 1, barW, barH).fill(WORLD_COLORS[world])
      doc.fontSize(6.5).font(isDominant ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(MID)
        .text(`${pct}%${isDominant ? '  PRIMARY' : ''}`, barX + barMaxW + 5, rightY, { width: 70 })

      rightY += 12
    }

    // Stelliums + Dignity summary
    const signPlanets: Record<string, string[]> = {}
    for (const [planet, data] of Object.entries(planets)) {
      if (!signPlanets[data.sign]) signPlanets[data.sign] = []
      signPlanets[data.sign].push(planet)
    }
    const stelliums = Object.entries(signPlanets)
      .filter(([_, list]) => list.length >= 3)
      .map(([sign, list]) => ({ sign, planets: list }))

    const classicalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
    const allDignities = classicalPlanets.map(p => getDignity(p, planets[p].sign))
    const dignifiedCount = allDignities.filter(d => d === 'domicile' || d === 'exalted').length
    const debilitatedCount = allDignities.filter(d => d === 'detriment' || d === 'fall').length
    const peregrineCount = allDignities.filter(d => d === 'peregrine').length

    rightY += 4
    doc.fontSize(7).font('Helvetica-Bold').fillColor(MID)
      .text(`Dignified: ${dignifiedCount}  |  Peregrine: ${peregrineCount}  |  Debilitated: ${debilitatedCount}`, colRight, rightY, { width: colRightW })

    if (stelliums.length > 0) {
      rightY += 12
      doc.fontSize(7).font('Helvetica-Bold').fillColor(GOLD)
        .text('Stelliums:', colRight, rightY, { continued: true, width: colRightW })
      doc.font('Helvetica').fillColor(MID)
        .text('  ' + stelliums.map(s => `${s.sign} (${s.planets.join(', ')})`).join('; '), { continued: false })
    }

    // ── Bottom: Reading guide (full width) ────────────────────────────
    const bottomY = Math.max(tblY + 8, rightY + 14)
    doc.moveTo(36, bottomY).lineTo(576, bottomY).strokeColor(GOLD).lineWidth(0.8).opacity(0.5).stroke()
    doc.opacity(1)

    doc.fontSize(8).font('Helvetica-Bold').fillColor(GOLD)
      .text('Reading Your Chart', 36, bottomY + 6, { width: pw })
    doc.moveDown(0.15)

    doc.fontSize(6.5).font('Helvetica').fillColor(MID)
      .text(
        'Start from the foundation (bottom of the Tree) and read upward. ' +
        'Moon (Tav), Mercury (Resh), and Venus (Pe) form your emotional and relational base. ' +
        'Sun (Kaph) at the centre represents your core identity. ' +
        'Mars (Daleth), Jupiter (Gimel), and Saturn (Beth) shape your higher structures. ' +
        'Dignified planets lean toward the aligned polarity. Debilitated planets lean toward the shadow expression. ' +
        'Peregrine planets sit balanced, with neither polarity dominating by default.',
        36, doc.y, { width: pw, lineGap: 1.5 }
      )

    // Footer line
    doc.moveDown(0.25)
    doc.moveTo(36, doc.y).lineTo(576, doc.y).strokeColor(GOLD).lineWidth(0.3).opacity(0.3).stroke()
    doc.opacity(1)
    doc.moveDown(0.15)
    doc.fontSize(6.5).font('Helvetica').fillColor(LIGHT)
      .text('LucianKabbalah.com  |  Sefer Yetzirah planetary attributions (Hayman critical edition)', 36, doc.y, { width: pw, align: 'left' })

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
