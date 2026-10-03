'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type UserRole = 'employee' | 'driver' | 'admin'
export type VehicleInfo = { type: string; model: string; registrationNumber: string; availableSeats: string }
export type AuthUser = { id: string; name: string; email: string; role: UserRole; vehicle?: VehicleInfo }

export const demoUsers: Record<UserRole, AuthUser> = {
  employee: { id: 'emp-001', name: 'Alex Morgan', email: 'employee@intelliride.demo', role: 'employee' },
  driver: { id: 'drv-001', name: 'Rahul Sharma', email: 'driver@intelliride.demo', role: 'driver' },
  admin: { id: 'adm-001', name: 'Admin User', email: 'admin@intelliride.demo', role: 'admin' },
}

export const getWorkspaceForRole = (role: UserRole) => role === 'employee' ? '/dashboard' : role === 'driver' ? '/driver' : '/admin'

type SignupInput = { name: string; email: string; role: 'employee' | 'driver'; vehicle?: VehicleInfo }
type AuthContextValue = { user: AuthUser | null; isAuthenticated: boolean; currentUser: AuthUser | null; login: (role: UserRole) => void; loginAs: (role: UserRole) => void; signup: (input: SignupInput) => void; logout: () => void }
const AuthContext = createContext<AuthContextValue | null>(null)

function enterWorkspace(next: AuthUser) {
  window.localStorage.setItem('intelliride-session', JSON.stringify(next))
  window.history.pushState({}, '', getWorkspaceForRole(next.role))
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { const saved = window.localStorage.getItem('intelliride-session'); if (saved) { try { setUser(JSON.parse(saved)) } catch { window.localStorage.removeItem('intelliride-session') } } setHydrated(true) }, [])
  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    currentUser: user,
    login: (role: UserRole) => { const next = demoUsers[role]; setUser(next); enterWorkspace(next) },
    loginAs: (role: UserRole) => { const next = demoUsers[role]; setUser(next); enterWorkspace(next) },
    signup: (input: SignupInput) => { const next: AuthUser = { id: `user-${Date.now()}`, name: input.name, email: input.email, role: input.role, vehicle: input.vehicle }; setUser(next); enterWorkspace(next) },
    logout: () => { setUser(null); window.localStorage.removeItem('intelliride-session'); window.history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')) },
  }), [user])
  return <AuthContext.Provider value={value}>{hydrated ? children : null}</AuthContext.Provider>
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value }

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [path, setPath] = useState(() => typeof window === 'undefined' ? '/login' : window.location.pathname)
  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  if (!user) return <LoginScreen />
  const target = getWorkspaceForRole(user.role)
  const allowed = path === target || path === '/'
  if (!allowed) { window.history.replaceState({}, '', target); if (path !== target) setTimeout(() => setPath(target), 0); return null }
  return <>{children}</>
}

function LoginScreen() {
  const { login, signup: createAccount } = useAuth()
  const [signup, setSignup] = useState(false)
  const [role, setRole] = useState<'employee' | 'driver'>('employee')
  const [form, setForm] = useState({ name: '', email: '', type: '', model: '', registrationNumber: '', availableSeats: '' })
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (signup) { const vehicle = role === 'driver' ? { type: form.type, model: form.model, registrationNumber: form.registrationNumber, availableSeats: form.availableSeats } : undefined; createAccount({ name: form.name || 'New rider', email: form.email, role, vehicle }) } else login(role) }
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-5 py-6"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)]"><div className="mb-7 text-center"><div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-[#176b5b] text-white">IR</div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to IntelliRide</h1><p className="mt-2 text-sm text-slate-500">{signup ? 'Create your workspace account' : 'Choose a demo account to continue'}</p></div>{signup ? <form onSubmit={submit} className="flex flex-col gap-3"><div className="flex gap-2">{(['employee', 'driver'] as const).map(option => <button type="button" key={option} onClick={() => setRole(option)} className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold capitalize ${role === option ? 'border-[#176b5b] bg-[#f0faf7] text-[#176b5b]' : 'border-slate-200 text-slate-500'}`}>{option}</button>)}</div><input required placeholder="Full name" value={form.name} onChange={event => update('name', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /><input required type="email" placeholder="Work email" value={form.email} onChange={event => update('email', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />{role === 'driver' && <div className="grid grid-cols-2 gap-3">{([['type', 'Vehicle type'], ['model', 'Vehicle model'], ['registrationNumber', 'Registration number'], ['availableSeats', 'Available seats']] as const).map(([key, placeholder]) => <input required key={key} placeholder={placeholder} value={form[key]} onChange={event => update(key, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />)}</div>}<button className="rounded-xl bg-[#176b5b] px-4 py-3 text-sm font-bold text-white">Create account</button><button type="button" onClick={() => setSignup(false)} className="text-xs font-bold text-[#176b5b]">Back to login</button></form> : <div className="flex flex-col gap-3">{(['employee','driver','admin'] as UserRole[]).map(option => <button key={option} onClick={() => login(option)} className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-bold capitalize text-slate-700 transition-colors hover:border-[#176b5b] hover:bg-[#f0faf7]">Continue as {option}<span className="mt-1 block text-xs font-normal text-slate-400">{demoUsers[option].email}</span></button>)}<button onClick={() => setSignup(true)} className="mt-2 text-xs font-bold text-[#176b5b]">Create an Employee or Driver account</button></div>}</section></main>
}

export { AuthContext }
