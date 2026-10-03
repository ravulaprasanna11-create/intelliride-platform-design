'use client'

import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/auth/auth-context'
import {
  Activity, ArrowRight, Bell, CalendarDays, Car, Check, ChevronDown, Clock3, Compass,
  Home, Leaf, MapPin, Menu, Navigation, Plus, Route, Search, Settings2, ShieldCheck,
  Sparkles, UserRound, Users, X, Zap, BarChart3, FileText, SlidersHorizontal, CircleDot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RouteMap } from '@/components/maps/route-map'

type Role = 'Employee' | 'Driver' | 'Admin'
type Status = 'Requested' | 'Accepted' | 'Confirmed' | 'Started' | 'Completed' | 'Cancelled'
type PaymentStatus = 'pending' | 'due' | 'processing' | 'paid' | 'failed'

type Ride = {
  id: string
  driver: string
  vehicle: string
  from: string
  pickup: string
  to: string
  time: string
  arrival: string
  match: string
  seats: number
  status: Status
  detour: string
  pricePerPassenger: number
  totalEstimatedCost: number
  driverExpectedEarnings: number
  paymentStatus: PaymentStatus
  reasons?: string[]
}

const rides: Ride[] = [
  { id: 'IR-1024', driver: 'Rohan Shah', vehicle: 'Honda City · Silver', from: 'Kondapur', pickup: 'Hitech City Metro', to: 'Acme HQ', time: '8:20 AM', arrival: '8:48 AM', match: '92%', seats: 2, status: 'Confirmed', detour: '5 min', pricePerPassenger: 100, totalEstimatedCost: 300, driverExpectedEarnings: 300, paymentStatus: 'pending' },
  { id: 'IR-1028', driver: 'Priya Mehta', vehicle: 'Hyundai Creta · White', from: 'Jubilee Hills', pickup: 'Checkpost', to: 'Acme HQ', time: '8:25 AM', arrival: '8:55 AM', match: '87%', seats: 3, status: 'Requested', detour: '9 min', pricePerPassenger: 120, totalEstimatedCost: 360, driverExpectedEarnings: 360, paymentStatus: 'pending' },
  { id: 'IR-1031', driver: 'Arjun Kumar', vehicle: 'Toyota Glanza · Blue', from: 'Gachibowli', pickup: 'Kondapur RTO', to: 'Acme HQ', time: '8:35 AM', arrival: '9:02 AM', match: '81%', seats: 1, status: 'Accepted', detour: '12 min', pricePerPassenger: 90, totalEstimatedCost: 270, driverExpectedEarnings: 270, paymentStatus: 'pending' },
]

const activity = ['Ride request accepted', 'Pickup point optimized', 'Driver departure changed to 8:25 AM', 'AI found an alternative ride']

const employeeNav = [
  ['Overview', Compass], ['My Commute', Route], ['Find a Ride', Search], ['My Rides', CalendarDays], ['Live Trip', Navigation], ['AI Commute Agent', Sparkles], ['Notifications', Bell], ['Profile', UserRound],
]
const driverNav = [
  ['Overview', Compass], ['My Commute', Route], ['Offer a Ride', Car], ['My Rides', CalendarDays], ['Live Trip', Navigation], ['AI Commute Agent', Sparkles], ['Notifications', Bell], ['Profile', UserRound], ['Earnings', Zap],
]
const adminNav = [
  ['Admin Overview', BarChart3], ['Commute Analytics', Activity], ['Ride Utilization', SlidersHorizontal], ['Reports', FileText],
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-[#176b5b] text-white shadow-sm">
        <Navigation className="size-4" fill="currentColor" />
      </div>
      <span className="text-[17px] font-bold tracking-tight text-slate-900">
        Intelli<span className="text-[#176b5b]">Ride</span>
      </span>
    </div>
  )
}

function Badge({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'slate' | 'red' }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-1 text-[10px] font-bold',
        tone === 'green' && 'bg-[#e9f6f2] text-[#176b5b]',
        tone === 'amber' && 'bg-amber-50 text-amber-700',
        tone === 'red' && 'bg-red-50 text-red-600',
        tone === 'slate' && 'bg-slate-100 text-slate-600'
      )}
    >
      {children}
    </span>
  )
}

function Button({
  children,
  onClick,
  variant = 'primary',
  className,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'ghost'
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-[#176b5b] text-white hover:bg-[#115447]',
        variant === 'outline' && 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        variant === 'ghost' && 'text-[#176b5b] hover:bg-[#e9f6f2]',
        className
      )}
    >
      {children}
    </button>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]', className)}>
      {children}
    </section>
  )
}

function MapPreview({
  live = false,
  origin = 'Kondapur, Hyderabad',
  destination = 'Acme HQ, Hitech City',
  pickupLocation,
}: {
  live?: boolean
  origin?: string
  destination?: string
  pickupLocation?: string
}) {
  return <RouteMap live={live} origin={origin} destination={destination} pickupLocation={pickupLocation} />
}


function Metric({ icon: Icon, label, value, meta }: { icon: typeof Clock3; label: string; value: string; meta: string }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#e9f6f2] text-[#176b5b]">
          <Icon className="size-4" />
        </div>
        <span className="text-[10px] font-bold text-emerald-600">{meta}</span>
      </div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">{value}</p>
    </Card>
  )
}

