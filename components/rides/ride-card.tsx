'use client'

import React from 'react'
import { ArrowRight, Route, Users } from 'lucide-react'
import type { Ride } from '@/types/ride'
import { cn } from '@/lib/utils'

export function Badge({
  children,
  tone = 'green',
}: {
  children: React.ReactNode
  tone?: 'green' | 'amber' | 'slate' | 'red'
}) {
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

export function Button({
  children,
  onClick,
  variant = 'primary',
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'ghost'
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer',
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

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]', className)}>
      {children}
    </section>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: React.ReactNode
}) {
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

export function RideCard({ ride, onRequest }: { ride: Ride; onRequest: () => void }) {
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
        <Badge>{ride.match} match</Badge>
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
      <Button onClick={onRequest} className="w-full">
        {ride.status === 'Requested' ? 'Pending approval' : `Request Ride — ₹${ride.pricePerPassenger}`} <ArrowRight className="size-3.5" />
      </Button>
    </Card>
  )
}
