import { useState, useCallback, useRef, useEffect } from 'react'

interface PlacePrediction {
  place_id: string
  description: string
}

export default function GetYourChart() {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [locationDisplay, setLocationDisplay] = useState('')
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // ── Location autocomplete ──────────────────────────────────────────
  const searchPlaces = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([])
      return
    }
    try {
      const res = await fetch(`/api/places-autocomplete?input=${encodeURIComponent(input)}`)
      const data = await res.json()
      if (data.predictions) {
        setPredictions(data.predictions)
        setShowDropdown(true)
      }
    } catch {
      setPredictions([])
    }
  }, [])

  const handleLocationInput = (value: string) => {
    setLocationQuery(value)
    setLocationDisplay('')
    setLatitude(null)
    setLongitude(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPlaces(value), 300)
  }

  const selectPlace = async (prediction: PlacePrediction) => {
    setLocationDisplay(prediction.description)
    setLocationQuery(prediction.description)
    setPredictions([])
    setShowDropdown(false)

    try {
      const geoRes = await fetch(`/api/places-geocode?placeId=${prediction.place_id}`)
      const geoData = await geoRes.json()
      if (geoData.results?.[0]?.geometry?.location) {
        const loc = geoData.results[0].geometry.location
        setLatitude(loc.lat)
        setLongitude(loc.lng)
      }
    } catch {
      setError('Could not resolve location coordinates.')
    }
  }

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Form submission ────────────────────────────────────────────────
  const isFormValid = name.trim() && birthDate && birthTime && latitude !== null && longitude !== null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setGenerating(true)
    setError('')

    try {
      const res = await fetch('/api/generate-quick-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          birthDate,
          birthTime,
          latitude,
          longitude,
          birthLocation: locationDisplay || locationQuery,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errData.error || `Server error: ${res.status}`)
      }

      // Download the PDF
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quick-chart-${name.trim().replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Failed to generate chart. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="pt-20 pb-12 md:pt-28 md:pb-16 px-6 md:px-10">
        <div className="max-w-prose mx-auto text-center">
          <p className="section-number mb-4">Free Tool</p>
          <h1 className="font-serif text-heading-1 md:text-display text-parchment-50 mb-4">
            Get Your Chart
          </h1>
          <p className="prose-scholarly text-center max-w-md mx-auto">
            Enter your birth details to receive a Natal Quick Chart showing your planetary
            positions, dignities, and the seven pathway polarities on the Tree of Life.
          </p>
        </div>
      </section>

      <div className="gold-rule max-w-content mx-auto" />

      {/* Form */}
      <section className="py-12 md:py-16 px-6 md:px-10">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block font-sans text-small text-warmgray-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-ink-900 border border-warmgray-700 rounded-lg px-4 py-3 font-sans text-body text-parchment-100 placeholder:text-warmgray-600 focus:outline-none focus:border-gold-500/60 transition-colors"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block font-sans text-small text-warmgray-400 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full bg-ink-900 border border-warmgray-700 rounded-lg px-4 py-3 font-sans text-body text-parchment-100 focus:outline-none focus:border-gold-500/60 transition-colors"
              />
            </div>

            {/* Time of Birth */}
            <div>
              <label className="block font-sans text-small text-warmgray-400 mb-1.5">
                Time of Birth
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={e => setBirthTime(e.target.value)}
                className="w-full bg-ink-900 border border-warmgray-700 rounded-lg px-4 py-3 font-sans text-body text-parchment-100 focus:outline-none focus:border-gold-500/60 transition-colors"
              />
              <p className="font-sans text-caption text-warmgray-600 mt-1">
                As accurate as possible. Check your birth certificate if you can.
              </p>
            </div>

            {/* Place of Birth */}
            <div className="relative" ref={dropdownRef}>
              <label className="block font-sans text-small text-warmgray-400 mb-1.5">
                Place of Birth
              </label>
              <input
                type="text"
                value={locationQuery}
                onChange={e => handleLocationInput(e.target.value)}
                onFocus={() => predictions.length > 0 && setShowDropdown(true)}
                placeholder="Start typing a city..."
                className="w-full bg-ink-900 border border-warmgray-700 rounded-lg px-4 py-3 font-sans text-body text-parchment-100 placeholder:text-warmgray-600 focus:outline-none focus:border-gold-500/60 transition-colors"
              />
              {latitude !== null && (
                <span className="absolute right-3 top-[38px] text-gold-500 text-caption">
                  ✓
                </span>
              )}

              {/* Autocomplete dropdown */}
              {showDropdown && predictions.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-ink-900 border border-warmgray-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {predictions.map(p => (
                    <button
                      key={p.place_id}
                      type="button"
                      onClick={() => selectPlace(p)}
                      className="w-full text-left px-4 py-2.5 font-sans text-small text-parchment-200 hover:bg-warmgray-800/50 transition-colors border-b border-warmgray-800/30 last:border-0"
                    >
                      {p.description}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="font-sans text-small text-red-400 bg-red-900/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid || generating}
              className={`w-full font-sans text-body font-medium rounded-lg px-6 py-3.5 transition-all duration-300 ${
                isFormValid && !generating
                  ? 'bg-gold-500 text-ink-950 hover:bg-gold-400 cursor-pointer'
                  : 'bg-warmgray-700 text-warmgray-500 cursor-not-allowed'
              }`}
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Generating your chart...
                </span>
              ) : (
                'Generate Quick Chart'
              )}
            </button>
          </form>

          {/* CTA */}
          <div className="mt-10 pt-8 border-t border-warmgray-800/50 text-center">
            <p className="font-serif text-heading-3 text-gold-400 mb-2">
              Want the full picture?
            </p>
            <p className="font-sans text-small text-warmgray-400 leading-relaxed mb-5">
              This Quick Chart is a snapshot. For a full 20+ page personalised interpretation
              covering your Seven Pillars, shadow work, compensatory mechanisms, and soul signature:
            </p>
            <a
              href="https://tarotpathwork.com/readings/natal-signature-report"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-sans text-small font-medium bg-gold-500/10 text-gold-400 border border-gold-500/30 rounded-lg px-6 py-2.5 hover:bg-gold-500/20 hover:border-gold-500/50 transition-all duration-300 no-underline"
            >
              Get Your Full Natal Signature Report
            </a>
          </div>

          {/* Info note */}
          <div className="mt-8 pt-6 border-t border-warmgray-800/30">
            <p className="font-sans text-caption text-warmgray-600 leading-relaxed">
              No data is stored and no account is required. Your chart is generated on the fly
              and delivered as a PDF.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