function RideCard({
  ride,
  onRequest,
  requestStatus = 'none',
  onCancelRequest,
  isRequesting = false,
}: {
  ride: Ride
  onRequest: () => void
  requestStatus?: 'none' | 'pending' | 'accepted' | 'rejected' | 'cancelled'
  onCancelRequest?: () => void
  isRequesting?: boolean
}) {
  const [showMap, setShowMap] = useState(false)

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
            {ride.driver.split(' ').map(x => x[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{ride.driver}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{ride.vehicle}</p>
          </div>
        </div>
        <Badge tone={requestStatus === 'accepted' ? 'green' : requestStatus === 'pending' ? 'amber' : requestStatus === 'rejected' ? 'red' : 'green'}>
          {requestStatus === 'accepted' ? 'CONFIRMED' : requestStatus === 'pending' ? 'PENDING' : requestStatus === 'rejected' ? 'REJECTED' : `${ride.match} match`}
        </Badge>
      </div>
      <div className="my-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-[11px]">
        <div>
          <p className="text-slate-400">Departure</p>
          <p className="mt-1 font-bold text-slate-700">{ride.time}</p>
        </div>
        <div>
          <p className="text-slate-400">Pickup</p>
          <p className="mt-1 truncate font-bold text-slate-700">{ride.pickup}</p>
        </div>
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1"><Users className="size-3.5" />{ride.seats} seats</span>
        <span className="flex items-center gap-1"><Route className="size-3.5" />{ride.detour} detour</span>
      </div>
      <div className="my-3 flex items-center justify-between rounded-xl bg-[#f0faf7] px-3 py-2 text-xs">
        <span className="text-slate-500">Passenger price</span>
        <b className="text-[#176b5b]">₹{ride.pricePerPassenger} / passenger</b>
      </div>
      {ride.reasons && ride.reasons.length > 0 && (
        <div className="mb-3 rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-[10px] text-slate-600">
          <p className="font-bold text-[#176b5b] mb-1">Match Criteria:</p>
          <ul className="list-disc pl-3.5 space-y-0.5">
            {ride.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="text-[11px] font-semibold text-[#176b5b] hover:underline cursor-pointer flex items-center gap-1"
        >
          <Route className="size-3" /> {showMap ? 'Hide route map' : 'View route map'}
        </button>
      </div>
      {showMap && (
        <div className="mb-3">
          <RouteMap origin={ride.from} destination={ride.to} pickupLocation={ride.pickup} height="min-h-[160px]" />
        </div>
      )}
      {requestStatus === 'pending' ? (
        <div className="space-y-2">
          <Button disabled className="w-full bg-amber-500 text-white">
            <Clock3 className="size-3.5" /> Pending Driver Approval
          </Button>
          {onCancelRequest && (
            <button
              onClick={onCancelRequest}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-red-600 cursor-pointer"
            >
              Cancel Request
            </button>
          )}
        </div>
      ) : requestStatus === 'accepted' ? (
        <Button disabled className="w-full bg-emerald-600 text-white">
          <Check className="size-3.5" /> Ride Confirmed
        </Button>
      ) : requestStatus === 'rejected' ? (
        <div className="space-y-2">
          <Button disabled variant="outline" className="w-full border-red-200 text-red-600">
            Request Rejected
          </Button>
          <Button onClick={onRequest} disabled={isRequesting} className="w-full">
            {isRequesting ? 'Requesting...' : `Retry Request — ₹${ride.pricePerPassenger}`}
          </Button>
        </div>
      ) : (
        <Button onClick={onRequest} disabled={isRequesting || ride.seats <= 0} className="w-full">
          {isRequesting ? 'Requesting...' : ride.seats <= 0 ? 'No Seats Left' : `Request Ride — ₹${ride.pricePerPassenger}`} <ArrowRight className="size-3.5" />
        </Button>
      )}
    </Card>
  )
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#176b5b]">{eyebrow}</p>}
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Dashboard({
  go,
  currentRide,
  setCurrentRide,
  role,
  userName,
}: {
  go: (s: string) => void
  currentRide: Ride
  setCurrentRide: (r: Ride) => void
  role: Role
  userName: string
}) {
  const firstName = userName ? userName.split(' ')[0] : (role === 'Driver' ? 'Rahul' : 'Alex')
  const isDriver = role === 'Driver'

  return (
    <main className="mx-auto w-full max-w-[1450px] px-5 py-7 sm:px-8 lg:py-9">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.15em] text-[#176b5b]">
            <span className="size-1.5 rounded-full bg-[#3caf91]" />
            Tuesday, October 8, 2024
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isDriver ? 'Your driver morning commute is ready for matching.' : 'Your commute is coordinated for today.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => go('My Commute')}>
            Modify commute
          </Button>
          {isDriver ? (
            <Button onClick={() => go('Offer a Ride')}>
              <Plus className="size-3.5" />
              Offer a ride
            </Button>
          ) : (
            <Button onClick={() => go('Find a Ride')}>
              <Plus className="size-3.5" />
              Find a ride
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.9fr)]">
        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:p-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Route className="size-4 text-[#176b5b]" />
                <span className="text-[11px] font-bold uppercase tracking-[.13em] text-slate-400">
                  Today&apos;s commute
                </span>
              </div>
              <div className="flex items-center gap-3 text-lg font-bold">
                Home <ArrowRight className="size-4 text-slate-300" /> Acme HQ
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Kondapur, Hyderabad · 12.4 km optimized route
              </p>
            </div>
            <Badge>CONFIRMED</Badge>
          </div>
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Departure</p>
                  <p className="mt-1 font-bold">8:20 AM</p>
                </div>
                <div>
                  <p className="text-slate-400">ETA</p>
                  <p className="mt-1 font-bold">8:48 AM</p>
                </div>
                <div>
                  <p className="text-slate-400">{isDriver ? 'Role' : 'Driver'}</p>
                  <p className="mt-1 font-bold">{isDriver ? 'Driver (You)' : 'Rohan Shah'}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pickup point</span>
                  <span className="font-bold">Hitech City Metro</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-slate-500">Vehicle · seats</span>
                  <span className="font-bold">Honda City · 2 available</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => go('Live Trip')}>View ride</Button>
                <Button variant="outline" onClick={() => go('My Commute')}>Modify</Button>
              </div>
            </div>
            <MapPreview />
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle
              eyebrow="AI commute insight"
              title={isDriver ? 'Compatible passengers found' : 'Compatible rides found'}
            />
            <p className="text-sm leading-6 text-slate-600">
              {isDriver
                ? '2 employees travelling along your route have compatible schedules today.'
                : '3 employees travelling toward your office have compatible schedules today.'}
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Route compatibility</span>
                <b>Excellent</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Schedule compatibility</span>
                <b>8:15–8:45 AM</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isDriver ? 'Detour time' : 'Pickup convenience'}</span>
                <b>{isDriver ? '+4 min detour' : 'Within 650 m'}</b>
              </div>
            </div>
            {isDriver ? (
              <Button variant="ghost" onClick={() => go('Offer a Ride')}>
                Review passengers <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => go('Find a Ride')}>
                Review matches <ArrowRight className="size-3.5" />
              </Button>
            )}
          </Card>
          <Card className="p-5">
            <SectionTitle eyebrow="Privacy" title="Location stays contextual" />
            <div className="flex gap-3">
              <ShieldCheck className="size-5 shrink-0 text-[#176b5b]" />
              <p className="text-xs leading-5 text-slate-500">
                Your location is used only for commute coordination and shared with your ride when needed.
              </p>
            </div>
            <Button variant="ghost" onClick={() => go('Profile')}>Manage privacy</Button>
          </Card>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Clock3} label="Today's commute time" value="28 min" meta="-12%" />
        <Metric icon={Leaf} label="Potential CO₂ reduction" value="2.4 kg" meta="This week" />
        <Metric icon={Users} label="Shared distance" value="48.6 km" meta="+18%" />
        <Metric icon={Zap} label={isDriver ? 'Expected earnings' : 'Estimated savings'} value={isDriver ? '₹300' : '₹120'} meta="Today" />
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-5">
          <SectionTitle
            eyebrow="Upcoming rides"
            title="Your commute schedule"
            action={<Button variant="ghost" onClick={() => go('My Rides')}>View all</Button>}
          />
          <div className="divide-y divide-slate-100">
            {rides.slice(0, 3).map(r => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#e9f6f2] text-[#176b5b]">
                    <CalendarDays className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{r.time} · {r.pickup}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{r.driver} · {r.vehicle}</p>
                  </div>
                </div>
                <Badge tone={r.status === 'Requested' ? 'amber' : 'green'}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle eyebrow="Recent activity" title="What&apos;s happening" />
          {activity.map((x, i) => (
            <div key={x} className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
              <div className="mt-1 flex size-5 items-center justify-center rounded-full bg-[#e9f6f2] text-[#176b5b]">
                <Check className="size-3" />
              </div>
              <div>
                <p className="text-xs font-semibold">{x}</p>
                <p className="mt-1 text-[10px] text-slate-400">{i + 1} hour{i ? 's' : ''} ago</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </main>
  )
}

function Commute({ go }: { go: (s: string) => void }) {
  const [origin, setOrigin] = useState('Kondapur, Hyderabad')
  const [destination, setDestination] = useState('Acme HQ, Hitech City')
  const [departureTime, setDepartureTime] = useState('8:30 AM')
  const [returnTime, setReturnTime] = useState('5:30 PM')
  const [pickupPreference, setPickupPreference] = useState('Nearby landmark')
  const [commuteRole, setCommuteRole] = useState<'Passenger' | 'Driver' | 'Either'>('Either')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/commute')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          if (res.data.origin) setOrigin(res.data.origin)
          if (res.data.destination) setDestination(res.data.destination)
          if (res.data.departureTime) setDepartureTime(res.data.departureTime)
          if (res.data.returnTime) setReturnTime(res.data.returnTime)
          if (res.data.pickupPreference) setPickupPreference(res.data.pickupPreference)
          if (res.data.commuteRole) {
            const roleCap = res.data.commuteRole.charAt(0).toUpperCase() + res.data.commuteRole.slice(1)
            setCommuteRole(roleCap as any)
          }
        }
      })
      .catch(() => {})
  }, [])

  const [geoStatus, setGeoStatus] = useState<string | null>(null)

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.')
      return
    }
    setGeoStatus('Locating...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4)
        const lng = pos.coords.longitude.toFixed(4)
        setOrigin(`Current Location (${lat}, ${lng})`)
        setGeoStatus(null)
      },
      () => {
        setGeoStatus(null)
        setErrorMessage('Location access denied or unavailable. Manual address preserved.')
      },
      { timeout: 8000 }
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/commute', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureTime,
          returnTime,
          pickupPreference,
          commuteRole: commuteRole.toLowerCase(),
        }),
      }).then(r => r.json())

      if (res.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setErrorMessage(res.error || 'Failed to save commute')
      }
    } catch {
      setErrorMessage('Network error while saving commute')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Commute profile" title="My Commute" action={<Badge><ShieldCheck className="mr-1 inline size-3" />Private by default</Badge>} />
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {errorMessage}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="p-5">
          <SectionTitle title="Route" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">Home location</label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={!!geoStatus}
                  className="text-[10px] font-bold text-[#176b5b] hover:underline cursor-pointer disabled:opacity-50"
                >
                  {geoStatus || '📍 Use Current Location'}
                </button>
              </div>
              <input value={origin} onChange={e => setOrigin(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176b5b]" />
            </div>
            <div>
              <label className="text-xs font-semibold">Office location</label>
              <input value={destination} onChange={e => setDestination(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176b5b]" />
            </div>
          </div>
          <div className="mt-4">
            <MapPreview origin={origin} destination={destination} />
          </div>

          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <span>12.4 km estimated</span>
            <span>28 min travel time</span>
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle title="Work schedule" />
            <div className="flex gap-2">
              {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                <button key={i} className="flex size-9 items-center justify-center rounded-lg bg-[#e9f6f2] text-xs font-bold text-[#176b5b]">
                  {d}
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold">
                Departure
                <input value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="text-xs font-semibold">
                Return
                <input value={returnTime} onChange={e => setReturnTime(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Flexible departure range: <b>8:15–8:45 AM</b>
            </p>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Commute role" />
            <div className="grid grid-cols-3 gap-2">
              {(['Passenger', 'Driver', 'Either'] as const).map(x => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setCommuteRole(x)}
                  className={cn('rounded-xl border px-2 py-2.5 text-xs font-semibold cursor-pointer', commuteRole === x ? 'border-[#176b5b] bg-[#e9f6f2] text-[#176b5b]' : 'border-slate-200 text-slate-600')}
                >
                  {x}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              Passengers do not need to add vehicle details. Driver rides require available seats and schedule.
            </p>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Pickup preferences" />
            <div className="grid gap-2 text-xs">
              {['Nearby landmark', 'Fixed pickup point', 'Flexible pickup', 'Doorstep where permitted'].map((x) => (
                <label key={x} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pickup"
                    checked={pickupPreference === x}
                    onChange={() => setPickupPreference(x)}
                    className="accent-[#176b5b]"
                  />
                  {x}
                </label>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving} className="mt-4 w-full">
              {saving ? 'Saving...' : saved ? <><Check className="size-3.5" />Commute saved</> : 'Save commute'}
            </Button>
          </Card>
        </div>
      </div>
    </main>
  )
}

function FindRide({
  setCurrentRide,
  currentRide,
  go,
}: {
  setCurrentRide: (r: Ride) => void
  currentRide: Ride
  go: (s: string) => void
}) {
  const [availableRidesList, setAvailableRidesList] = useState<Ride[]>(rides)
  const [requestStatuses, setRequestStatuses] = useState<Record<string, { status: string; id?: string }>>({})
  const [requestingId, setRequestingId] = useState<string | null>(null)

  const fetchRides = () => {
    fetch('/api/matching/rides', {
      headers: { 'x-demo-role': 'employee' },
    })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data && Array.isArray(res.data.matches) && res.data.matches.length > 0) {
          const mapped: Ride[] = res.data.matches.map((item: any, idx: number) => {
            const r = item.ride
            return {
              id: r.id || `IR-10${24 + idx}`,
              driver: r.driverName || r.driver || 'Rohan Shah',
              vehicle: r.vehicle || 'Honda City · Silver',
              from: r.origin || 'Kondapur',
              pickup: r.pickupLocation || 'Hitech City Metro',
              to: r.destination || 'Acme HQ',
              time: r.departureTime || r.time || '8:20 AM',
              arrival: r.eta || '8:48 AM',
              match: `${item.score}%`,
              seats: r.seatsAvailable ?? r.seats ?? 2,
              status: (r.status === 'confirmed' ? 'Confirmed' : r.status) as any,
              detour: '5 min',
              pricePerPassenger: r.pricePerPassenger || 100,
              totalEstimatedCost: r.totalCost || 300,
              driverExpectedEarnings: r.totalCost || 300,
              paymentStatus: 'pending',
              reasons: item.reasons,
            }
          })
          setAvailableRidesList(mapped)

          mapped.forEach(r => {
            fetch(`/api/rides/${r.id}/request`, {
              headers: { 'x-demo-role': 'employee' },
            })
              .then(res => res.json())
              .then(res => {
                if (res.success && res.data) {
                  setRequestStatuses(prev => ({
                    ...prev,
                    [r.id]: { status: res.data.status, id: res.data.request?.id },
                  }))
                }
              })
              .catch(() => {})
          })
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchRides()
  }, [])

  const handleRequestRide = async (ride: Ride) => {
    setRequestingId(ride.id)
    try {
      const res = await fetch(`/api/rides/${ride.id}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'employee',
        },
        body: JSON.stringify({ pickupLocation: ride.pickup }),
      }).then(r => r.json())

      if (res.success) {
        setRequestStatuses(prev => ({
          ...prev,
          [ride.id]: { status: 'pending', id: res.data.id },
        }))
        setCurrentRide({ ...ride, status: 'Requested' })
      } else {
        alert(res.error || 'Unable to request ride')
      }
    } catch {
      alert('Network error while requesting ride')
    } finally {
      setRequestingId(null)
    }
  }

  const handleCancelRequest = async (rideId: string) => {
    try {
      const res = await fetch(`/api/rides/${rideId}/request`, {
        method: 'DELETE',
        headers: { 'x-demo-role': 'employee' },
      }).then(r => r.json())

      if (res.success) {
        setRequestStatuses(prev => ({
          ...prev,
          [rideId]: { status: 'cancelled' },
        }))
      } else {
        alert(res.error || 'Unable to cancel request')
      }
    } catch {
      alert('Network error while canceling request')
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1250px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="AI matching" title="Find your commute" action={<Button variant="outline" onClick={fetchRides}><SlidersHorizontal className="size-3.5" />Refresh</Button>} />
      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-[11px] font-bold text-slate-500">
            From
            <input defaultValue="Kondapur" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            To
            <input defaultValue="Acme HQ" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            Date
            <input defaultValue="Today, Oct 8" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            Departure time
            <input defaultValue="Around 8:30 AM" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
        </div>
      </Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">{availableRidesList.length} compatible rides · ranked by route, schedule, pickup, and capacity</p>
        <Badge>AI ranked</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {availableRidesList.map(ride => {
          const reqInfo = requestStatuses[ride.id]
          const currentStatus = (reqInfo?.status || 'none') as any
          return (
            <div key={ride.id} className="relative">
              <RideCard
                ride={ride}
                requestStatus={currentStatus}
                isRequesting={requestingId === ride.id}
                onRequest={() => handleRequestRide(ride)}
                onCancelRequest={() => handleCancelRequest(ride.id)}
              />
            </div>
          )
        })}
      </div>
      <Card className="mt-5 grid gap-4 p-5 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm font-bold">Why this match?</p>
          <p className="mt-1 text-xs text-slate-500">Every recommendation explains the decision before you approve it.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <span>Route <b className="block text-[#176b5b]">Excellent</b></span>
            <span>Schedule <b className="block text-[#176b5b]">Excellent</b></span>
            <span>Pickup <b className="block text-[#176b5b]">Good</b></span>
            <span>Capacity <b className="block text-[#176b5b]">Available</b></span>
          </div>
        </div>
        <Button onClick={() => go('My Rides')}>View requests <ArrowRight className="size-3.5" /></Button>
      </Card>
    </main>
  )
}

function Driver({ go }: { go: (s: string) => void }) {
  const [offered, setOffered] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [vehicle, setVehicle] = useState<any>({
    model: 'Toyota Innova Crysta',
    licensePlate: 'TS 09 EQ 4096',
    vehicleType: 'SUV',
    totalSeats: 6,
    availableSeats: 4,
    hasAc: true,
  })
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [incomingRequests, setIncomingRequests] = useState<any[]>([])

  const fetchDriverRequests = () => {
    fetch('/api/rides/IR-1024/requests', {
      headers: { 'x-demo-role': 'driver' },
    })
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setIncomingRequests(res.data)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchDriverRequests()
  }, [])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/rides/IR-1024/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'x-demo-role': 'driver' },
      }).then(r => r.json())

      if (res.success) {
        setIncomingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r))
        setVehicle((v: any) => ({ ...v, availableSeats: Math.max(0, (v.availableSeats || 1) - 1) }))
      } else {
        alert(res.error || 'Failed to accept request')
      }
    } catch {
      alert('Network error accepting request')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/rides/IR-1024/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'x-demo-role': 'driver' },
      }).then(r => r.json())

      if (res.success) {
        setIncomingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r))
      } else {
        alert(res.error || 'Failed to reject request')
      }
    } catch {
      alert('Network error rejecting request')
    }
  }

  const displayRequests = incomingRequests.length > 0 ? incomingRequests : [
    { id: 'req-demo-001', userName: 'Alex Morgan', pickupLocation: 'Hitech City Metro', status: 'pending' },
    { id: 'req-demo-002', userName: 'Priya Mehta', pickupLocation: 'Jubilee Hills Checkpost', status: 'pending' },
  ]

  useEffect(() => {
    fetch('/api/vehicles', {
      headers: { 'x-demo-role': 'driver' },
    })
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setVehicle(res.data[0])
        }
      })
      .catch(() => {})
  }, [])

  const handleSaveVehicle = async () => {
    setSavingVehicle(true)
    try {
      const res = await fetch('/api/vehicles', {
        method: vehicle.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'driver',
        },
        body: JSON.stringify(vehicle),
      }).then(r => r.json())

      if (res.success && res.data) {
        setVehicle(res.data)
        setIsEditingVehicle(false)
      }
    } catch {
      // ignore
    } finally {
      setSavingVehicle(false)
    }
  }

  // Offer Ride State
  const [rideOrigin, setRideOrigin] = useState('Kondapur')
  const [rideDestination, setRideDestination] = useState('Acme HQ')
  const [rideDepartureTime, setRideDepartureTime] = useState('8:20 AM')
  const [rideAvailableSeats, setRideAvailableSeats] = useState(2)
  const [creatingRide, setCreatingRide] = useState(false)
  const [createRideError, setCreateRideError] = useState<string | null>(null)

  const handleOfferRide = async () => {
    setCreatingRide(true)
    setCreateRideError(null)
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'driver',
        },
        body: JSON.stringify({
          origin: rideOrigin,
          destination: rideDestination,
          pickupLocation: rideOrigin,
          departureTime: rideDepartureTime,
          eta: '8:48 AM',
          vehicleId: vehicle.id || 'veh-demo-001',
          totalCost: 300,
          pricePerPassenger: 100,
          seatsAvailable: rideAvailableSeats,
        }),
      }).then(r => r.json())

      if (res.success) {
        setOffered(true)
      } else {
        setCreateRideError(res.error || 'Failed to offer ride')
      }
    } catch {
      setCreateRideError('Network error while offering ride')
    } finally {
      setCreatingRide(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1250px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Driver workspace" title="Your morning commute" action={<Badge>Vehicle available</Badge>} />
      <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle title="Vehicle management" action={<Car className="size-5 text-[#176b5b]" />} />
            {isEditingVehicle ? (
              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-semibold">
                    Model
                    <input
                      value={vehicle.model || ''}
                      onChange={e => setVehicle({ ...vehicle, model: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#176b5b]"
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    License Plate
                    <input
                      value={vehicle.licensePlate || ''}
                      onChange={e => setVehicle({ ...vehicle, licensePlate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs uppercase outline-none focus:border-[#176b5b]"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-xs font-semibold">
                    Type
                    <input
                      value={vehicle.vehicleType || 'SUV'}
                      onChange={e => setVehicle({ ...vehicle, vehicleType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Total Seats
                    <input
                      type="number"
                      value={vehicle.totalSeats || 6}
                      onChange={e => setVehicle({ ...vehicle, totalSeats: parseInt(e.target.value) || 4 })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Available
                    <input
                      type="number"
                      value={vehicle.availableSeats || 4}
                      onChange={e => setVehicle({ ...vehicle, availableSeats: parseInt(e.target.value) || 2 })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveVehicle} disabled={savingVehicle}>
                    {savingVehicle ? 'Saving...' : 'Save Vehicle'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingVehicle(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-bold">{vehicle.model}</p>
                    <p className="mt-1 text-xs text-slate-500">{vehicle.licensePlate} · {vehicle.vehicleType}</p>
                  </div>
                  <Badge>Available</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <span>Capacity <b className="block">{vehicle.totalSeats} seats</b></span>
                  <span>Available <b className="block">{vehicle.availableSeats} seats</b></span>
                  <span>AC <b className="block">{vehicle.hasAc ? 'Yes' : 'No'}</b></span>
                </div>
              </div>
            )}
            {!isEditingVehicle && (
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setIsEditingVehicle(true)}>Edit vehicle</Button>
                <Button variant="outline">Set availability</Button>
              </div>
            )}
          </Card>
          <Card className="p-5">
            <SectionTitle title="Offer a ride" />
            {createRideError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                {createRideError}
              </div>
            )}
            <div className="mb-4 flex items-center gap-1">
              {['Vehicle', 'Route', 'Schedule', 'Review'].map((x, i) => (
                <div key={x} className="flex flex-1 items-center gap-1">
                  <div className={cn('flex size-6 items-center justify-center rounded-full text-[10px] font-bold', i === 0 ? 'bg-[#176b5b] text-white' : 'bg-slate-100 text-slate-400')}>
                    {i + 1}
                  </div>
                  <span className="hidden text-[10px] font-semibold text-slate-500 sm:block">{x}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                Starting point
                <input
                  value={rideOrigin}
                  onChange={e => setRideOrigin(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="text-xs font-semibold">
                Destination
                <input
                  value={rideDestination}
                  onChange={e => setRideDestination(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="text-xs font-semibold">
                Departure
                <input
                  value={rideDepartureTime}
                  onChange={e => setRideDepartureTime(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="text-xs font-semibold">
                Available seats
                <input
                  type="number"
                  value={rideAvailableSeats}
                  onChange={e => setRideAvailableSeats(parseInt(e.target.value) || 2)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
            </div>
            <Button onClick={handleOfferRide} disabled={creatingRide} className="mt-4 w-full">
              {creatingRide ? 'Offering ride...' : offered ? <><Check className="size-3.5" />Ride offered</> : 'Offer ride'}
            </Button>
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-slate-500">Route Map Preview</p>
              <MapPreview origin={rideOrigin} destination={rideDestination} />
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle eyebrow="AI driver matches" title="Passengers to review" action={<Badge>{displayRequests.filter((r: any) => r.status === 'pending').length} pending</Badge>} />
            {displayRequests.map((req: any, i: number) => (
              <div key={req.id || i} className="border-b border-slate-100 py-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold">{req.userName || 'Alex Morgan'}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{req.pickupLocation || 'Hitech City Metro'} → Acme HQ</p>
                  </div>
                  <Badge tone={req.status === 'accepted' ? 'green' : req.status === 'rejected' ? 'red' : 'amber'}>
                    {req.status?.toUpperCase() || 'PENDING'}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                  <span>Route <b className="block text-slate-800">High</b></span>
                  <span>Schedule <b className="block text-slate-800">High</b></span>
                  <span>Pickup detour <b className="block text-slate-800">5 min</b></span>
                </div>
                <div className="mt-3 flex gap-2">
                  {req.status === 'accepted' ? (
                    <Button disabled className="bg-emerald-600 text-white">Accepted ✓</Button>
                  ) : req.status === 'rejected' ? (
                    <Button disabled variant="outline" className="border-red-200 text-red-600">Rejected</Button>
                  ) : (
                    <>
                      <Button onClick={() => handleAcceptRequest(req.id)}>Accept</Button>
                      <Button variant="ghost" onClick={() => handleRejectRequest(req.id)}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <SectionTitle eyebrow="Route optimization" title="AI optimized pickup sequence" />
            <div className="space-y-3">
              {['Rahul · 8:05', 'Priya · 8:12', 'Arjun · 8:18', 'Office · 8:32'].map((x, i) => (
                <div key={x} className="flex items-center gap-3 text-xs">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#e9f6f2] font-bold text-[#176b5b]">
                    {i + 1}
                  </span>
                  <span className="font-semibold">{x}</span>
                  <span className="ml-auto text-slate-400">{i === 3 ? 'Destination' : 'Pickup point'}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              Original 12.4 km · Optimized 13.1 km · <b>+0.7 km / +4 min</b>
            </div>
            <Button variant="ghost" onClick={() => go('Live Trip')}>Review optimization <ArrowRight className="size-3.5" /></Button>
          </Card>
        </div>
      </div>
    </main>
  )
}

function Earnings({ go }: { go: (s: string) => void }) {
  return (
    <main className="mx-auto w-full max-w-[1250px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Driver workspace" title="Earnings & Payouts" action={<Badge tone="green">Auto-Payout Active</Badge>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Zap} label="Expected earnings" value="₹930" meta="+15% this month" />
        <Metric icon={Check} label="Paid earnings" value="₹650" meta="Transferred" />
        <Metric icon={Clock3} label="Passenger payment due" value="₹280" meta="3 pending" />
        <Metric icon={Leaf} label="Fuel cost offset" value="₹1,420" meta="Shared expense" />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-5">
          <SectionTitle title="Recent Commute Earnings" action={<Button variant="outline" onClick={() => go('Offer a Ride')}><Plus className="size-3.5" />Offer next ride</Button>} />
          <div className="divide-y divide-slate-100">
            {[
              { id: 'IR-1024', route: 'Kondapur → Acme HQ', passengers: '2 passengers (Rahul, Priya)', date: 'Today · 8:20 AM', amount: 200, status: 'Paid' },
              { id: 'IR-1019', route: 'Jubilee Hills → Acme HQ', passengers: '3 passengers', date: 'Yesterday · 8:25 AM', amount: 270, status: 'Paid' },
              { id: 'IR-1012', route: 'Gachibowli → Acme HQ', passengers: '2 passengers', date: 'Oct 4 · 8:30 AM', amount: 180, status: 'Paid' },
              { id: 'IR-1028', route: 'Kondapur → Acme HQ', passengers: '3 passengers (Scheduled)', date: 'Tomorrow · 8:20 AM', amount: 280, status: 'Pending' },
            ].map(item => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#e9f6f2] text-[#176b5b]">
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{item.route} · <span className="text-[#176b5b]">₹{item.amount}</span></p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{item.id} · {item.date} · {item.passengers}</p>
                  </div>
                </div>
                <Badge tone={item.status === 'Paid' ? 'green' : 'amber'}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle title="Payout summary" />
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Payout method</span>
                <b>HDFC Bank ···· 4821</b>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Scheduled payout</span>
                <b>Every Friday</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform commission</span>
                <b className="text-emerald-600">0% (Corporate Benefit)</b>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#f0faf7] p-3 text-xs text-slate-600">
              Passenger cost sharing is verified post-trip and deposited directly to your bank account weekly.
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle eyebrow="AI driver insight" title="Maximize earnings" />
            <p className="text-xs leading-5 text-slate-600">
              Offering return rides at 5:30 PM has 4 compatible co-workers looking for rides from Acme HQ to Kondapur.
            </p>
            <Button variant="ghost" onClick={() => go('Offer a Ride')}>Offer return commute <ArrowRight className="size-3.5" /></Button>
          </Card>
        </div>
      </div>
    </main>
  )
}

function Rides({
  go,
  currentRide,
  setCurrentRide,
  role,
}: {
  go: (s: string) => void
  currentRide: Ride
  setCurrentRide: (r: Ride) => void
  role: Role
}) {
  const [tab, setTab] = useState('Upcoming')
  const [myRides, setMyRides] = useState<Ride[]>(rides)
  const [loading, setLoading] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const demoRole = role === 'Driver' ? 'driver' : role === 'Admin' ? 'admin' : 'employee'

  const fetchMyRides = () => {
    setLoading(true)
    fetch('/api/rides/mine', {
      headers: { 'x-demo-role': demoRole },
    })
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Ride[] = res.data.map((r: any, idx: number) => ({
            id: r.id || `IR-10${24 + idx}`,
            driver: r.driverName || 'Rahul Sharma',
            vehicle: r.vehicle || 'Toyota Innova Crysta',
            from: r.origin || 'Kondapur',
            pickup: r.pickupLocation || 'Hitech City Metro',
            to: r.destination || 'Acme HQ',
            time: r.departureTime || '8:20 AM',
            arrival: r.eta || '8:48 AM',
            match: '—',
            seats: r.seatsAvailable ?? 2,
            status: (r.status === 'confirmed' ? 'Confirmed' : r.status === 'cancelled' ? 'Cancelled' : r.status) as any,
            detour: '—',
            pricePerPassenger: r.pricePerPassenger || 100,
            totalEstimatedCost: r.totalCost || 300,
            driverExpectedEarnings: r.totalCost || 300,
            paymentStatus: 'pending',
          }))
          setMyRides(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMyRides()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async (rideId: string) => {
    setCancellingId(rideId)
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: 'DELETE',
        headers: { 'x-demo-role': demoRole },
      }).then(r => r.json())

      if (res.success) {
        setMyRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'Cancelled' as any } : r))
      }
    } catch {
      // Optimistically update UI even if network fails
      setMyRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'Cancelled' as any } : r))
    } finally {
      setCancellingId(null)
    }
  }

  const filteredRides = tab === 'Cancelled'
    ? myRides.filter(r => r.status === 'Cancelled')
    : tab === 'Completed'
    ? myRides.filter(r => r.status === 'Completed')
    : tab === 'Active'
    ? myRides.filter(r => r.status === 'Started')
    : myRides.filter(r => !['Cancelled', 'Completed', 'Started'].includes(r.status as string))

  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Ride management" title="My Rides" action={
        <Button variant="outline" onClick={fetchMyRides} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      } />
      <Card className="overflow-hidden">
        <div className="flex gap-1 overflow-auto border-b border-slate-100 p-2">
          {['Upcoming', 'Active', 'Completed', 'Cancelled'].map(x => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={cn('whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold cursor-pointer', tab === x ? 'bg-[#e9f6f2] text-[#176b5b]' : 'text-slate-500')}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="divide-y divide-slate-100 p-5">
          {loading && (
            <p className="py-6 text-center text-xs text-slate-400">Loading rides...</p>
          )}
          {!loading && filteredRides.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">No {tab.toLowerCase()} rides found.</p>
          )}
          {!loading && filteredRides.map(r => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{r.from} → {r.to}</p>
                  <Badge tone={r.status === 'Cancelled' ? 'red' : r.status === 'Requested' ? 'amber' : 'green'}>{r.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">{r.id} · {r.time} → {r.arrival} · {role === 'Driver' ? `${r.seats} seats` : r.driver}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentRide(r)
                    go('Live Trip')
                  }}
                >
                  Track
                </Button>
                {role === 'Employee' && r.status === 'Completed' && r.paymentStatus !== 'paid' && (
                  <Button
                    onClick={() => {
                      setCurrentRide(r)
                      go('Payment')
                    }}
                  >
                    Pay ₹{r.pricePerPassenger}
                  </Button>
                )}
                {r.status !== 'Cancelled' && r.status !== 'Completed' && (
                  <Button
                    variant="ghost"
                    disabled={cancellingId === r.id}
                    onClick={() => handleCancel(r.id)}
                  >
                    {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </main>
  )
}

function LiveTrip({
  currentRide,
  setCurrentRide,
  go,
  role,
}: {
  currentRide: Ride
  setCurrentRide: (r: Ride) => void
  go: (s: string) => void
  role: Role
}) {
  const steps: Status[] = ['Confirmed', 'Started', 'Completed']
  const index = currentRide.status === 'Started' ? 1 : currentRide.status === 'Completed' ? 2 : 0

  return (
    <main className="mx-auto w-full max-w-[1250px] px-5 py-7 sm:px-8">
      <SectionTitle
        eyebrow={`Live trip · ${currentRide.id}`}
        title={`${currentRide.from} → ${currentRide.to}`}
        action={<Badge tone={currentRide.status === 'Completed' ? 'green' : 'amber'}>{currentRide.status.toUpperCase()}</Badge>}
      />
      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <Card className="p-4">
          <MapPreview live />
          <div className="mt-5 flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-2 text-center">
                <div className={cn('flex size-8 items-center justify-center rounded-full text-xs font-bold', i <= index ? 'bg-[#176b5b] text-white' : 'bg-slate-100 text-slate-400')}>
                  {i <= index ? <Check className="size-4" /> : i + 1}
                </div>
                <span className="text-[10px] font-bold text-slate-500">{s}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle title="Trip information" />
            <div className="grid grid-cols-2 gap-4 text-xs">
              <span>Departure <b className="block mt-1">{currentRide.time}</b></span>
              <span>ETA <b className="block mt-1">{currentRide.arrival}</b></span>
              <span>Distance <b className="block mt-1">12.4 km</b></span>
              <span>Passengers <b className="block mt-1">3 people</b></span>
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Driver & passengers" />
            <p className="text-sm font-bold">{currentRide.driver}</p>
            <p className="mt-1 text-xs text-slate-500">{currentRide.vehicle} · {currentRide.seats} seats available</p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Rahul · {currentRide.pickup}</span>
                <Badge>Ready</Badge>
              </div>
              <div className="flex justify-between">
                <span>Priya · Checkpost</span>
                <Badge tone="slate">Confirmed</Badge>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Trip controls" />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setCurrentRide({ ...currentRide, status: 'Started' })}>Start ride</Button>
              <Button onClick={() => setCurrentRide({ ...currentRide, status: 'Completed', paymentStatus: 'due' })}>Complete ride</Button>
              <Button variant="outline">I&apos;m ready</Button>
              <Button variant="outline">Report issue</Button>
            </div>
            {currentRide.status === 'Completed' && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                {role === 'Employee' ? (
                  <Button onClick={() => go('Payment')} className="w-full">
                    {currentRide.paymentStatus === 'paid' ? 'View Payment Receipt' : `Proceed to Payment — ₹${currentRide.pricePerPassenger}`} <ArrowRight className="size-3.5" />
                  </Button>
                ) : (
                  <Button onClick={() => go('Earnings')} className="w-full">
                    View Driver Earnings — ₹{currentRide.driverExpectedEarnings} <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <SectionTitle title="Cost sharing" />
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Estimated trip · 3 passengers</p>
                <p className="mt-1 text-2xl font-bold">₹{currentRide.pricePerPassenger}/person</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{role === 'Driver' ? 'Expected earnings' : 'Your savings'}</p>
                <p className="mt-1 font-bold text-[#176b5b]">₹{role === 'Driver' ? currentRide.driverExpectedEarnings : '120'}</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-400">Estimate based on fuel and shared distance.</p>
          </Card>
        </div>
      </div>
    </main>
  )
}

function Agent({ go, role }: { go: (s: string) => void; role: Role }) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const quickActions = role === 'Driver'
    ? ['Offer a ride', 'Show my ride', 'Change commute', 'Track my ride', 'View earnings']
    : role === 'Admin'
    ? ['Commute analytics', 'Ride utilization', 'Open reports', 'Export data']
    : ['Find a ride', 'Show my ride', 'Change commute', 'Track my ride', 'Find alternatives']

  const handleQuickAction = (x: string) => {
    if (x === 'Find a ride') go('Find a Ride')
    else if (x === 'Offer a ride') go('Offer a Ride')
    else if (x === 'Track my ride') go('Live Trip')
    else if (x === 'View earnings') go('Earnings')
    else if (x === 'Commute analytics' || x === 'Ride utilization') go('Admin Overview')
    else if (x === 'Open reports' || x === 'Export data') go('Reports')
    else if (x === 'Change commute') go('My Commute')
    else go('My Rides')
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 py-7 sm:px-8">
      <SectionTitle
        eyebrow="Operational AI"
        title="AI Commute Agent"
        action={<Badge><span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" />Online</Badge>}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <Card className="flex min-h-[560px] flex-col p-5">
          <div className="flex-1 space-y-4">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 p-4 text-sm text-slate-700">
              {role === 'Driver'
                ? 'I found 2 passenger requests along your morning route to Acme HQ.'
                : 'I found 3 compatible rides based on your route and schedule.'}
              <div className="mt-3 flex gap-2">
                {role === 'Driver' ? (
                  <Button onClick={() => go('Offer a Ride')}>Review passengers</Button>
                ) : (
                  <Button onClick={() => go('Find a Ride')}>Review matches</Button>
                )}
                <Button variant="outline" onClick={() => go('My Commute')}>Change time</Button>
              </div>
            </div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-[#176b5b] p-4 text-sm text-white">
              {role === 'Driver' ? 'Optimized pickup schedule ready?' : 'My driver cancelled.'}
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 p-4 text-sm text-slate-700">
              {role === 'Driver'
                ? 'Pickup sequence optimized for minimal detour: Rahul (8:05), Priya (8:12), Arjun (8:18). Total detour is only +4 min.'
                : 'Your original ride is no longer available. I found two alternatives. I\'ll wait for your approval before changing the ride.'}
            </div>
            {sent && (
              <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-[#176b5b] p-4 text-sm text-white">
                {message}
              </div>
            )}
          </div>
          <div className="mt-5 flex gap-2">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell the agent what you need..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176b5b]"
            />
            <Button onClick={() => { if (message.trim()) { setSent(true); setMessage('') } }}>Send</Button>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Agent activity" />
          <div className="space-y-4">
            {['Understanding request', 'Checking profile & schedule', 'Finding available vehicles & matches', 'Matching routes & preferences', 'Optimizing pickup points', 'Preparing recommendation'].map((x, i) => (
              <div key={x} className="flex items-center gap-3 text-xs">
                <div className="flex size-6 items-center justify-center rounded-full bg-[#e9f6f2] text-[#176b5b]">
                  {i < 5 ? <Check className="size-3" /> : <CircleDot className="size-3" />}
                </div>
                <span className={i === 5 ? 'font-bold' : 'text-slate-500'}>{x}</span>
                {i === 5 && <span className="ml-auto text-[10px] text-[#176b5b]">Ready</span>}
              </div>
            ))}
          </div>
          <div className="mt-7">
            <SectionTitle title="Quick actions" />
            <div className="flex flex-wrap gap-2">
              {quickActions.map(x => (
                <button
                  key={x}
                  onClick={() => handleQuickAction(x)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:border-[#176b5b] hover:text-[#176b5b] cursor-pointer"
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}

function Admin({ go }: { go: (s: string) => void }) {
  return (
    <main className="mx-auto w-full max-w-[1450px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Acme Technologies · Admin" title="Commute Analytics" action={<Button variant="outline"><CalendarDays className="size-3.5" />Last 30 days</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Total employees" value="1,284" meta="+8.2%" />
        <Metric icon={Car} label="Active carpools" value="186" meta="+14%" />
        <Metric icon={Leaf} label="Potential CO₂ reduction" value="2.8 t" meta="Estimate" />
        <Metric icon={Zap} label="Shared-ride savings" value="₹84.2k" meta="This month" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-5">
          <SectionTitle title="Commute demand" action={<Badge>Live estimate</Badge>} />
          <div className="flex h-56 items-end gap-3 border-b border-l border-slate-200 px-4 pb-2 pt-5">
            {[34, 48, 42, 76, 91, 64, 38, 23, 18, 28, 52, 37].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-[#176b5b]" style={{ height: `${h}%`, opacity: .35 + i / 25 }} />
                <span className="text-[9px] text-slate-400">{i + 6}AM</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Ride utilization" />
          <div className="flex items-center gap-6">
            <div className="relative flex size-32 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#176b5b 0 74%, #dcefe8 74% 100%)' }}>
              <div className="flex size-20 items-center justify-center rounded-full bg-white text-center">
                <span className="text-xl font-bold">74%</span>
              </div>
            </div>
            <div className="space-y-3 text-xs">
              <p><span className="mr-2 inline-block size-2 rounded-full bg-[#176b5b]" />Occupied seats <b className="ml-4">312</b></p>
              <p><span className="mr-2 inline-block size-2 rounded-full bg-[#dcefe8]" />Unused capacity <b className="ml-4">109</b></p>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <SectionTitle title="Route insights" />
          <div className="space-y-4 text-xs">
            <div className="flex justify-between"><span>Gachibowli → Hitech City</span><b>82 rides</b></div>
            <div className="flex justify-between"><span>Kondapur → Acme HQ</span><b>64 rides</b></div>
            <div className="flex justify-between"><span>Jubilee Hills → Acme HQ</span><b>41 rides</b></div>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="AI admin insight" />
          <p className="text-xs leading-5 text-slate-600">12 vehicles have unused morning capacity. Increasing shared-ride participation could improve utilization.</p>
          <Button variant="ghost" onClick={() => go('Reports')}>Explore demand <ArrowRight className="size-3.5" /></Button>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Reports" />
          <p className="text-xs leading-5 text-slate-600">Export utilization, distance saved, cost, emissions, and participation reports.</p>
          <Button onClick={() => go('Reports')}>Open reports <FileText className="size-3.5" /></Button>
        </Card>
      </div>
    </main>
  )
}

function Reports() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Admin reporting" title="Reports" action={<Button variant="outline"><FileText className="size-3.5" />Export CSV</Button>} />
      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
            <option>Last 30 days</option>
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
            <option>All departments</option>
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
            <option>All locations</option>
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
            <option>All directions</option>
          </select>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={Route} label="Distance saved" value="18,420 km" meta="+21%" />
        <Metric icon={Zap} label="Cost savings" value="₹84,240" meta="Estimate" />
        <Metric icon={Leaf} label="Emissions reduction" value="2.8 t CO₂" meta="Potential" />
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <SectionTitle title="Ride utilization report" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Rides</th>
                <th className="px-5 py-3">Occupancy</th>
                <th className="px-5 py-3">Distance saved</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Kondapur → Acme HQ', '64', '82%', '1,240 km'],
                ['Gachibowli → Hitech City', '82', '76%', '2,840 km'],
                ['Jubilee Hills → Acme HQ', '41', '69%', '920 km'],
              ].map(row => (
                <tr key={row[0]} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold">{row[0]}</td>
                  <td className="px-5 py-4">{row[1]}</td>
                  <td className="px-5 py-4">{row[2]}</td>
                  <td className="px-5 py-4">{row[3]}</td>
                  <td className="px-5 py-4"><Badge>Healthy</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  )
}

function Payment({ ride, setRide, go }: { ride: Ride; setRide: (r: Ride) => void; go: (s: string) => void }) {
  const [processing, setProcessing] = useState(false)
  const isPaid = ride.paymentStatus === 'paid'

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => {
      setRide({ ...ride, paymentStatus: 'paid' })
      setProcessing(false)
    }, 400)
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Post-ride payment" title="Complete Ride Payment" />
      <Card className="p-5 sm:p-7">
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div><p className="text-xs text-slate-400">Ride ID</p><b>{ride.id}</b></div>
          <div><p className="text-xs text-slate-400">Driver</p><b>{ride.driver}</b></div>
          <div><p className="text-xs text-slate-400">Route</p><b>{ride.from} → {ride.to}</b></div>
          <div><p className="text-xs text-slate-400">Date</p><b>Today · {ride.time}</b></div>
        </div>
        <div className="my-6 rounded-2xl bg-[#f0faf7] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Ride fare</span>
            <strong className="text-2xl text-[#176b5b]">₹{ride.pricePerPassenger}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span>Payment status</span>
            <Badge tone={isPaid ? 'green' : processing ? 'slate' : 'amber'}>
              {isPaid ? 'PAID' : processing ? 'Processing...' : 'Payment Due'}
            </Badge>
          </div>
        </div>
        {isPaid ? (
          <div className="rounded-xl border border-[#cde7df] bg-[#f0faf7] p-4 text-sm text-[#176b5b]">
            <b>Payment Successful</b>
            <p className="mt-1">₹{ride.pricePerPassenger} paid via IntelliRide Commute Pass. Ride payment completed.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-slate-500">Payment is collected after the ride is completed.</p>
            <Button onClick={handlePay} className="w-full">
              {processing ? 'Processing Payment...' : `Pay ₹${ride.pricePerPassenger}`}
            </Button>
          </>
        )}
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={() => go('Live Trip')}>View Ride</Button>
          <Button variant="ghost" onClick={() => go('My Rides')}>Back to My Rides</Button>
        </div>
      </Card>
    </main>
  )
}

function Profile({ userName, userEmail }: { userName?: string; userEmail?: string }) {
  const [name, setName] = useState(userName || 'Alex Morgan')
  const [email, setEmail] = useState(userEmail || 'alex@acme.example')
  const [organization, setOrganization] = useState('Acme Technologies')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          if (res.data.name) setName(res.data.name)
          if (res.data.email) setEmail(res.data.email)
          if (res.data.organization) setOrganization(res.data.organization)
        }
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, organization }),
      }).then(r => r.json())

      if (res.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setErrorMessage(res.error || 'Failed to update profile')
      }
    } catch {
      setErrorMessage('Network error while updating profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Account" title="Profile & privacy" />
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {errorMessage}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Personal information" />
          <div className="space-y-3">
            <label className="block text-xs font-semibold">
              Full name
              <input value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176b5b]" />
            </label>
            <label className="block text-xs font-semibold">
              Work email
              <input value={email} disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
            </label>
            <label className="block text-xs font-semibold">
              Organization
              <input value={organization} onChange={e => setOrganization(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176b5b]" />
            </label>
          </div>
          <Button onClick={handleSave} disabled={saving} className="mt-4">
            {saving ? 'Saving...' : saved ? 'Profile saved' : 'Save changes'}
          </Button>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Privacy controls" />
          <div className="space-y-5">
            {[
              ['Location sharing', 'Used only for commute coordination'],
              ['Ride visibility', 'Visible to confirmed ride members'],
              ['Profile visibility', 'Show name and avatar to matches'],
            ].map(([x, y], i) => (
              <label key={x} className="flex items-start justify-between gap-4 cursor-pointer">
                <span>
                  <b className="block text-xs">{x}</b>
                  <small className="mt-1 block text-[11px] leading-4 text-slate-500">{y}</small>
                </span>
                <input type="checkbox" defaultChecked={i < 2} className="mt-1 accent-[#176b5b]" />
              </label>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-[#f0faf7] p-3 text-xs leading-5 text-slate-600">
            <ShieldCheck className="mr-2 inline size-4 text-[#176b5b]" />
            You control participation and location visibility for every ride.
          </div>
        </Card>
      </div>
    </main>
  )
}

function Notifications() {
  const [read, setRead] = useState<number[]>([])
  const items = [
    'Your ride request was accepted.',
    'Driver changed departure time to 8:25 AM.',
    'Pickup point updated.',
    'AI found an alternative ride.',
  ]

  return (
    <main className="mx-auto w-full max-w-[850px] px-5 py-7 sm:px-8">
      <SectionTitle eyebrow="Updates" title="Notifications" action={<Badge>{items.length - read.length} unread</Badge>} />
      <Card className="divide-y divide-slate-100 p-5">
        {items.map((x, i) => (
          <button
            key={x}
            onClick={() => setRead([...read, i])}
            className="flex w-full items-start gap-3 py-4 text-left first:pt-0 cursor-pointer"
          >
            <div className={cn('mt-1 flex size-8 items-center justify-center rounded-lg', read.includes(i) ? 'bg-slate-100 text-slate-400' : 'bg-[#e9f6f2] text-[#176b5b]')}>
              <Bell className="size-4" />
            </div>
            <span className="flex-1">
              <b className="block text-xs">{x}</b>
              <small className="mt-1 block text-[11px] text-slate-400">{i + 1} hour{i ? 's' : ''} ago · {i % 2 ? 'Schedule' : 'Ride'}</small>
            </span>
            {!read.includes(i) && <span className="mt-2 size-2 rounded-full bg-[#e36e4a]" />}
          </button>
        ))}
      </Card>
    </main>
  )
}

function Sidebar({
  active,
  setActive,
  open,
  setOpen,
  role,
  userName,
  userEmail,
}: {
  active: string
  setActive: (s: string) => void
  open: boolean
  setOpen: (b: boolean) => void
  role: Role
  userName: string
  userEmail: string
}) {
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'IR'

  const navItems = role === 'Admin' ? adminNav : role === 'Driver' ? driverNav : employeeNav

  return (
    <>
      <div className={cn('fixed inset-0 z-30 bg-slate-950/20 lg:hidden', !open && 'hidden')} onClick={() => setOpen(false)} />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-3">
          <Logo />
        </div>
        <div className="mt-8 flex flex-1 flex-col overflow-y-auto">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
            {role} workspace
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map(([label, Icon]) => (
              <button
                key={label as string}
                onClick={() => {
                  setActive(label as string)
                  setOpen(false)
                }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium cursor-pointer',
                  active === label ? 'bg-[#e9f6f2] font-semibold text-[#176b5b]' : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                <Icon className="size-[17px]" />
                <span className="flex-1">{label as string}</span>
                {label === 'Find a Ride' && <Badge>3</Badge>}
                {label === 'Notifications' && <Badge tone="amber">2</Badge>}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-[#cde7df] bg-[#f0faf7] p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <Sparkles className="size-4 text-[#176b5b]" />
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#176b5b]">
                <span className="size-1.5 rounded-full bg-[#3caf91]" />
                Online
              </span>
            </div>
            <p className="text-xs font-semibold">Commute Agent</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">Ready to coordinate your next ride.</p>
            <button onClick={() => setActive('AI Commute Agent')} className="mt-3 text-[11px] font-bold text-[#176b5b] cursor-pointer">
              Open assistant <ArrowRight className="inline size-3" />
            </button>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">{userName || 'Alex Morgan'}</p>
            <p className="truncate text-[10px] text-slate-400">{userEmail || 'alex@acme.example'}</p>
          </div>
          <Settings2 className="size-4 text-slate-400" />
        </div>
      </aside>
    </>
  )
}

function Topbar({
  setOpen,
  active,
  role,
  userName,
  onLogout,
}: {
  setOpen: (b: boolean) => void
  active: string
  role: Role
  userName: string
  onLogout: () => void
}) {
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'IR'

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="size-5" />
        </button>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
          <Search className="size-4 text-slate-400" />
          <input className="w-36 bg-transparent text-xs outline-none placeholder:text-slate-400" placeholder="Search anything..." />
          <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400 shadow-sm">⌘ K</kbd>
        </div>
        <span className="text-sm font-semibold sm:hidden">{active}</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone="slate">{role} demo</Badge>
        <button className="relative rounded-xl p-2 text-slate-500 cursor-pointer">
          <Bell className="size-[19px]" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#e36e4a] ring-2 ring-white" />
        </button>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 sm:flex">
          <div className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
            {initials}
          </div>
          <span className="text-xs font-semibold">{userName || 'Alex Morgan'}</span>
          <ChevronDown className="size-3.5 text-slate-400" />
        </div>
        <button
          onClick={onLogout}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          Log out
        </button>
      </div>
    </header>
  )
}

export default function IntelliRideDashboard() {
  const { user, logout } = useAuth()
  const role: Role = user?.role === 'admin' ? 'Admin' : user?.role === 'driver' ? 'Driver' : 'Employee'
  const [active, setActive] = useState(role === 'Admin' ? 'Admin Overview' : 'Overview')
  const [open, setOpen] = useState(false)
  const [currentRide, setCurrentRide] = useState<Ride>(rides[0])

  useEffect(() => {
    const allowed = role === 'Admin'
      ? adminNav.map(([label]) => label as string)
      : role === 'Driver'
      ? driverNav.map(([label]) => label as string)
      : employeeNav.map(([label]) => label as string)

    if (!allowed.includes(active) && active !== 'Payment') {
      setActive(role === 'Admin' ? 'Admin Overview' : 'Overview')
    }
  }, [role, active])

  const go = (page: string) => {
    const allowed = role === 'Admin'
      ? adminNav.map(([label]) => label as string)
      : role === 'Driver'
      ? driverNav.map(([label]) => label as string)
      : employeeNav.map(([label]) => label as string)

    if (page === 'Payment' || allowed.includes(page)) {
      setActive(page)
    } else {
      setActive(role === 'Admin' ? 'Admin Overview' : 'Overview')
    }
  }

  const content = useMemo(() => {
    if (role === 'Admin') {
      if (active === 'Reports') return <Reports />
      return <Admin go={go} />
    }

    if (active === 'Overview') return <Dashboard go={go} currentRide={currentRide} setCurrentRide={setCurrentRide} role={role} userName={user?.name || ''} />
    if (active === 'My Commute') return <Commute go={go} />
    if (active === 'Find a Ride') return <FindRide go={go} currentRide={currentRide} setCurrentRide={setCurrentRide} />
    if (active === 'Offer a Ride') return <Driver go={go} />
    if (active === 'Earnings') return <Earnings go={go} />
    if (active === 'My Rides') return <Rides go={go} currentRide={currentRide} setCurrentRide={setCurrentRide} role={role} />
    if (active === 'Live Trip') return <LiveTrip currentRide={currentRide} setCurrentRide={setCurrentRide} go={go} role={role} />
    if (active === 'Payment') return <Payment ride={currentRide} setRide={setCurrentRide} go={go} />
    if (active === 'AI Commute Agent') return <Agent go={go} role={role} />
    if (active === 'Notifications') return <Notifications />
    if (active === 'Profile') return <Profile userName={user?.name || undefined} userEmail={user?.email || undefined} />

    return <Dashboard go={go} currentRide={currentRide} setCurrentRide={setCurrentRide} role={role} userName={user?.name || ''} />
  }, [active, role, currentRide, user])

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#f7f9f8] text-slate-900">
      <Sidebar
        active={active}
        setActive={setActive}
        open={open}
        setOpen={setOpen}
        role={role}
        userName={user?.name || ''}
        userEmail={user?.email || ''}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          setOpen={setOpen}
          active={active}
          role={role}
          userName={user?.name || ''}
          onLogout={logout}
        />
        <div className="min-h-0 flex-1 overflow-auto">{content}</div>
        <div className="border-t border-slate-200 bg-white px-5 py-2.5 text-center text-[10px] text-slate-400">
          Location shared only for commute coordination · Exact location stays private unless required for an active ride.
        </div>
      </div>
    </div>
  )
}

export { MapPreview }
