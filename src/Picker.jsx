import { useState } from 'react'
import { compare, RULES } from './engine.js'

const $ = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const $c = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const TYPES = { direct: 'Direct (subsidized, unsubsidized, Grad PLUS)', consol: 'Direct Consolidation', parent: 'Parent PLUS (or consolidated with one)', ffel: 'FFEL or Perkins (not Direct)' }
const FILING = { single: 'Single', hoh: 'Head of household', mfj: 'Married filing jointly', mfs: 'Married filing separately' }
const blank = { loans: [{ type: 'direct', bal: '', rate: '' }], agi: '', spouseAgi: '', filing: 'single', household: '1', dependents: '0', older: 'no', pslf: 'no', pslfMade: '0', selfEmployed: 'no', buyback: 'no', priority: 'monthly', name: '', deadline: '' }

function Field({ label, children, hint }) {
  return <label className="pk-f"><span className="cap">{label}</span>{children}{hint && <span className="small muted">{hint}</span>}</label>
}

function Report({ f, r, when }) {
  const pick = r.pick
  const daysLeft = f.deadline ? Math.ceil((new Date(f.deadline) - new Date()) / 864e5) : null
  const forgiveOn = new Date(); forgiveOn.setMonth(forgiveOn.getMonth() + pick.months)
  const idrTaxable = !r.pslf && pick.forgiven > 0
  return (
    <article className="card pad pk-report">
      <p className="cap">Forvest plan recommendation{f.name && ` — prepared for ${f.name}`} · {when}</p>
      <div className="scroll"><table>
        <thead><tr><th>Plan</th><th>Monthly payment</th><th>Counts toward PSLF?</th><th>{r.pslf ? 'You pay before forgiveness' : 'Total you pay'}</th></tr></thead>
        <tbody>{r.plans.map(p => (
          <tr key={p.label}><td>{p.label}</td><td className={p === pick ? 'key' : ''}>{$c(p.monthly)}</td><td>{r.pslf ? 'Yes' : '—'}</td>
            <td>{$(p.paid)} over {p.months} months{p.forgiven > 0 && ` · ${$(p.forgiven)} forgiven`}</td></tr>
        ))}</tbody>
      </table></div>

      <div className="box"><strong>OUR PICK: {pick.label}.</strong>{' '}
        {r.pslf
          ? `It has the lowest total paid before forgiveness (${$(pick.paid)} over ${pick.months} months). Every payment counts toward PSLF, and in about ${pick.months} months (${forgiveOn.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}) your remaining ~${$(pick.forgiven)} is forgiven tax-free.`
          : f.priority === 'total'
            ? `It has the lowest estimated total cost, ${$(pick.paid)} paid${pick.forgiven ? ` plus ${$(pick.forgiven)} forgiven that may be taxable` : ''}.`
            : `It has the lowest monthly payment, ${$c(pick.monthly)}. Total paid over the plan: ${$(pick.paid)}${pick.forgiven ? `, with ${$(pick.forgiven)} forgiven after ${pick.months / 12} years` : ''}.`}
        {daysLeft !== null && daysLeft >= 0 && ` Your notice deadline is in ${daysLeft} days; file the switch before then.`}
        {daysLeft !== null && daysLeft < 0 && ' Your notice deadline has passed; contact your servicer today about your current status.'}
      </div>

      {(() => {
        const alt = r.plans.filter(p => p !== pick).sort((a, b) => a.paid - b.paid)[0]
        const dm = alt.monthly - pick.monthly, dp = alt.paid - pick.paid
        const say = (n, w) => `${$(Math.abs(n))} ${n >= 0 ? 'less' : 'more'} ${w}`
        return <p>Versus the next best option ({alt.label}): {$c(Math.abs(dm))} {dm >= 0 ? 'less' : 'more'} per month, and {say(dp, `over ${pick.months} months`)}.</p>
      })()}
      {r.notes.map(n => <div className="box" key={n}>{n}</div>)}

      <div className="box warn"><strong>⚠ WATCH OUT:</strong> Graduated and Extended repayment do NOT count toward PSLF, even when a calculator lists them as cheapest. {r.pslf && 'Choosing one would stall your forgiveness clock.'}</div>

      {r.flags.length > 0 && (
        <div className="box"><strong>SPECIALIST REVIEW RECOMMENDED:</strong> {r.flags.join(' · ')}. These cases have rules this tool models only roughly. Have a credentialed specialist confirm this pick before you file.
          {f.loans.some(l => l.type !== 'direct' && l.type !== 'consol') && ' IBR and RAP require Direct loans; FFEL, Perkins and Parent PLUS loans usually need consolidation first.'}
        </div>
      )}

      <div><p className="cap">Tax notes</p>
        <p>{r.pslf ? 'PSLF forgiveness is not federally taxable.' : idrTaxable ? `Forgiveness under an income-driven plan is treated as federal taxable income starting in 2026. On ${$(pick.forgiven)} forgiven, plan for a tax bill; state rules vary.` : 'No forgiveness is expected on this plan, so no tax event is modeled.'} This is information, not tax advice.</p></div>

      <div><p className="cap">Assumptions</p>
        <ul className="pk-list">
          <li>Your income ({$(r.agiJoint)} counted), household size ({f.household}) and dependents ({f.dependents}) stay the same every year. Real payments change when you recertify.</li>
          <li>Your loans are modeled at one weighted rate of {r.rate.toFixed(2)}% on {$(r.bal)}. Unpaid interest is tracked but not capitalized.</li>
          <li>Poverty line: HHS 2025 guideline for the 48 contiguous states. IBR: {f.older ? '15% / 25 years' : '10% / 20 years'}, capped at the 10-year standard payment. RAP: 1%–10% of AGI by bracket, minus ${RULES.rap.dependentCredit} per dependent, with the principal match.</li>
          <li>Payments are made on time and you stay in qualifying employment{r.pslf ? ` until payment ${RULES.pslfPayments}` : ''}.</li>
          <li>Rules as encoded for {RULES.asOf}, from studentaid.gov program rules and HHS poverty guidelines. Confirm on studentaid.gov before filing.</li>
        </ul></div>

      <div><p className="cap">Next steps</p>
        <ol className="next"><li>Review the application worksheet below.</li><li>Complete and submit the official IDR application at studentaid.gov or through your servicer.</li><li>Keep paying on your current schedule until the switch confirms.</li></ol></div>
    </article>
  )
}

