import PageHeader from '../components/PageHeader'
import Section from '../components/Section'

export default function System() {
  return (
    <div>
      <PageHeader
        number="I"
        title="The System"
        subtitle="A framework for understanding creation as divine communication, built on three convergent traditions and anchored in the Sefer Yetzirah's original planetary attributions."
      />

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="I.i" title="What Lucian Kabbalah Is">
        <p>
          Lucian Kabbalah is a three-stream synthesis of Torah foundations, Essene-Enochic traditions, and Sefer Yetzirah pathwork. It restores the original Chaldean planetary order to the seven double-letter paths of the Tree of Life&mdash;attributions that were corrupted in 1856 by Eliphas Levi and compounded in 1888 by the Golden Dawn&mdash;and builds a complete theological and practical system on the corrected foundation.
        </p>
        <p>
          The system treats creation as divine communication, not impersonal Hermetic correspondence. The heavens declare because there is a Declarer. Angels govern because they were commissioned. The paths are channels of living speech, not nodes in a self-referencing system. The observable connections between macrocosm and microcosm exist because God speaks through creation, not because of an impersonal law of correspondence.
        </p>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="I.ii" title="TEMPIC">
        <p className="font-sans text-caption uppercase tracking-widest text-warmgray-500 mb-6">
          Temporal Participatory Incarnational Cosmology
        </p>
        <p>
          Lucian Kabbalah operates within a three-dimensional interpenetrating reality structure. The Divine Dimension&mdash;beyond time, the source and ground of all being. The Spiritual Dimension&mdash;timeless beings operating in the intermediate realm, from the nine angelic choirs to the seventy-two Shem HaMephorash angels governing the zodiac. And the Material Dimension&mdash;the only realm where transformation, narrative, and becoming are possible.
        </p>
        <p>
          Time is not degradation. It is the engine of change. This is why incarnation matters, why the material world is sacred, and why temporal existence is the most precious gift in all of creation&mdash;the only dimension where the stuck can become unstuck, where choices compound, where the story actually happens.
        </p>
        <p>
          The flow of creation moves in two directions: downward through emanation, as divine presence moves through aligned spiritual beings into temporal reality; and upward through return, as temporal creatures align with the emanations and move toward divine union. Grace is the downward movement that bypasses the structural gradient entirely.
        </p>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="I.iii" title="The Moral Topology">
        <p>
          Each double-letter path on the Tree carries a binary polarity derived from Hayman&rsquo;s critical edition, &sect;37&mdash;attested across all recensions of the Sefer Yetzirah. The planet assigned to that path provides the energy. The planet&rsquo;s classical dignity or debility in its zodiacal sign determines which direction the polarity leans.
        </p>
        <p>
          A dignified planet&mdash;in domicile or exaltation&mdash;produces a strong lean toward the aligned polarity. The shadow expression requires active effort against the gradient. A debilitated planet&mdash;in detriment or fall&mdash;leans toward the shadow polarity. The aligned expression requires conscious, uphill effort. A peregrine planet sits in open territory, developing in proportion to the attention invested.
        </p>
        <p>
          This is not fatalistic astrology. Where observable life exceeds what the natal architecture predicts, the gap is evidence of Grace&mdash;divine provision operating beyond and through the structural channels. The architecture sets the default. Grace and sustained practice can expand the vessel&rsquo;s capacity.
        </p>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="I.iv" title="The Melqart Principle">
        <p>
          Sovereignty is sacred and non-negotiable. No being, regardless of power or rank, has the right to violate another&rsquo;s will within divine order. All engagement with the spiritual realm operates through petition, never command. Angels are commissioned governors within a divine council&mdash;they serve because they were appointed, and they respond to humble petition within the chain of authority established by the Most High.
        </p>
        <p>
          Christ himself, who could have commanded twelve legions of angels, chose petition in Gethsemane. Sovereignty demonstrated by having all power and voluntarily submitting to the Father&rsquo;s will. True spiritual surrender can only occur after sovereignty is first established.
        </p>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="I.v" title="The Five Pillars of Pedagogy">
        <p>
          Lucian Kabbalah treats students as sovereign beings capable of direct relationship with the Divine, rather than dependent subjects requiring institutional mediation. The system is built on five pedagogical commitments:
        </p>
        <div className="mt-8 space-y-6">
          {[
            { title: 'Study over Doctrine', desc: 'Emphasis on literacy and direct engagement with primary texts. Building knowledge from foundations rather than accepting dogma.' },
            { title: 'Interpretation over Revelation', desc: 'Developing discernment through practice. Multiple valid readings of sacred texts. Dialogue with tradition rather than passive reception.' },
            { title: 'Self-Observation over Confession', desc: 'Awareness of one\u2019s own patterns, alignments, and misalignments. Honest self-assessment without external authority mediating it.' },
            { title: 'Dialogue over Authority', desc: 'Conversation and synthesis over hierarchical instruction. Teacher as guide, not gatekeeper. The rabbinic model of multiple perspectives held in tension.' },
            { title: 'Integration over Salvation', desc: 'Taking responsibility for applying wisdom to lived experience. Alignment as ongoing practice, not one-time conversion. Transformation through participation.' },
          ].map(({ title, desc }) => (
            <div key={title}>
              <h3 className="font-serif text-heading-3 text-gold-400/80 mb-1">{title}</h3>
              <p className="text-warmgray-300">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="max-w-content mx-auto px-6 md:px-10"><div className="gold-rule" /></div>

      <Section number="I.vi" title="What This System Is Not">
        <p>
          Lucian Kabbalah is not Golden Dawn, not Thelema, not Hermetic Order. It is not Gnostic&mdash;creation is good. The material world is temple, not prison. The body is instrument of worship, not cage. Torah is divine communication, not a Demiurge&rsquo;s control manual.
        </p>
        <p>
          It is not based on the Hermetic law of correspondence. It does not treat the Tarot as numbered. Levi&rsquo;s 1856 sequential numbering locked cards into the wrong Hebrew letter sequence. Remove the numbering and the cards sit on paths according to the actual Sefer Yetzirah planetary attributions.
        </p>
        <p>
          It is not a system of command. No technique, practice, or framework&mdash;including this one&mdash;grants the practitioner authority over spiritual beings. Petition, not command. Respect each being&rsquo;s sovereignty.
        </p>
      </Section>
    </div>
  )
}
