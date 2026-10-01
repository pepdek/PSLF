import { useEffect, useState } from 'react'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { app, db } from './firebase.js'
import { posts, emails } from './kit.js'

const auth = app && getAuth(app)
const checks = ['Page is live', 'Shared to channel 1 (r/PSLF or r/StudentLoans)', 'Shared to channel 2 (X or LinkedIn)', 'Shared to channel 3 (Facebook group)', 'DMs sent', '100 visitors reached', 'Verdict read']

function Copy({ text }) {
  const [done, setDone] = useState(false)
  const go = async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500) } catch { /* clipboard blocked */ } }
  return <button className="btn primary" onClick={go}>{done ? 'Copied' : 'Copy'}</button>
}

function Doc({ caption, subjects, text }) {
  return (
    <article className="card pad hq-doc">
      <p className="cap">{caption}</p>
      {subjects && <p className="hq-subj">{subjects.map((s, i) => <span key={s}>Subject {i + 1}: {s}<br /></span>)}</p>}
      <p className="hq-text">{text}</p>
      <Copy text={subjects ? `Subject: ${subjects[0]}\n\n${text}` : text} />
    </article>
  )
}

function Hq({ leads, hq, save }) {
  const link = hq.liveUrl || ''
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 6 + i); return d })
  const perDay = days.map(d => leads.filter(l => l.t && l.t.toDateString() === d.toDateString()).length)
  const visitors = Number(hq.visitors) || 0
  const rate = visitors ? (leads.length / visitors) * 100 : null
  const verdict = rate === null ? null : rate >= 10 ? 'Real interest. Build the full product.' : rate >= 3 ? "There's a pulse but the pitch is off. Change the headline or the offer and share again." : "Let this one go and grab the next idea. That's the system working."
  const checked = hq.checks || {}

  return (
    <main className="hq">
      <section>
        <h2 className="cap">Signups</h2>
        <div className="card pad">
          <p className="hq-total">{leads.length}</p>
          <p className="cap">Total signups</p>
          <div className="hq-days">{days.map((d, i) => <div key={i}><strong>{perDay[i]}</strong><span className="cap">{d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</span></div>)}</div>
          {leads.length === 0 ? <p className="muted">No signups yet. Share your first post and they will show up here.</p> : (
            <ul className="hq-feed">{leads.slice(0, 50).map(l => (
              <li key={l.id}><strong>{l.email}</strong><span className="small muted">{l.t?.toLocaleString()} · {l.source}{l.tier ? ` · ${l.tier}` : ''}</span></li>
            ))}</ul>
          )}
          {leads.length > 50 && <p className="small muted">Showing the latest 50 of {leads.length}.</p>}
        </div>
      </section>

      <section>
        <h2 className="cap">Launch kit</h2>
        <div className="card pad hq-doc">
          <label className="cap" htmlFor="url">Your live URL</label>
          <input id="url" className="hq-in" type="url" placeholder="https://" defaultValue={link} onBlur={e => save({ liveUrl: e.target.value.trim() })} />
          <p className="small muted">Replaces [YOUR LINK] in every post below.</p>
        </div>
        {posts.map(([cap, text]) => <Doc key={cap} caption={cap} text={link ? text.replaceAll('[YOUR LINK]', link) : text} />)}
      </section>

      <section>
        <h2 className="cap">Welcome emails</h2>
        {emails.map(e => <Doc key={e.when} caption={e.when} subjects={e.subjects} text={e.body} />)}
      </section>

      <section>
        <h2 className="cap">Checklist</h2>
        <div className="card pad">
          <ul className="hq-checks">{checks.map(c => (
            <li key={c}><label><input type="checkbox" checked={!!checked[c]} onChange={e => save({ checks: { ...checked, [c]: e.target.checked } })} /> {c}</label></li>
          ))}</ul>
        </div>
      </section>

      <section>
        <h2 className="cap">Verdict</h2>
        <div className="card pad hq-doc">
          <label className="cap" htmlFor="vis">Approximate visitors so far</label>
          <input id="vis" className="hq-in" type="number" min="0" inputMode="numeric" defaultValue={hq.visitors ?? ''} onBlur={e => save({ visitors: e.target.value === '' ? null : Number(e.target.value) })} />
          {verdict
            ? <><p className="small muted">{leads.length} signups ÷ {visitors} visitors = {rate.toFixed(1)}%</p><p className="hq-verdict">{verdict}</p></>
            : <p className="small muted">Enter your visitor count to see the verdict.</p>}
        </div>
      </section>
    </main>
  )
}

