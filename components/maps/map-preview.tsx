'use client'

import React from 'react'
import { Car, Home, MapPin, Navigation } from 'lucide-react'

export function MapPreview({ live = false }: { live?: boolean }) {
  return (
    <div className="relative min-h-[230px] overflow-hidden rounded-2xl bg-[#e8f0eb] map-grid">
      <svg className="absolute inset-0 size-full" viewBox="0 0 600 300" preserveAspectRatio="none">
        <path d="M-20 80 C90 30 130 190 260 130 S430 60 620 150" fill="none" stroke="#c0d6ca" strokeWidth="23" opacity=".7" />
        <path d="M-20 80 C90 30 130 190 260 130 S430 60 620 150" fill="none" stroke="#fff" strokeWidth="2" />
        <path d="M105 270 C170 220 225 198 302 166 S410 95 520 42" fill="none" stroke="#176b5b" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div className="absolute left-[16%] top-[69%] flex items-center gap-1">
        <span className="flex size-7 items-center justify-center rounded-full border-4 border-white bg-[#e36e4a] text-white shadow-md">
          <Home className="size-3" fill="currentColor" />
        </span>
        <span className="rounded bg-white/90 px-1.5 py-1 text-[9px] font-bold shadow-sm">Home</span>
      </div>
      <div className="absolute left-[51%] top-[45%] flex size-6 items-center justify-center rounded-full border-4 border-white bg-[#f2b84b] text-white shadow-md">
        <MapPin className="size-3" fill="currentColor" />
      </div>
      <div className="absolute right-[13%] top-[10%] flex items-center gap-1">
        <span className="rounded bg-white/90 px-1.5 py-1 text-[9px] font-bold shadow-sm">Acme HQ</span>
        <span className="flex size-7 items-center justify-center rounded-full border-4 border-white bg-[#176b5b] text-white shadow-md">
          <Navigation className="size-3" fill="currentColor" />
        </span>
      </div>
      {live && (
        <div className="absolute left-[58%] top-[39%] flex size-8 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-white shadow-md">
          <Car className="size-3.5" fill="currentColor" />
        </div>
      )}
      <div className="absolute bottom-3 right-3 rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-[10px] font-semibold text-[#176b5b] shadow-sm">
        {live ? 'Live location · 8:22 AM' : 'Route optimized · 12.4 km'}
      </div>
    </div>
  )
}