function Worksheet({ f, r }) {
  const line = (k, v) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
  return (
    <article className="card pad pk-report pagebreak">
      <p className="cap">Switch application worksheet · not the official form</p>
      <p>Use these answers to complete the official income-driven repayment application at studentaid.gov. We never submit anything for you.</p>
      <table><tbody>
        {line('Plan requested', r.pick.label === 'Standard (10-yr)' ? 'Stay on Standard (no IDR application needed; confirm with your servicer)' : r.pick.label === 'RAP' ? 'Repayment Assistance Plan (RAP)' : 'Income-Based Repayment (IBR)')}
        {line('Borrower name', f.name || '________________')}
        {line('Loans', f.loans.map(l => `${TYPES[l.type].split(' (')[0]}: ${$c(l.bal)} at ${l.rate}%`).join('; '))}
        {line('Tax filing status', FILING[f.filing])}
        {line('Adjusted gross income', $c(f.agi) + (f.filing === 'mfj' ? ` (spouse ${$c(f.spouseAgi)})` : ''))}
        {line('Family size', f.household)}
        {line('Dependents', f.dependents)}
        {line('PSLF payments made', f.pslf ? `${f.pslfMade} of ${RULES.pslfPayments}` : 'Not pursuing PSLF')}
        {line('Loans outstanding on July 1, 2014', f.older ? 'Yes' : 'No')}
        {line('Social Security number, date of birth, servicer account number', 'Enter these on the official form. We deliberately do not collect them.')}
        {line('Signature and date', '________________________   ____ / ____ / ______')}
      </tbody></table>
    </article>
  )
}

