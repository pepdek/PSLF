import { useState } from 'react'
import { saveLead } from './firebase.js'

const CTA = 'Lock in my $149 founding price'
const SUCCESS = "You're in — your $149 founding price is locked to this email. Within 7 days we'll send you the 10-minute intake preview and your place in line for launch."

function Capture({ id, source, tier, note }) {
  const [state, setState] = useState('idle')
  async function submit(ev) {
    ev.preventDefault()
    const f = new FormData(ev.target)
    if (f.get('website')) return setState('done') // honeypot: silently drop
    setState('busy')
    try { await saveLead(String(f.get('email')).trim(), source, tier); setState('done') }
    catch { setState('error') }
  }
  if (state === 'done') return <p className="success" id={id} role="status" tabIndex={-1}>{SUCCESS}</p>
  return (
    <form className="capture" id={id} onSubmit={submit}>
      {tier && <p className="small tiernote">Reserving: <strong>{tier}</strong></p>}
      <div className="row">
        <input type="email" name="email" required placeholder="you@email.com" aria-label="Email address" autoComplete="email" />
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button className="btn primary" disabled={state === 'busy'}>{state === 'busy' ? 'Saving…' : CTA}</button>
      </div>
      <p className="small muted">We only email you about Forvest. No selling your address, ever.</p>
      {state === 'error' && <p className="err" role="alert">We couldn't save your email just now. Please try again in a moment.</p>}
    </form>
  )
}

const Doc = () => (
  <svg viewBox="0 0 24 24" className="ico" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h9l4 4v14H6z"/><path d="m9 14 2 2 4-4"/></svg>
)
const icons = {
  doc: <Doc />,
  pen: <svg viewBox="0 0 24 24" className="ico" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 20 1-4L16 5l3 3L8 19z"/></svg>,
  shield: <svg viewBox="0 0 24 24" className="ico" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>,
  tag: <svg viewBox="0 0 24 24" className="ico" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/></svg>,
  clock: <svg viewBox="0 0 24 24" className="ico" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  cal: <svg viewBox="0 0 24 24" className="ico" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/></svg>,
}

const benefits = [
  ['doc', "It's in writing", 'No scrambling to take notes on a call. Your recommendation, your numbers, and every assumption — in a document you keep.'],
  ['pen', 'The paperwork is done', 'Your plan-switch application arrives filled out. Review it, sign it, submit it.'],
  ['shield', 'A specialist checks the hard cases', 'PSLF buyback, pre-2014 consolidation, MFS, self-employment — flagged automatically and reviewed by a credentialed human.'],
  ['tag', 'Half the price of the alternative', '$249 flat, versus $595 for an hour on Zoom with no paperwork included.'],
  ['clock', 'Fast enough for your deadline', 'Two business days, not a two-month waitlist.'],
  ['cal', 'PSLF math done right', 'Your forgiveness date, your remaining payment count, and which plans protect the clock.'],
]

const tiers = [
  { name: 'Plan Picker', price: '$249', rec: true, items: ['Full RAP vs IBR vs Standard model on your numbers', 'Written recommendation with trade-offs and tax notes', 'Switch application filled out and ready to submit', 'Delivered in 2 business days'], best: 'most borrowers holding a 90-day notice.', btn: 'Reserve my Plan Picker spot' },
  { name: 'Complex Case Review', price: '$449', items: ['Everything in Plan Picker', 'Credentialed specialist works your full case file', 'Covers PSLF buyback, pre-2014, MFS, and self-employed scenarios', 'Written answers to up to 5 follow-up questions'], best: "borrowers whose situation doesn't fit the servicer's script.", btn: 'Reserve my Complex Case spot' },
  { name: 'IDR Watch', price: '$9/month', items: ['Recertification deadline reminders', 'Alerts when rules change and affect your plan', 'Annual payment re-check on your numbers'], best: 'staying protected after your switch is done.', btn: 'Join the IDR Watch list' },
]

const faq = [
  ['Is this available yet?', "Not yet — we're opening to founding users first. Sign up now and you lock the Plan Picker at $149 instead of $249, and you'll be first in line when we open intake."],
  ['How do I know this isn\'t another loan-relief scam?', 'Fair question — the FTC has shut down bad actors in this space. Forvest never takes power of attorney, never touches your loans, and never contacts your servicer. We prepare advice and documents; you stay in control and submit everything yourself.'],
  ['Why pay when free help exists?', "If TISLA or your servicer can answer your question, use them. But the free channels are overwhelmed, can't model your specific numbers, and won't fill out your application. When a wrong pick costs $200–$400 a month, $249 once is cheap insurance."],
  ['Do you file the switch for me?', "No — and that's deliberate. You get the application filled out and ready; you review, sign, and submit it through studentaid.gov or your servicer. You keep full control of your account."],
  ['My case is messy — buyback months, pre-2014 loans, married filing separately. Can you handle it?', "Those are exactly the cases we built for. Anything complex is automatically flagged and reviewed by a credentialed specialist before your recommendation goes out."],
  ['What if the rules change again after I get my plan?', 'The recommendation is based on current regulations, dated and documented. If a rule change breaks our recommendation within 90 days of delivery, we re-run your case free.'],
]

const Hero = () => (
  <svg viewBox="0 0 480 400" className="hero-img" role="img" aria-label="A printed Forvest recommendation with a green REVIEWED stamp, beside a calculator and a green pen">
    <rect width="480" height="400" rx="8" className="f-bg" />
    <g transform="rotate(-3 220 200)">
      <rect x="90" y="30" width="270" height="340" rx="4" className="f-paper" />
      <rect x="112" y="56" width="150" height="10" className="f-ink" />
      {[90, 112, 134, 156, 178, 200, 222].map(y => <rect key={y} x="112" y={y} width={y % 44 ? 210 : 180} height="6" className="f-line" />)}
      <rect x="112" y="252" width="226" height="52" rx="2" className="f-box" />
      <g transform="rotate(-12 280 320)">
        <rect x="222" y="296" width="120" height="40" rx="4" className="f-stamp" />
        <text x="282" y="323" textAnchor="middle" className="f-stamp-t">REVIEWED</text>
      </g>
    </g>
    <rect x="372" y="60" width="80" height="120" rx="8" className="f-ink" />
    <rect x="382" y="72" width="60" height="22" rx="2" className="f-paper" />
    {[0, 1, 2].flatMap(r => [0, 1, 2].map(c => <rect key={r + '-' + c} x={382 + c * 21} y={104 + r * 22} width="17" height="15" rx="2" className="f-paper" />))}
    <rect x="392" y="240" width="14" height="130" rx="7" transform="rotate(20 399 305)" className="f-pen" />
  </svg>
)

export default function App() {
  const [tier, setTier] = useState('')
  const pick = t => { setTier(t); const f = document.getElementById('signup'); f?.scrollIntoView({ behavior: 'smooth' }); f?.querySelector('input[type=email]')?.focus({ preventScroll: true }) }
  return (
    <>
      <header className="nav"><div className="wrap navin">
        <a href="#top" className="brand"><img src="/logo.svg" alt="" width="28" height="28" />Forvest</a>
        <nav className="links"><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav>
        <a className="btn primary" href="#hero-form">{CTA}</a>
      </div></header>

      <main id="top">
        <section className="sec bg"><div className="wrap hero">
          <div className="rise">
            <h1>Kicked off SAVE? Your new plan, picked in 48 hours.</h1>
            <p className="lead">A written recommendation plus your switch application filled out — specialist-reviewed, delivered in two business days, for one flat fee.</p>
            <Capture id="hero-form" source="hero" />
            <p className="cred">Picking the wrong plan can cost $200–$400 a month. The only paid alternative charges $595 for a phone call — and leaves the paperwork to you.</p>
          </div>
          <Hero />
        </div></section>

        <section className="sec surface"><div className="wrap">
          <h2>90 days to decide, and no straight answers</h2>
          <ul className="problems">
            <li>Your servicer's rep gives you one answer on Monday and a different one on Thursday — and neither will put it in writing.</li>
            <li>The studentaid.gov calculator shows Graduated as your cheapest plan. It doesn't tell you Graduated payments don't count toward PSLF.</li>
            <li>The free nonprofit help answers 12,000+ emails a year and has no phone line. Your deadline won't wait for the queue.</li>
            <li>Miss your notice deadline and you're auto-enrolled in Standard — whether it's right for you or not.</li>
          </ul>
        </div></section>

        <section className="sec bg" id="how"><div className="wrap">
          <h2>How it works</h2>
          <ol className="steps">
            {[['Enter your numbers', 'Loan balances, income, filing status, and PSLF payment count. Takes about 10 minutes, no account with your servicer needed.'],
              ['We run every plan', 'Our model calculates RAP, IBR, and Standard against your real numbers. A credentialed specialist reviews every complex case — PSLF buyback, pre-2014 loans, married filing separately, self-employed income.'],
              ['Get your plan in 48 hours', 'A written recommendation with the math, the trade-offs, and the tax notes — plus your switch application filled out and ready to submit.']]
              .map(([h, p], i) => <li key={h}><h3>Step {i + 1} — {h}</h3><p>{p}</p></li>)}
          </ol>
        </div></section>

        <section className="sec surface"><div className="wrap">
          <h2 className="demo-h">This is what lands in your inbox — a real example, with real math.</h2>
          <p className="case">Maya — ER nurse at a public hospital. $36,400 in Direct Loans, $68,000 income, single, 105 qualifying PSLF payments made, 15 to go. Kicked off SAVE, notice deadline in 41 days.</p>
          <article className="card report">
            <div className="rhead small"><strong>FORVEST PLAN RECOMMENDATION</strong> — Prepared for Maya R. · Reviewed by a credentialed specialist</div>
            <div className="scroll"><table>
              <thead><tr><th>Plan</th><th>Monthly payment</th><th>Counts toward PSLF?</th><th>You pay before forgiveness</th></tr></thead>
              <tbody>
                <tr><td>RAP</td><td className="key">$340</td><td>Yes</td><td>$5,100 over 15 months</td></tr>
                <tr><td>IBR</td><td>$371</td><td>Yes</td><td>$5,566 over 15 months</td></tr>
                <tr><td>Standard (10-yr)</td><td>$395</td><td>Yes</td><td>$5,926 over 15 months</td></tr>
              </tbody>
            </table></div>
            <div className="box"><strong>OUR PICK: RAP.</strong> It's your lowest payment, $31 a month less than IBR and $466 less over the 15 months you have left. Every payment counts toward PSLF, and in 15 months your remaining ~<span className="keyn">$33,700</span> balance is forgiven tax-free. Filing the switch now protects your deadline.</div>
            <div className="box warn"><strong>⚠ WATCH OUT:</strong> The studentaid.gov calculator may show Graduated as your cheapest option. Graduated payments do NOT count toward PSLF. Picking it would freeze your forgiveness clock 15 payments from the finish line.</div>
            <div><strong>NEXT STEPS:</strong><ol className="next"><li>Review the RAP application we've filled out for you.</li><li>Sign and submit it through your servicer.</li><li>Keep paying on your current schedule until the switch confirms.</li></ol></div>
          </article>
          <p className="center-note"><a className="btn secondary" href="/plan">Run this on your own numbers, free</a></p>
          <div className="below"><Capture id="signup" source="demo-report" tier={tier} /></div>
        </div></section>

        <section className="sec bg"><div className="wrap">
          <h2>Why Forvest</h2>
          <div className="grid3">
            {benefits.map(([i, h, p]) => <div className="card pad" key={h}>{icons[i]}<h3>{h}</h3><p>{p}</p></div>)}
          </div>
        </div></section>

        <section className="sec surface" id="pricing"><div className="wrap">
          <h2>Pricing</h2>
          <div className="grid3 tiers">
            {tiers.map(t => (
              <div className={'card pad tier' + (t.rec ? ' rec' : '')} key={t.name}>
                {t.rec && <span className="badge">Recommended</span>}
                <h3>{t.name}</h3>
                <p className="price">{t.price}</p>
                <ul>{t.items.map(i => <li key={i}>{i}</li>)}</ul>
                <p className="small muted best">Best for: {t.best}</p>
                <button className={'btn ' + (t.rec ? 'primary' : 'secondary')} onClick={() => pick(t.name)}>{t.btn}</button>
              </div>
            ))}
          </div>
        </div></section>

        <section className="sec bg" id="faq"><div className="wrap">
          <h2>FAQ</h2>
          <div className="faq">{faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div></section>

        <section className="sec surface"><div className="wrap final">
          <h2>One flat fee. One written plan. Your application done — before your deadline isn't.</h2>
          <p className="lead">Founding users lock the Plan Picker at $149 instead of $249. No payment now — you're reserving a spot, not buying.</p>
          <Capture id="final-form" source="final-cta" />
        </div></section>
      </main>
      <footer className="foot"><div className="wrap footin"><a href="#top" className="brand"><img src="/logo.svg" alt="" width="24" height="24" />Forvest</a><p className="small muted">Advice and documents only — you submit everything yourself.</p></div></footer>
    </>
  )
}
