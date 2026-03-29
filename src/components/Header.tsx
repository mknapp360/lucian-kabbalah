import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const nav = [
  { path: '/system', label: 'The System' },
  { path: '/three-streams', label: 'Three Streams' },
  { path: '/correction', label: 'The Correction' },
  { path: '/sources', label: 'Sources' },
  { path: '/canon', label: 'The Canon' },
  { path: '/get-your-chart', label: 'Get Your Chart' },
]

export default function Header() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b border-warmgray-800/50">
      <div className="max-w-page mx-auto px-6 md:px-10">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="group flex items-center gap-3 no-underline">
            <span className="text-gold-400 text-lg font-semibold tracking-wide font-serif">
              Lucian Kabbalah
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`font-sans text-small no-underline transition-colors duration-300 ${
                  pathname === path
                    ? 'text-gold-400'
                    : 'text-warmgray-400 hover:text-parchment-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-warmgray-400 hover:text-parchment-100 transition-colors p-2"
            aria-label="Toggle navigation"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" />
              ) : (
                <path d="M2 5h16M2 10h16M2 15h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="md:hidden pb-6 flex flex-col gap-4 border-t border-warmgray-800/50 pt-4">
            {nav.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={`font-sans text-small no-underline transition-colors ${
                  pathname === path
                    ? 'text-gold-400'
                    : 'text-warmgray-400'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
