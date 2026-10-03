'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { AuthUser, AuthContextValue, UserRole, VehicleInput } from '@/types/auth'
import {
  Car, ChevronRight, Lock, Mail,
  ShieldAlert, ShieldCheck, Sparkles, User as UserIcon, ArrowRight
} from 'lucide-react'

export { type UserRole, type AuthUser, type VehicleInput, type AuthContextValue }

export const demoUsers: Record<UserRole, AuthUser> = {
  employee: { id: 'emp-001', name: 'Alex Morgan', email: 'employee@intelliride.demo', phone: '+91 98765 43210', role: 'employee' },
  driver: { id: 'drv-001', name: 'Rahul Sharma', email: 'driver@intelliride.demo', phone: '+91 98765 43211', role: 'driver' },
  admin: { id: 'adm-001', name: 'Admin User', email: 'admin@intelliride.demo', phone: '+91 98765 43212', role: 'admin' },
}

export const getWorkspaceForRole = (role: UserRole) => {
  return role === 'employee' ? '/dashboard' : role === 'driver' ? '/driver' : '/admin'
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
let authRequestCounter = 0

function mapAuthErrorMessage(errMessage: string, status?: number, code?: string): string {
  const msg = (errMessage || '').toLowerCase()

  if (msg.includes('invalid api key') || status === 401 || code === 'invalid_api_key') {
    return 'Invalid Supabase API key. Please check NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
  }
  if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('already been registered')) {
    return 'This email is already registered. Please sign in.'
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password') || code === 'invalid_credentials') {
    return 'Incorrect email or password.'
  }
  if (msg.includes('email not confirmed') || code === 'email_not_confirmed') {
    return 'Please confirm your email before signing in.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit') || msg.includes('over_request_rate_limit') || code === 'over_request_rate_limit') {
    return 'Too many login attempts. Please wait and try again later.'
  }
  if (msg.includes('password') && (msg.includes('short') || msg.includes('least') || msg.includes('weak'))) {
    return 'Password must be at least 6 characters long.'
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Unable to connect to Supabase. Please try again.'
  }
  if (msg.includes('signup is disabled') || msg.includes('signups not allowed')) {
    return 'New account registration is currently disabled. Please contact your administrator.'
  }

  if (typeof window !== 'undefined') {
    console.warn('[IntelliRide Auth] Unmapped auth error:', { errMessage, status, code })
  }
  return errMessage || 'Login failed. Please try again.'
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hasVehicle, setHasVehicle] = useState<boolean>(true)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // Fetch real Supabase database profile for a user
  const fetchSupabaseProfile = useCallback(
    async (userId: string, userEmail?: string, metadata?: Record<string, any>): Promise<AuthUser | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, phone, role, avatar_url')
          .eq('id', userId)
          .maybeSingle()

        const profileRow = data as {
          id: string
          name?: string
          email?: string | null
          phone?: string | null
          role?: string
          avatar_url?: string | null
        } | null

        if (profileRow && !error) {
          return {
            id: profileRow.id,
            name: profileRow.name || metadata?.name || userEmail?.split('@')[0] || 'User',
            email: profileRow.email || userEmail || null,
            phone: profileRow.phone || null,
            role: (profileRow.role as UserRole) || 'employee',
            avatarUrl: profileRow.avatar_url || null,
          }
        }

        const safeRole = (metadata?.role === 'driver' ? 'driver' : 'employee') as UserRole
        return {
          id: userId,
          name: metadata?.name || userEmail?.split('@')[0] || 'User',
          email: userEmail || null,
          phone: null,
          role: safeRole,
          avatarUrl: metadata?.avatar_url || null,
        }
      } catch {
        return null
      }
    },
    []
  )

  // Check if driver has a registered vehicle
  const checkDriverVehicle = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      return Boolean(data && data.length > 0 && !error)
    } catch {
      return false
    }
  }, [])

  // Initialize Auth state from Supabase session
  useEffect(() => {
    let isMounted = true

    async function initSession() {
      // Prioritize local demo storage for instant demo session restore
      try {
        const savedDemo = typeof window !== 'undefined'
          ? (window.localStorage.getItem('intelliride_demo_user') || window.localStorage.getItem('intelliride-session'))
          : null
        if (savedDemo && isMounted) {
          const parsed = JSON.parse(savedDemo)
          if (parsed && parsed.id && parsed.role) {
            setUser(parsed)
            setHasVehicle(true)
            setIsInitialized(true)
            return
          }
        }
      } catch {
        // ignore
      }

      if (isSupabaseConfigured && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (!error && session?.user && isMounted) {
            const profile = await fetchSupabaseProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata
            )
            if (profile && isMounted) {
              setUser(profile)
              if (profile.role === 'driver') {
                const vehicleExists = await checkDriverVehicle(profile.id)
                setHasVehicle(vehicleExists)
              } else {
                setHasVehicle(true)
              }
              setIsInitialized(true)
              return
            }
          }
        } catch {
          // Ignore and fall back
        }
      }

      if (isMounted) {
        setIsInitialized(true)
      }
    }

    initSession()

    // Real-time auth listener
    let authListener: { subscription: { unsubscribe: () => void } } | null = null

    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && isMounted) {
          const profile = await fetchSupabaseProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          )
          if (profile && isMounted) {
            setUser(profile)
            if (profile.role === 'driver') {
              const vehicleExists = await checkDriverVehicle(profile.id)
              setHasVehicle(vehicleExists)
            } else {
              setHasVehicle(true)
            }
          }
        } else if (event === 'SIGNED_OUT' && isMounted) {
          setUser(null)
          setHasVehicle(true)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('intelliride-session')
          }
        }
      })
      authListener = data
    }

    return () => {
      isMounted = false
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [fetchSupabaseProfile, checkDriverVehicle])

  // Direct email + password sign in via Supabase
  const signInWithPassword = useCallback(
    async (
      email: string,
      password: string,
      expectedRole?: UserRole
    ): Promise<{ error?: string | null; needsVehicleOnboarding?: boolean }> => {
      const cleanEmail = (email || '').trim().toLowerCase()
      if (!cleanEmail || !password) {
        return { error: 'Please provide both email and password.' }
      }

      if (!EMAIL_REGEX.test(cleanEmail)) {
        return { error: 'Please enter a valid email address.' }
      }

      if (!isSupabaseConfigured) {
        // Dev fallback
        const targetRole = expectedRole || 'employee'
        const demo = demoUsers[targetRole]
        setUser(demo)
        setHasVehicle(true)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('intelliride-session', JSON.stringify(demo))
          window.history.pushState({}, '', getWorkspaceForRole(targetRole))
          window.dispatchEvent(new PopStateEvent('popstate'))
        }
        return { error: null }
      }

      try {
        if (process.env.NODE_ENV === 'development') {
          authRequestCounter += 1
          console.log(`AUTH REQUEST #${authRequestCounter}`)
          console.log(`email: ${cleanEmail}`)
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth Debug] Signin result:', {
            operation: 'signin',
            email: cleanEmail,
            errorMessage: error?.message,
            errorCode: error?.code,
            errorStatus: error?.status,
            hasUser: Boolean(data?.user),
            hasSession: Boolean(data?.session),
          })
        }

        if (error) {
          return { error: mapAuthErrorMessage(error.message, error.status, error.code) }
        }

        if (data.user && data.session) {
          const profile = await fetchSupabaseProfile(data.user.id, data.user.email, data.user.user_metadata)
          if (!profile) {
            return { error: 'Your account was authenticated, but your profile could not be loaded.' }
          }

          // Admin role protection: Never allow unauthorized role access to /admin
          if (expectedRole === 'admin' && profile.role !== 'admin') {
            await supabase.auth.signOut()
            setUser(null)
            return { error: 'Access denied. Your account does not have administrative privileges.' }
          }

          setUser(profile)

          // Driver onboarding check
          if (profile.role === 'driver') {
            const vehicleExists = await checkDriverVehicle(profile.id)
            setHasVehicle(vehicleExists)
            if (!vehicleExists) {
              return { error: null, needsVehicleOnboarding: true }
            }
          } else {
            setHasVehicle(true)
          }

          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', getWorkspaceForRole(profile.role))
            window.dispatchEvent(new PopStateEvent('popstate'))
          }

          return { error: null }
        }

        return { error: 'Sign in failed. Please try again.' }
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Auth Debug] Exception during signin:', err)
        }
        return { error: mapAuthErrorMessage(err?.message) }
      }
    },
    [fetchSupabaseProfile, checkDriverVehicle]
  )

  // Driver vehicle onboarding save
  const saveDriverVehicle = useCallback(
    async (vehicle: VehicleInput): Promise<{ error?: string | null }> => {
      if (!user) {
        return { error: 'You must be logged in to save vehicle information.' }
      }

      if (!vehicle.model?.trim() || !vehicle.licensePlate?.trim()) {
        return { error: 'Vehicle model and license plate are required.' }
      }

      if (!isSupabaseConfigured) {
        setHasVehicle(true)
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/driver')
          window.dispatchEvent(new PopStateEvent('popstate'))
        }
        return { error: null }
      }

      try {
        const { error } = await (supabase.from('vehicles') as any).insert({
          user_id: user.id,
          model: vehicle.model.trim(),
          color: vehicle.color?.trim() || 'Silver',
          license_plate: vehicle.licensePlate.trim().toUpperCase(),
          vehicle_type: vehicle.vehicleType || 'Sedan',
          total_seats: vehicle.totalSeats || 4,
          available_seats: vehicle.availableSeats || 2,
          has_ac: vehicle.hasAc ?? true,
          is_available: true,
        })

        if (error) {
          return { error: mapAuthErrorMessage(error.message) }
        }

        setHasVehicle(true)
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/driver')
          window.dispatchEvent(new PopStateEvent('popstate'))
        }

        return { error: null }
      } catch (err: any) {
        return { error: mapAuthErrorMessage(err?.message) }
      }
    },
    [user]
  )

  // Sign up for new employee or driver accounts
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: 'employee' | 'driver',
      vehicleDetails?: VehicleInput
    ): Promise<{ error?: string | null; confirmationRequired?: boolean }> => {
      const cleanEmail = (email || '').trim().toLowerCase()
      const cleanName = (name || '').trim()

      if (!cleanName) {
        return { error: 'Please enter your full name.' }
      }

      if (!cleanEmail) {
        return { error: 'Please enter your email address.' }
      }

      if (!EMAIL_REGEX.test(cleanEmail)) {
        return { error: 'Please enter a valid email address.' }
      }

      if (!password || password.length < 6) {
        return { error: 'Password must be at least 6 characters long.' }
      }

      if (!isSupabaseConfigured) {
        const demo: AuthUser = {
          id: `usr-${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          role,
        }
        setUser(demo)
        setHasVehicle(true)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('intelliride-session', JSON.stringify(demo))
          window.history.pushState({}, '', getWorkspaceForRole(role))
          window.dispatchEvent(new PopStateEvent('popstate'))
        }
        return { error: null }
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
              role,
            },
          },
        })

        if (error) {
          return { error: mapAuthErrorMessage(error.message, error.status, error.code) }
        }

        if (data.session && data.user) {
          const profile = await fetchSupabaseProfile(data.user.id, data.user.email, data.user.user_metadata)
          if (profile) {
            setUser(profile)

            if (role === 'driver' && vehicleDetails?.model && vehicleDetails?.licensePlate) {
              await (supabase.from('vehicles') as any).insert({
                user_id: profile.id,
                model: vehicleDetails.model.trim(),
                color: vehicleDetails.color?.trim() || 'Silver',
                license_plate: vehicleDetails.licensePlate.trim().toUpperCase(),
                vehicle_type: vehicleDetails.vehicleType || 'Sedan',
                total_seats: vehicleDetails.totalSeats || 4,
                available_seats: vehicleDetails.availableSeats || 2,
                has_ac: vehicleDetails.hasAc ?? true,
                is_available: true,
              })
              setHasVehicle(true)
            }

            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', getWorkspaceForRole(profile.role))
              window.dispatchEvent(new PopStateEvent('popstate'))
            }
            return { error: null }
          }
        }

        // Email confirmation is required by Supabase auth configuration
        return { error: null, confirmationRequired: true }
      } catch (err: any) {
        return { error: mapAuthErrorMessage(err?.message) }
      }
    },
    [fetchSupabaseProfile]
  )

  // Demo user switcher for development testing & hackathon demo mode
  const loginAs = useCallback((role: UserRole) => {
    const next = demoUsers[role]
    setUser(next)
    setHasVehicle(true)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('intelliride-session', JSON.stringify(next))
      window.localStorage.setItem('intelliride_demo_user', JSON.stringify(next))
      window.history.pushState({}, '', getWorkspaceForRole(role))
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [])

  // Sign out from session and clear local demo state
  const logout = useCallback(async () => {
    if (isSupabaseConfigured && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await supabase.auth.signOut()
      } catch {
        // ignore
      }
    }
    setUser(null)
    setHasVehicle(true)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('intelliride-session')
      window.localStorage.removeItem('intelliride_demo_user')
      window.history.pushState({}, '', '/login')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isInitialized,
      isSupabaseActive: isSupabaseConfigured,
      hasVehicle,
      loginAs,
      signInWithPassword,
      signUp,
      saveDriverVehicle,
      logout,
    }),
    [user, isInitialized, hasVehicle, loginAs, signInWithPassword, signUp, saveDriverVehicle, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

// Protected Route Guard with strict Role-based Routing
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuth()
  const [path, setPath] = useState(() => (typeof window === 'undefined' ? '/login' : window.location.pathname))

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const target = user ? getWorkspaceForRole(user.role) : null
  const allowed = !user || path === target || path === '/'

  useEffect(() => {
    if (isInitialized && user && target && !allowed) {
      window.history.replaceState({}, '', target)
      setPath(target)
    }
  }, [allowed, target, user, isInitialized])

  if (!isInitialized) return null
  if (!user) return <LoginScreen />
  if (!allowed) return null
  return <>{children}</>
}

// Email + Password Authentication UI matching IntelliRide design standards
function LoginScreen() {
  const { signInWithPassword, signUp, saveDriverVehicle, loginAs } = useAuth()

  // State
  const [isSignUp, setIsSignUp] = useState(false)
  const [isVehicleSetup, setIsVehicleSetup] = useState(false)
  const [role, setRole] = useState<'employee' | 'driver' | 'admin'>('employee')

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Driver Vehicle Details
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleColor, setVehicleColor] = useState('Silver')
  const [licensePlate, setLicensePlate] = useState('')
  const [vehicleType, setVehicleType] = useState('Sedan')
  const [totalSeats, setTotalSeats] = useState(4)
  const [availableSeats, setAvailableSeats] = useState(2)
  const [hasAc, setHasAc] = useState(true)

  // Feedback states
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [showDevSwitcher, setShowDevSwitcher] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setErrorMessage(null)
    setInfoMessage(null)
    setLoading(true)

    try {
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !isSupabaseConfigured) {
        loginAs(role)
        return
      }

      if (isVehicleSetup) {
        const res = await saveDriverVehicle({
          model: vehicleModel,
          color: vehicleColor,
          licensePlate,
          vehicleType,
          totalSeats,
          availableSeats,
          hasAc,
        })
        if (res.error) {
          setErrorMessage(res.error)
        }
        return
      }

      if (isSignUp && role !== 'admin') {
        const res = await signUp(email, password, name, role)
        if (res.error) {
          setErrorMessage(res.error)
        } else if (res.confirmationRequired) {
          setInfoMessage('Account created! Please check your email inbox to confirm your address before logging in.')
        }
      } else {
        const res = await signInWithPassword(email, password, role)
        if (res.error) {
          setErrorMessage(res.error)
        } else if (res.needsVehicleOnboarding) {
          setIsVehicleSetup(true)
          setInfoMessage('Driver login successful! Please complete vehicle registration.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3.5 flex size-11 items-center justify-center rounded-xl bg-[#176b5b] text-white shadow-sm font-bold">
            IR
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isVehicleSetup
              ? 'Driver Vehicle Registration'
              : isSignUp
              ? `Create ${role === 'driver' ? 'Driver' : 'Employee'} Account`
              : 'Welcome to IntelliRide'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {isVehicleSetup
              ? 'Register your vehicle to offer commute rides on IntelliRide'
              : isSignUp
              ? 'Join your enterprise commute network'
              : 'Sign in to access your role-based commute workspace'}
          </p>
        </div>

        {/* Role Selector Tabs (Disabled during vehicle setup) */}
        {!isVehicleSetup && (
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRole('employee')
                setErrorMessage(null)
              }}
              className={`rounded-lg py-2 transition-colors cursor-pointer ${
                role === 'employee' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('driver')
                setErrorMessage(null)
              }}
              className={`rounded-lg py-2 transition-colors cursor-pointer ${
                role === 'driver' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin')
                setIsSignUp(false)
                setErrorMessage(null)
              }}
              className={`rounded-lg py-2 transition-colors cursor-pointer ${
                role === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Admin
            </button>
          </div>
        )}

        {/* Instant Demo Access Buttons */}
        {!isVehicleSetup && (
          <div className="mb-6 space-y-2">
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase text-center">
              Instant Demo Access
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginAs('employee')}
                className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-center transition hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer"
              >
                <span className="text-xs font-bold text-emerald-900">Employee Demo</span>
                <span className="text-[10px] text-emerald-700">Enter /dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => loginAs('driver')}
                className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/50 p-2.5 text-center transition hover:bg-blue-100 hover:border-blue-300 cursor-pointer"
              >
                <span className="text-xs font-bold text-blue-900">Driver Demo</span>
                <span className="text-[10px] text-blue-700">Enter /driver</span>
              </button>
              <button
                type="button"
                onClick={() => loginAs('admin')}
                className="flex flex-col items-center justify-center rounded-xl border border-purple-200 bg-purple-50/50 p-2.5 text-center transition hover:bg-purple-100 hover:border-purple-300 cursor-pointer"
              >
                <span className="text-xs font-bold text-purple-900">Admin Demo</span>
                <span className="text-[10px] text-purple-700">Enter /admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <ShieldAlert className="size-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#cde7df] bg-[#f0faf7] p-3 text-xs text-[#176b5b]">
            <ShieldCheck className="size-4 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Vehicle Registration Form */}
        {isVehicleSetup ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-[#cde7df] bg-[#f0faf7] p-3 text-xs text-[#176b5b]">
              <div className="flex items-center gap-1.5 font-bold">
                <Car className="size-4" /> Vehicle Details Required
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                To offer rides on the IntelliRide network, please register your vehicle details.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Vehicle Model</label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)}
                  placeholder="Honda City"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-black placeholder:text-slate-400 outline-none focus:border-[#176b5b] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Color</label>
                <input
                  type="text"
                  required
                  value={vehicleColor}
                  onChange={e => setVehicleColor(e.target.value)}
                  placeholder="Silver"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-black placeholder:text-slate-400 outline-none focus:border-[#176b5b] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">License Plate</label>
                <input
                  type="text"
                  required
                  value={licensePlate}
                  onChange={e => setLicensePlate(e.target.value)}
                  placeholder="TS 09 AB 2048"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-black placeholder:text-slate-400 uppercase outline-none focus:border-[#176b5b] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-black outline-none focus:border-[#176b5b] focus:bg-white"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="SUV">SUV</option>
                  <option value="EV">Electric Vehicle</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Total Seats</label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={totalSeats}
                  onChange={e => setTotalSeats(parseInt(e.target.value) || 4)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-black outline-none focus:border-[#176b5b] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Seats for Commute</label>
                <input
                  type="number"
                  min={1}
                  max={totalSeats - 1}
                  value={availableSeats}
                  onChange={e => setAvailableSeats(parseInt(e.target.value) || 2)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-black outline-none focus:border-[#176b5b] focus:bg-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={hasAc}
                onChange={e => setHasAc(e.target.checked)}
                className="accent-[#176b5b] size-4"
              />
              Air Conditioned (AC Available)
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b5b] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#115447] disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Saving Vehicle...' : 'Complete Registration & Continue to Driver Workspace'}
            </button>
          </form>
        ) : (
          /* Email + Password Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && role !== 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={role === 'driver' ? 'Rahul Sharma' : 'Alex Morgan'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-black placeholder:text-slate-400 outline-none transition focus:border-[#176b5b] focus:bg-white"
                  />
                  <UserIcon className="absolute right-3.5 top-3 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {role === 'admin' ? 'Admin Work Email' : 'Work Email'}
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={
                    role === 'admin'
                      ? 'admin@intelliride.demo'
                      : role === 'driver'
                      ? 'driver@intelliride.demo'
                      : 'employee@intelliride.demo'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-black placeholder:text-slate-400 outline-none transition focus:border-[#176b5b] focus:bg-white"
                />
                <Mail className="absolute right-3.5 top-3 size-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative mt-1.5">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-black placeholder:text-slate-400 outline-none transition focus:border-[#176b5b] focus:bg-white"
                />
                <Lock className="absolute right-3.5 top-3 size-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b5b] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#115447] disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              <ArrowRight className="size-3.5" />
            </button>
          </form>
        )}

        {/* Toggle Sign In / Sign Up (Restricted for Admin and during vehicle setup) */}
        {!isVehicleSetup && role !== 'admin' && (
          <div className="mt-4 text-center text-xs text-slate-500">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false)
                    setErrorMessage(null)
                  }}
                  className="font-semibold text-[#176b5b] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true)
                    setErrorMessage(null)
                  }}
                  className="font-semibold text-[#176b5b] hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </span>
            )}
          </div>
        )}

        {/* Development Demo Switcher */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowDevSwitcher(!showDevSwitcher)}
            className="flex w-full items-center justify-between text-left text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#176b5b]" /> Development Quick Switcher
            </span>
            <ChevronRight className={`size-3.5 transition-transform ${showDevSwitcher ? 'rotate-90' : ''}`} />
          </button>

          {showDevSwitcher && (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] text-slate-400">
                Instant test accounts for local workspace verification:
              </p>
              {(['employee', 'driver', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => loginAs(r)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-xs font-bold capitalize text-slate-700 transition hover:border-[#176b5b] hover:bg-[#f0faf7] cursor-pointer"
                >
                  <span>Continue as {r}</span>
                  <span className="text-[10px] font-normal text-slate-400">{demoUsers[r].email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export { AuthContext }
