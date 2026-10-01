import { initializeApp } from 'firebase/app'
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore'

// ponytail: config comes from .env (VITE_FIREBASE_*), filled by the AI Studio/Firebase console; no keys in code.
const e = import.meta.env
const cfg = { apiKey: e.VITE_FIREBASE_API_KEY, authDomain: e.VITE_FIREBASE_AUTH_DOMAIN, projectId: e.VITE_FIREBASE_PROJECT_ID, appId: e.VITE_FIREBASE_APP_ID }
export const app = cfg.projectId ? initializeApp(cfg) : null
export const db = app && getFirestore(app)

export function saveLead(email, source, tier) {
  if (!db) return Promise.reject(new Error('Firebase not configured'))
  return addDoc(collection(db, 'leads'), { email, createdAt: serverTimestamp(), source, tier: tier || '' })
}
