// run: npm test
import assert from 'node:assert/strict'
import { compare, rapPayment, ibrPayment, standardPayment, simulate } from './engine.js'

assert.equal(rapPayment(9000, 0), 10)                 // minimum
assert.equal(rapPayment(10000, 0), 10)                // $10k or less -> 0% -> minimum
assert.equal(rapPayment(68000, 0), 340)               // 6% bracket
assert.equal(rapPayment(68000, 2), 240)               // -$50 per dependent
assert.equal(rapPayment(150000, 0), 1250)             // capped at 10%
assert.equal(ibrPayment(68000, 1, false, 9999), 371.04) // 10% of (68000 - 1.5*15650)
assert.equal(ibrPayment(68000, 1, true, 200), 200)    // capped at the 10-yr standard payment
assert.equal(ibrPayment(20000, 1, false, 9999), 0)    // under 150% of poverty
assert.equal(standardPayment(12000, 0), 100)
assert.ok(Math.abs(simulate({ bal: 12000, rate: 0, pay: 100, months: 120 }).left) < 0.01) // standard pays off

const maya = { loans: [{ type: 'direct', bal: 36400, rate: 5.5 }], agi: 68000, spouseAgi: 0, filing: 'single', household: 1, dependents: 0, older: false, pslf: true, pslfMade: 105, priority: 'monthly' }
const r = compare(maya)
assert.equal(r.pslfLeft, 15)
assert.ok(r.plans.every(p => p.months === 15 && p.taxFree && p.forgiven > 30000)) // 15 payments left, forgiven tax-free
assert.equal(r.pick.label, 'RAP')                     // RAP $340 < IBR $371 for this case
assert.notEqual(compare({ ...maya, loans: [{ type: 'direct', bal: 2000, rate: 5.5 }] }).pick.label, 'RAP') // RAP has no standard cap: small balance -> RAP overpays, must not be picked
assert.ok(compare({ ...maya, pslfMade: 120 }).notes.some(n => n.includes('120')))
console.log('engine ok')
