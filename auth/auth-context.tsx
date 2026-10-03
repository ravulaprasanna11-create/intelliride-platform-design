'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type UserRole = 'employee' | 'driver' | 'admin'
export type AuthUser = { id: string; name: string; email: string; role: UserRole }

export const demoUsers: Record<UserRole, AuthUser> = {
  employee: { id: 'emp-001', name: 'Alex Morgan', email: 'employee@intelliride.demo', role: 'employee' },
  driver: { id: 'drv-001', name: 'Rahul Sharma', email: 'driver@intelliride.demo', role: 'driver' },
  admin: { id: 'adm-001', name: 'Admin User', email: 'admin@intelliride.demo', role: 'admin' },
}

export const getWorkspaceForRole = (role: UserRole) => role === 'employee' ? '/dashboard' : role === 'driver' ? '/driver' : '/admin'

type AuthContextValue = { user: AuthUser | null; loginAs: (role: UserRole) => void; logout: () => void }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  useEffect(() => { const saved = window.localStorage.getItem('intelliride-session'); if (saved) setUser(JSON.parse(saved)) }, [])
  const value = useMemo(() => ({
    user,
    loginAs: (role: UserRole) => { const next = demoUsers[role]; setUser(next); window.localStorage.setItem('intelliride-session', JSON.stringify(next)); window.history.pushState({}, '', getWorkspaceForRole(role)); window.dispatchEvent(new PopStateEvent('popstate')) },
    logout: () => { setUser(null); window.localStorage.removeItem('intelliride-session'); window.history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')) },
  }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value }

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [path, setPath] = useState(() => typeof window === 'undefined' ? '/login' : window.location.pathname)
  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  const target = user ? getWorkspaceForRole(user.role) : null
  const allowed = !user || path === target || path === '/'
  useEffect(() => {
    if (user && target && !allowed) {
      window.history.replaceState({}, '', target)
      setPath(target)
    }
  }, [allowed, target, user])
  if (!user) return <LoginScreen />
  if (!allowed) return null
  return <>{children}</>
}

function LoginScreen() {
  const { loginAs } = useAuth()
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-5"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)]"><div className="mb-7 text-center"><div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-[#176b5b] text-white">IR</div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to IntelliRide</h1><p className="mt-2 text-sm text-slate-500">Choose a demo account to continue</p></div><div className="flex flex-col gap-3">{(['employee','driver','admin'] as UserRole[]).map(role => <button key={role} onClick={() => loginAs(role)} className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-bold capitalize text-slate-700 transition-colors hover:border-[#176b5b] hover:bg-[#f0faf7]">Continue as {role}<span className="mt-1 block text-xs font-normal text-slate-400">{demoUsers[role].email}</span></button>)}</div><p className="mt-6 text-center text-xs text-slate-400">New users can sign up as Employee or Driver.</p></section></main>
}

export { AuthContext }
