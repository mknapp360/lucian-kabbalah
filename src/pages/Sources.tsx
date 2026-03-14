import PageHeader from '../components/PageHeader'
import Section from '../components/Section'

export default function Sources() {
  return (
    <div>
      <PageHeader
        number="IV"
        title="Source Texts"
        subtitle="The primary texts, critical editions, and scholarly authorities on which Lucian Kabbalah is built."
      />

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="IV.i" title="Primary Textual Authority">
        <div className="space-y-8">
          <SourceEntry
            author="Peter Hayman"
            title="Sefer Yetzirah: Edition, Translation and Text-Critical Commentary"
            publication="T&uuml;bingen: Mohr Siebeck, 2004. Texte und Studien zum Antiken Judentum (TSAJ), vol. 104."
            note="The principal authority for polarity pairs (&sect;37) and Chaldean planetary assignments (&sect;&sect;41, 44). Critical reconstruction of the earliest recoverable text through systematic comparison of all surviving manuscript families."
          />
          <SourceEntry
            author="Geza Vermes (trans.)"
            title="The Complete Dead Sea Scrolls in English"
            publication="London: Penguin, revised edition."
            note="Primary access to the Community Rule (1QS), the War Scroll, the Messianic Rule, and the sectarian literature of the Qumran community. Source for the Two Spirits doctrine and Essene governance structures."
          />
          <SourceEntry
            author="James H. Charlesworth (ed.)"
            title="The Old Testament Pseudepigrapha"
            publication="New York: Doubleday, 1983&ndash;1985. Two volumes."
            note="Standard critical edition of the intertestamental literature. Source for the Enochic corpus, Jubilees, 2 Baruch, 4 Ezra, and the pseudepigraphal messianic and theodicy traditions."
          />
        </div>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="IV.ii" title="Corpus Texts">
        <div className="space-y-8">
          <SourceEntry
            title="1 Enoch (Ethiopic Enoch)"
            note="The Watcher narrative (chs. 6&ndash;16), the astronomical sections, and the Similitudes (chs. 37&ndash;71) with the pre-existent Son of Man figure. Primary source for the angelic rebellion account integrated into TEMPIC."
          />
          <SourceEntry
            title="Book of Jubilees"
            note="The 364-day solar calendar, the Watcher tradition with the Nephilim spirit taxonomy (10:7&ndash;11: 90% bound, 10% permitted limited operation), and the covenant renewal framework."
          />
          <SourceEntry
            title="Sefer Yetzirah"
            note="The foundational text. Three mothers, seven doubles, twelve simples. The mechanics of creation through divine speech, letter combination, and the mapping of cosmos onto human being."
          />
          <SourceEntry
            title="The Zohar"
            note="The central text of the developed Kabbalistic tradition. Source for the Partzufim system, Kli/Ohr dynamics, the MI/MA framework, and the soul-level taxonomy (NRN/NRNHY). Engaged in Volume IV of the Lucian Canon."
          />
          <SourceEntry
            author="Isaac ben Jacob ha-Kohen"
            title="Treatise on the Left Emanation"
            publication="13th century."
            note="The structured demonological hierarchy mapping to the sephirotic Tree. Seven princes of emanation, the Samael hierarchy, and the qlippothic architecture. Source for TEMPIC&rsquo;s shadow-side taxonomy."
          />
          <SourceEntry
            title="King James Bible (Cambridge Edition)"
            note="Primary English text for Torah, prophetic, and New Testament sources. Genesis, Exodus 14:19&ndash;21 (the three 72-letter verses yielding the Shem HaMephorash), Matthew 26:53 (the twelve legions), 2 Peter 2:4 and Jude 1:6 (the bound Watchers)."
          />
        </div>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="IV.iii" title="Scholarly Authorities">
        <div className="space-y-8">
          <SourceEntry
            author="Michael S. Heiser"
            title="The Divine Council in Late Canonical and Early Extra-Canonical Literature"
            note="The elohim as a category of being, the council structure with tiers of authority, the Deuteronomy 32:8&ndash;9 worldview where nations are assigned to bene elohim while Israel is YHWH&rsquo;s direct portion. Foundational for TEMPIC&rsquo;s spiritual dimension taxonomy."
          />
          <SourceEntry
            author="Gershom Scholem"
            note="The foundational academic authority on the history and development of Jewish mysticism. Provides the scholarly context within which the Sefer Yetzirah and Zoharic traditions are understood."
          />
          <SourceEntry
            author="Aryeh Kaplan"
            note="Translator and commentator on the Sefer Yetzirah. Provides an important bridge between traditional Jewish commentary and accessible English-language scholarship."
          />
          <SourceEntry
            author="Joel C. Dobin"
            title="Kabbalistic Astrology"
            publication="1999."
            note="Working from Jewish scholarly tradition, independently confirms the principle of returning to the Sefer Yetzirah against the Golden Dawn&rsquo;s reassignments. Uses a weekday-intermediary derivation producing a different planetary sequence, but validates the foundational corrective principle."
          />
        </div>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="IV.iv" title="Clean Lineage (Pre-Contamination)">
        <div className="space-y-8">
          <SourceEntry
            author="Johannes Reuchlin"
            title="De Verbo Mirifico (1494) / De Arte Cabalistica (1517)"
            note="Established Christian Kabbalah on direct engagement with Hebrew sources before any Tarot-Hebrew connection existed."
          />
          <SourceEntry
            author="Heinrich Cornelius Agrippa"
            title="De Occulta Philosophia"
            publication="1531."
            note="Transmitted Kabbalistic planetary correspondences consistent with the pre-Levi tradition."
          />
          <SourceEntry
            author="Lazare Lenain"
            title="La Science Cabalistique"
            publication="1823."
            note="Documented the seventy-two Shem HaMephorash angels in their zodiacal governance scheme. Part of the clean lineage preceding Levi&rsquo;s 1856 contamination."
          />
        </div>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="IV.v" title="Archive Sources">
        <div className="space-y-8">
          <SourceEntry
            title="Museum of Freemasonry, London &mdash; Golden Dawn Collection"
            note="GD1/1/5K: Cipher table showing Saturn&rarr;Path 32&rarr;Tav, contradicting SY &sect;44. GD2/4/3/18: Mathers letter, April 2, 1900, naming Gebelin, Etteilla, Christian, and Levi as predecessors who failed to discover true attributions. Newly photographed manuscript material documenting the moment of divergence."
          />
        </div>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="IV.vi" title="Set Aside for Planetary Path Work">
        <p className="text-warmgray-400 italic mb-6">
          The following authors transmit the post-1856 corrupted planetary attributions and should not be used as authorities for double-letter path assignments:
        </p>
        <p className="text-warmgray-500">
          Eliphas Levi &middot; Israel Regardie &middot; Arthur Edward Waite &middot; Aleister Crowley &middot; Paul Foster Case &middot; Robert Wang &middot; Dion Fortune
        </p>
        <p className="mt-6 text-warmgray-400 italic">
          These authors retain value for other aspects of the tradition. The contamination is specific to planetary-path correspondences.
        </p>
      </Section>
    </div>
  )
}

function SourceEntry({
  author,
  title,
  publication,
  note,
}: {
  author?: string
  title?: string
  publication?: string
  note?: string
}) {
  return (
    <div className="border-l-2 border-warmgray-800/60 pl-6">
      {author && (
        <p className="font-sans text-small text-parchment-100 font-medium mb-0.5">{author}</p>
      )}
      {title && (
        <p className="font-serif text-body text-gold-400/80 italic mb-0.5" dangerouslySetInnerHTML={{ __html: title }} />
      )}
      {publication && (
        <p className="font-sans text-small text-warmgray-500 mb-2" dangerouslySetInnerHTML={{ __html: publication }} />
      )}
      {note && (
        <p className="font-serif text-body text-warmgray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: note }} />
      )}
    </div>
  )
}
