import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="pt-22 md:pt-30 pb-18 md:pb-26">
        <div className="max-w-content mx-auto px-6 md:px-10">
          <p className="section-number mb-6">Est. MMXXVI</p>
          <h1 className="font-serif text-display md:text-[4.5rem] md:leading-[1.05] text-parchment-50 font-light max-w-3xl">
            Lucian Kabbalah
          </h1>
          <div className="gold-rule-left max-w-32 mt-8 mb-8" />
          <p className="font-serif text-heading-3 md:text-heading-2 text-warmgray-300 font-light italic max-w-prose">
            A three-stream synthesis of Torah foundations, Essene-Enochic traditions, and Sefer Yetzirah pathwork.
          </p>
          <p className="prose-scholarly mt-8 max-w-prose">
            Restoring the original planetary attributions of the Sefer Yetzirah to the Western esoteric tradition, after 168 years of compounded error.
          </p>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6 md:px-10">
        <div className="gold-rule" />
      </div>

      {/* The Claim */}
      <section className="py-18 md:py-26">
        <div className="max-w-content mx-auto px-6 md:px-10">
          <p className="section-number mb-6">The Claim</p>
          <div className="prose-scholarly max-w-prose">
            <p>
              In 1856, Eliphas Levi mapped the twenty-two Hebrew letters to the Tarot trumps in sequential order&mdash;Aleph to the Magician, Beth to the High Priestess, and so on&mdash;without consulting the Sefer Yetzirah. In 1888, the Golden Dawn compounded this error by reassigning all seven planetary attributions, claiming that the original text was &ldquo;most blinded.&rdquo;
            </p>
            <p>
              Every major Western esoteric text published since&mdash;Regardie, Waite, Crowley, Case, Fortune, Wang&mdash;has transmitted these corrupted attributions without challenge.
            </p>
            <p>
              Lucian Kabbalah restores the Sefer Yetzirah&rsquo;s original Chaldean planetary order, documented in Peter Hayman&rsquo;s 2004 critical edition, and builds a complete theological and practical system on the corrected foundation.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6 md:px-10">
        <div className="gold-rule" />
      </div>

      {/* Three Streams Preview */}
      <section className="py-18 md:py-26">
        <div className="max-w-content mx-auto px-6 md:px-10">
          <p className="section-number mb-6">Three Streams</p>
          <h2 className="font-serif text-heading-2 text-parchment-100 font-light mb-12">
            The system draws from three convergent traditions
          </h2>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                title: 'Torah',
                hebrew: 'תורה',
                desc: 'Framework, names, covenant. Genesis provides the cosmological foundation. Biblical angelology. Christ as fulfilment, not departure.',
              },
              {
                title: 'Essene-Enochic',
                hebrew: 'חנוך',
                desc: 'Temporal pace, the 364-day solar calendar from Jubilees and 1 Enoch, cosmology, angelology. The Dead Sea Scrolls community and the Sons of Light.',
              },
              {
                title: 'Sefer Yetzirah',
                hebrew: 'ספר יצירה',
                desc: 'Mechanics, paths, letter-to-planet-to-zodiac mappings. The geocentric Chaldean planetary order. Creation as divine speech.',
              },
            ].map(({ title, hebrew, desc }) => (
              <div key={title} className="group">
                <p className="text-gold-400/60 font-serif text-2xl mb-2">{hebrew}</p>
                <h3 className="font-serif text-heading-3 text-parchment-50 mb-3">{title}</h3>
                <p className="font-serif text-body text-warmgray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              to="/three-streams"
              className="link-gold font-sans text-small"
            >
              Read the full treatment &rarr;
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6 md:px-10">
        <div className="gold-rule" />
      </div>

      {/* The Corrected Attributions */}
      <section className="py-18 md:py-26">
        <div className="max-w-content mx-auto px-6 md:px-10">
          <p className="section-number mb-6">The Seven Double Letters</p>
          <h2 className="font-serif text-heading-2 text-parchment-100 font-light mb-4">
            Corrected planetary attributions
          </h2>
          <p className="prose-scholarly max-w-prose mb-10">
            Following the Chaldean order from Hayman&rsquo;s critical edition, &sect;&sect;41 and 44&mdash;the cosmologically prior form, attested across all recensions.
          </p>

          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="w-full font-sans text-small border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-warmgray-700/50">
                  <th className="text-left py-3 px-4 text-caption uppercase tracking-widest text-warmgray-500 font-normal">Letter</th>
                  <th className="text-left py-3 px-4 text-caption uppercase tracking-widest text-warmgray-500 font-normal">Planet</th>
                  <th className="text-left py-3 px-4 text-caption uppercase tracking-widest text-warmgray-500 font-normal">Path</th>
                  <th className="text-left py-3 px-4 text-caption uppercase tracking-widest text-warmgray-500 font-normal">Polarity</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { letter: 'Beth (ב)', planet: 'Saturn', path: 'Kether \u2194 Binah', polarity: 'Life / Death' },
                  { letter: 'Gimel (ג)', planet: 'Jupiter', path: 'Kether \u2194 Tiphereth', polarity: 'Peace / Evil' },
                  { letter: 'Daleth (ד)', planet: 'Mars', path: 'Chokmah \u2194 Binah', polarity: 'Wisdom / Folly' },
                  { letter: 'Kaph (כ)', planet: 'Sun', path: 'Chesed \u2194 Netzach', polarity: 'Wealth / Poverty' },
                  { letter: 'Pe (פ)', planet: 'Venus', path: 'Netzach \u2194 Hod', polarity: 'Prosperity / Desolation' },
                  { letter: 'Resh (ר)', planet: 'Mercury', path: 'Hod \u2194 Yesod', polarity: 'Beauty / Ugliness' },
                  { letter: 'Tav (ת)', planet: 'Moon', path: 'Yesod \u2194 Malkuth', polarity: 'Mastery / Slavery' },
                ].map(({ letter, planet, path, polarity }) => (
                  <tr key={letter} className="border-b border-warmgray-800/40 hover:bg-warmgray-800/10 transition-colors">
                    <td className="py-3.5 px-4 text-parchment-100">{letter}</td>
                    <td className="py-3.5 px-4 text-gold-400">{planet}</td>
                    <td className="py-3.5 px-4 text-warmgray-300">{path}</td>
                    <td className="py-3.5 px-4 text-warmgray-400 italic">{polarity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-sans text-small text-warmgray-500 mt-6 max-w-prose">
            The polarity pairs are properties of the letters, not the planets. The planet determines what energy drives the lean. The letter determines what is at stake on that path.
          </p>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6 md:px-10">
        <div className="gold-rule" />
      </div>

      {/* Canon */}
      <section className="py-18 md:py-26">
        <div className="max-w-content mx-auto px-6 md:px-10">
          <p className="section-number mb-6">The Lucian Canon</p>
          <h2 className="font-serif text-heading-2 text-parchment-100 font-light mb-4">
            A four-volume series mirroring the Four Worlds
          </h2>
          <div className="prose-scholarly max-w-prose mb-10">
            <p>
              The canon moves from historical proof to applied practice to clinical training to theological synthesis&mdash;Atzilut, Beriah, Yetzirah, Assiyah&mdash;establishing Lucian Kabbalah as a complete, internally consistent system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { vol: 'I', title: 'Principia', world: 'Atzilut / Emanation', desc: 'The source-level argument. Historical proof, primary texts, the correction itself.' },
              { vol: 'II', title: 'Esoterica', world: 'Beriah / Creation', desc: 'The intellectual architecture. Natal signatures, Tarot mechanics, applied correspondences.' },
              { vol: 'III', title: 'Practica', world: 'Yetzirah / Formation', desc: 'The clinical training. Client methodology, case studies, practitioner protocols.' },
              { vol: 'IV', title: 'Theologica', world: 'Assiyah / Action', desc: 'The capstone synthesis. Christology, eschatology, theodicy, Zoharic engagement.' },
            ].map(({ vol, title, world, desc }) => (
              <div key={vol} className="border border-warmgray-800/40 p-6 md:p-8 hover:border-warmgray-700/60 transition-colors">
                <p className="font-sans text-caption uppercase tracking-widest text-gold-500/60 mb-2">
                  Volume {vol}
                </p>
                <h3 className="font-serif text-heading-3 text-parchment-50 mb-1">{title}</h3>
                <p className="font-sans text-caption text-warmgray-500 italic mb-3">{world}</p>
                <p className="font-serif text-body text-warmgray-400">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              to="/canon"
              className="link-gold font-sans text-small"
            >
              About the series &rarr;
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6 md:px-10">
        <div className="gold-rule" />
      </div>

      {/* Applied Practice */}
      <section className="py-18 md:py-26">
        <div className="max-w-content mx-auto px-6 md:px-10">
          <div className="prose-scholarly max-w-prose">
            <p className="section-number mb-6">Applied Practice</p>
            <h2 className="font-serif text-heading-2 text-parchment-100 font-light mb-6">
              TarotPathwork
            </h2>
            <p>
              The applied practice of Lucian Kabbalah is available through{' '}
              <a
                href="https://tarotpathwork.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-gold"
              >
                TarotPathwork
              </a>
              &mdash;natal energetic signatures, Shem angel petitions, and guided pathwork built on the corrected Sefer Yetzirah attributions.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
