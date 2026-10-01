import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

const Admin = lazy(() => import('./Admin.jsx')) // ponytail: path check instead of a router; only one private route
const Picker = lazy(() => import('./Picker.jsx'))
const path = location.pathname
const page = path.startsWith('/admin') ? <Admin /> : path.startsWith('/plan') ? <Picker /> : <App />
createRoot(document.getElementById('root')).render(<Suspense fallback={null}>{page}</Suspense>)
