// Plan Comparison Engine. Pure functions, no network: borrower numbers never leave the browser.
// Every rule lives in RULES so a regulation change is a one-line edit. Verify against studentaid.gov before relying on it.
export const RULES = {
  asOf: '2026',
  poverty: { base: 15650, perExtra: 5500 }, // HHS 2025 guideline, 48 contiguous states (AK/HI are higher)
  ibr: { newer: { pct: 0.10, years: 20 }, older: { pct: 0.15, years: 25 } }, // "newer" = no federal loans outstanding on 7/1/2014
  rap: { years: 30, min: 10, dependentCredit: 50, principalMatch: 50 }, // 1% of AGI per $10k bracket (max 10%), /12, minus $50 per dependent
  standardYears: 10,
  pslfPayments: 120,
  illustrativeTaxRate: 0.22, // only used to compare plans when IDR forgiveness is taxable
}

const cents = n => Math.round(n * 100) / 100

export function weighted(loans) {
  const bal = loans.reduce((s, l) => s + l.bal, 0)
  const rate = bal ? loans.reduce((s, l) => s + l.bal * l.rate, 0) / bal : 0
  return { bal, rate }
}

export function standardPayment(bal, rate) {
  const r = rate / 1200, n = RULES.standardYears * 12
  return cents(r ? (bal * r) / (1 - (1 + r) ** -n) : bal / n)
}

export function rapPayment(agi, dependents) {
  const pct = Math.min(10, Math.max(0, Math.ceil(agi / 10000) - 1))
  return cents(Math.max(RULES.rap.min, (agi * pct) / 100 / 12 - RULES.rap.dependentCredit * dependents))
}

export function ibrPayment(agi, household, older, cap) {
  const { pct } = older ? RULES.ibr.older : RULES.ibr.newer
  const line = 1.5 * (RULES.poverty.base + RULES.poverty.perExtra * (household - 1))
  return cents(Math.min(cap, (Math.max(0, agi - line) * pct) / 12))
}

// month-by-month: rap = interest waived + principal match; others = unpaid interest tracked, not capitalized
export function simulate({ bal, rate, pay, months, rap }) {
  const r = rate / 1200
  let p = bal, u = 0, paid = 0, m = 0
  while (m < months && p + u > 0.005) {
    m++
    const i = p * r
    if (rap) {
      const x = Math.min(pay, p + i)
      p -= Math.min(p, Math.max(x - i, Math.min(RULES.rap.principalMatch, x)))
      paid += x
    } else {
      u += i
      const x = Math.min(pay, p + u), toU = Math.min(u, x)
      u -= toU; p -= x - toU; paid += x
    }
  }
  return { months: m, paid: cents(paid), left: cents(Math.max(0, p + u)) }
}

export function flags(f) {
  const out = []
  if (f.buyback) out.push('PSLF buyback')
  if (f.older) out.push('Pre-2014 loans')
  if (f.filing === 'mfs') out.push('Married filing separately')
  if (f.selfEmployed) out.push('Self-employed income')
  if (f.loans.some(l => l.type !== 'direct')) out.push('Non-Direct or Parent PLUS loans')
  return out
}

// f: { loans:[{type,bal,rate}], agi, spouseAgi, filing, household, dependents, older, pslf, pslfMade, selfEmployed, buyback, priority }
export function compare(f) {
  const { bal, rate } = weighted(f.loans)
  const std = standardPayment(bal, rate)
  const agiJoint = f.filing === 'mfj' ? f.agi + f.spouseAgi : f.agi // MFS and single count only the borrower
  const pslf = f.pslf && f.pslfMade < RULES.pslfPayments
  const left = RULES.pslfPayments - f.pslfMade
  const ibrTerm = (f.older ? RULES.ibr.older : RULES.ibr.newer).years * 12
  const defs = [
    ['IBR', ibrPayment(agiJoint, f.household, f.older, std), ibrTerm, false],
    ['RAP', rapPayment(agiJoint, f.dependents), RULES.rap.years * 12, true],
    ['Standard (10-yr)', std, RULES.standardYears * 12, false],
  ]
  const plans = defs.map(([label, monthly, term, rap]) => {
    const horizon = pslf ? Math.min(left, term) : term
    const s = simulate({ bal, rate, pay: monthly, months: horizon, rap })
    const forgivenPslf = pslf && s.left > 0 && s.months >= left
    const forgivenIdr = !pslf && s.left > 0 && label !== 'Standard (10-yr)'
    return { label, monthly, months: s.months, paid: s.paid, forgiven: forgivenPslf || forgivenIdr ? s.left : 0, taxFree: forgivenPslf, left: s.left }
  })
  const cost = p => p.paid + (p.taxFree ? 0 : p.forgiven * RULES.illustrativeTaxRate)
  const key = pslf || f.priority === 'total' ? cost : p => p.monthly
  const pick = [...plans].sort((a, b) => key(a) - key(b) || a.monthly - b.monthly)[0]
  const notes = []
  if (f.pslf && f.pslfMade >= RULES.pslfPayments) notes.push('You have reached 120 qualifying payments. Submit the PSLF forgiveness request; no plan change is needed.')
  if (pick.label === 'IBR' && pick.monthly === std) notes.push('Your IBR payment hits the Standard cap, so IBR gives no monthly savings for you.')
  if (!pslf && pick.forgiven > 0) notes.push(`This plan leaves about ${Math.round(pick.forgiven).toLocaleString('en-US')} dollars to be forgiven, and that amount may be taxable. Compare it with a shorter payoff.`)
  return { plans, pick, pslf, pslfLeft: left, bal, rate, flags: flags(f), agiJoint, notes }
}