// live data: owner-only reads, enforced by the security rules as well
function Data() {
  const [leads, setLeads] = useState(null)
  const [hq, setHq] = useState(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(1000)),
      s => setLeads(s.docs.map(d => { const v = d.data({ serverTimestamps: 'estimate' }); return { ...v, id: d.id, t: v.createdAt?.toDate() } })), () => setErr(true))
    const u2 = onSnapshot(doc(db, 'settings', 'hq'), s => setHq(s.data() || {}), () => setErr(true))
    return () => { u1(); u2() }
  }, [])
  if (err) return <p className="hq-msg" role="alert">Couldn't load your data. Check your connection and the Firestore rules, then reload.</p>
  if (!leads || !hq) return <p className="hq-msg muted">Loading…</p>
  return <Hq leads={leads} hq={hq} save={p => setDoc(doc(db, 'settings', 'hq'), p, { merge: true })} />
}

function Gate() {
  const [s, setS] = useState(auth ? { status: 'loading' } : { status: 'unconfigured' })
  useEffect(() => auth && onAuthStateChanged(auth, async u => {
    if (!u) return setS({ status: 'out' })
    try {
      const ref = doc(db, 'settings', 'owner')
      const snap = await getDoc(ref)
      if (!snap.exists()) await setDoc(ref, { uid: u.uid }) // first account to sign in claims the HQ
      else if (snap.data().uid !== u.uid) return setS({ status: 'denied', user: u })
      setS({ status: 'owner', user: u })
    } catch { setS({ status: 'denied', user: u }) }
  }), [])
  const signIn = () => signInWithPopup(auth, new GoogleAuthProvider()).catch(() => {})
  const { status, user } = s
  return (
    <>
      <header className="nav"><div className="wrap navin">
        <span className="brand"><img src="/logo.svg" alt="" width="28" height="28" />Forvest <span className="cap">Launch HQ</span></span>
        {user && <button className="hq-link" onClick={() => signOut(auth)}>Sign out</button>}
      </div></header>
      {status === 'owner' ? <Data /> : (
        <div className="hq-msg">
          {status === 'loading' && <p className="muted">Loading…</p>}
          {status === 'unconfigured' && <p role="alert">Firebase isn't configured. Add your VITE_FIREBASE_* values to .env and rebuild.</p>}
          {status === 'out' && <><p>Private area. Sign in with the Google account that owns this launch.</p><button className="btn secondary" onClick={signIn}>Sign in with Google</button></>}
          {status === 'denied' && <p role="alert">This account isn't the owner of this HQ. Sign out and try the account you first signed in with.</p>}
        </div>
      )}
    </>
  )
}

// dev-only layout preview with fake data (stripped from production builds)
function Preview() {
  const [hq, setHq] = useState({ visitors: 120, liveUrl: 'https://forvest.example' })
  const leads = [...Array(9)].map((_, i) => ({ id: i, email: `borrower${i}@email.com`, t: new Date(Date.now() - i * 8e6), source: ['hero', 'final-cta', 'demo-report'][i % 3], tier: i % 4 === 0 ? 'Plan Picker' : '' }))
  return <><header className="nav"><div className="wrap navin"><span className="brand"><img src="/logo.svg" alt="" width="28" height="28" />Forvest <span className="cap">Launch HQ</span></span></div></header><Hq leads={leads} hq={hq} save={p => setHq(h => ({ ...h, ...p }))} /></>
}

export default function Admin() {
  useEffect(() => {
    document.title = 'Launch HQ'
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.append(m)
  }, [])
  return import.meta.env.DEV && location.search === '?preview' ? <Preview /> : <Gate />
}
