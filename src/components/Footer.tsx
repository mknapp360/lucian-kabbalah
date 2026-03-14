import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-warmgray-800/50 mt-auto">
      <div className="max-w-page mx-auto px-6 md:px-10 py-16 md:py-22">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <p className="font-serif text-gold-400 text-lg mb-3">Lucian Kabbalah</p>
            <p className="font-sans text-small text-warmgray-500 leading-relaxed max-w-xs">
              A three-stream synthesis of Torah foundations, Essene-Enochic traditions, and Sefer Yetzirah pathwork.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="section-number mb-4">Navigate</p>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/system', label: 'The System' },
                { to: '/three-streams', label: 'Three Streams' },
                { to: '/correction', label: 'The Correction' },
                { to: '/sources', label: 'Sources' },
                { to: '/canon', label: 'The Canon' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="font-sans text-small text-warmgray-400 hover:text-parchment-100 no-underline transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Related */}
          <div>
            <p className="section-number mb-4">Related</p>
            <div className="flex flex-col gap-2.5">
              <a
                href="https://tarotpathwork.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-small text-warmgray-400 hover:text-parchment-100 no-underline transition-colors"
              >
                TarotPathwork
              </a>
            </div>
          </div>
        </div>

        <div className="gold-rule mt-12 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-caption text-warmgray-600">
            &copy; {new Date().getFullYear()} Frater Lucis. All rights reserved.
          </p>
          <p className="font-sans text-caption text-warmgray-700">
            Est. MMXXVI
          </p>
        </div>
      </div>
    </footer>
  )
}