export default function Picker() {
  const [f, setF] = useState(blank)
  const [res, setRes] = useState(null)
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))
  const setLoan = (i, k, v) => setF(s => ({ ...s, loans: s.loans.map((l, j) => (j === i ? { ...l, [k]: v } : l)) }))
  const num = v => Number(v) || 0

  function submit(e) {
    e.preventDefault()
    const p = {
      ...f, loans: f.loans.map(l => ({ type: l.type, bal: num(l.bal), rate: num(l.rate) })),
      agi: num(f.agi), spouseAgi: num(f.spouseAgi), household: Math.max(1, num(f.household)), dependents: num(f.dependents),
      older: f.older === 'yes', pslf: f.pslf === 'yes', pslfMade: num(f.pslfMade), selfEmployed: f.selfEmployed === 'yes', buyback: f.buyback === 'yes',
    }
    setRes({ p, r: compare(p), when: new Date().toLocaleDateString(undefined, { dateStyle: 'long' }) })
    setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  return (
    <>
      <header className="nav noprint"><div className="wrap navin">
        <a href="/" className="brand"><img src="/logo.svg" alt="" width="28" height="28" />Forvest <span className="cap">Plan Picker</span></a>
      </div></header>
      <main className="hq">
        <form className="noprint" onSubmit={submit}>
          <section>
            <h2 className="cap">Your loans</h2>
            <div className="card pad pk-stack">
              {f.loans.map((l, i) => (
                <div className="pk-grid" key={i}>
                  <Field label="Loan type"><select className="hq-in" value={l.type} onChange={e => setLoan(i, 'type', e.target.value)}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
                  <Field label="Balance ($)"><input className="hq-in" type="number" min="1" step="0.01" required value={l.bal} onChange={e => setLoan(i, 'bal', e.target.value)} /></Field>
                  <Field label="Interest rate (%)"><input className="hq-in" type="number" min="0" max="15" step="0.001" required value={l.rate} onChange={e => setLoan(i, 'rate', e.target.value)} /></Field>
                  {f.loans.length > 1 && <button type="button" className="hq-link" onClick={() => set('loans', f.loans.filter((_, j) => j !== i))}>Remove loan</button>}
                </div>
              ))}
              <button type="button" className="btn secondary" onClick={() => set('loans', [...f.loans, { type: 'direct', bal: '', rate: '' }])}>Add another loan</button>
            </div>
          </section>

          <section>
            <h2 className="cap">Income and household</h2>
            <div className="card pad pk-grid">
              <Field label="Your adjusted gross income ($/year)" hint="Line 11 of your last tax return."><input className="hq-in" type="number" min="0" required value={f.agi} onChange={e => set('agi', e.target.value)} /></Field>
              <Field label="Tax filing status"><select className="hq-in" value={f.filing} onChange={e => set('filing', e.target.value)}>{Object.entries(FILING).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
              {f.filing === 'mfj' && <Field label="Spouse's AGI ($/year)"><input className="hq-in" type="number" min="0" required value={f.spouseAgi} onChange={e => set('spouseAgi', e.target.value)} /></Field>}
              <Field label="Household size" hint="You, spouse, and dependents."><input className="hq-in" type="number" min="1" max="15" required value={f.household} onChange={e => set('household', e.target.value)} /></Field>
              <Field label="Dependents"><input className="hq-in" type="number" min="0" max="14" required value={f.dependents} onChange={e => set('dependents', e.target.value)} /></Field>
              <Field label="Self-employed income?"><select className="hq-in" value={f.selfEmployed} onChange={e => set('selfEmployed', e.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></Field>
            </div>
          </section>

          <section>
            <h2 className="cap">PSLF and history</h2>
            <div className="card pad pk-grid">
              <Field label="Working toward PSLF?"><select className="hq-in" value={f.pslf} onChange={e => set('pslf', e.target.value)}><option value="no">No</option><option value="yes">Yes, qualifying employer</option></select></Field>
              {f.pslf === 'yes' && <Field label="Qualifying payments made (0–119)"><input className="hq-in" type="number" min="0" max="119" required value={f.pslfMade} onChange={e => set('pslfMade', e.target.value)} /></Field>}
              {f.pslf === 'yes' && <Field label="Planning a PSLF buyback?"><select className="hq-in" value={f.buyback} onChange={e => set('buyback', e.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></Field>}
              <Field label="Any federal loans outstanding on July 1, 2014?"><select className="hq-in" value={f.older} onChange={e => set('older', e.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></Field>
              {f.pslf === 'no' && <Field label="What matters most?"><select className="hq-in" value={f.priority} onChange={e => set('priority', e.target.value)}><option value="monthly">Lowest monthly payment</option><option value="total">Lowest total cost</option></select></Field>}
              <Field label="Notice deadline (optional)"><input className="hq-in" type="date" value={f.deadline} onChange={e => set('deadline', e.target.value)} /></Field>
              <Field label="Your name (optional)"><input className="hq-in" autoComplete="name" value={f.name} onChange={e => set('name', e.target.value)} /></Field>
            </div>
          </section>

          <p className="small muted">Free estimate. Your numbers are calculated in your browser; nothing is sent or stored. The paid Plan Picker adds specialist review and your filled-out application. This is information, not legal, tax or financial advice.</p>
          <button className="btn primary">Compare my plans</button>
        </form>

        {res && (
          <section id="result">
            <Report f={res.p} r={res.r} when={res.when} />
            <Worksheet f={res.p} r={res.r} />
            <button className="btn secondary noprint" onClick={() => window.print()}>Print or save as PDF</button>
          </section>
        )}
      </main>
    </>
  )
}
