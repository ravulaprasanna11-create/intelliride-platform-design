'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Car, Home, MapPin, Navigation, AlertCircle } from 'lucide-react'
import { calculateRouteAsync, RouteResult } from '@/lib/maps/service'

export interface RouteMapProps {
  origin?: string
  destination?: string
  pickupLocation?: string
  live?: boolean
  className?: string
  height?: string
}

declare global {
  interface Window {
    google?: any
  }
}

export function RouteMap({
  origin = 'Kondapur, Hyderabad',
  destination = 'Acme HQ, Hitech City',
  pickupLocation,
  live = false,
  className = '',
  height = 'min-h-[230px]',
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [routeData, setRouteData] = useState<RouteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [googleMapLoaded, setGoogleMapLoaded] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY

  // 1. Fetch Route Details
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    const fetchRoute = async () => {
      try {
        const params = new URLSearchParams({ origin, destination })
        if (pickupLocation) params.append('pickup', pickupLocation)

        const res = await fetch(`/api/maps/route?${params.toString()}`).then(r => r.json())
        if (isMounted) {
          if (res.success && res.data) {
            setRouteData(res.data)
          } else {
            const fallback = await calculateRouteAsync(origin, destination, pickupLocation)
            setRouteData(fallback)
          }
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          const fallback = await calculateRouteAsync(origin, destination, pickupLocation)
          setRouteData(fallback)
          setLoading(false)
        }
      }
    }

    fetchRoute()

    return () => {
      isMounted = false
    }
  }, [origin, destination, pickupLocation])

  // 2. Load Google Maps JS API script if valid key provided
  useEffect(() => {
    if (!apiKey || apiKey.includes('demo_') || apiKey.includes('your_')) return
    if (window.google && window.google.maps) {
      setGoogleMapLoaded(true)
      return
    }

    const scriptId = 'google-maps-js-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`
      script.async = true
      script.defer = true
      script.onload = () => setGoogleMapLoaded(true)
      script.onerror = () => setGoogleMapLoaded(false)
      document.head.appendChild(script)
    } else {
      script.addEventListener('load', () => setGoogleMapLoaded(true))
    }
  }, [apiKey])

  // 3. Render Google Map when ready
  useEffect(() => {
    if (!googleMapLoaded || !routeData || !mapRef.current || !window.google?.maps) return

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: routeData.originCoords,
        disableDefaultUI: true,
        zoomControl: true,
      })

      const bounds = new window.google.maps.LatLngBounds()

      // Add Origin Marker
      const origMarker = new window.google.maps.Marker({
        position: routeData.originCoords,
        map,
        title: `Origin: ${routeData.origin}`,
        label: 'A',
      })
      bounds.extend(routeData.originCoords)

      // Add Destination Marker
      const destMarker = new window.google.maps.Marker({
        position: routeData.destinationCoords,
        map,
        title: `Destination: ${routeData.destination}`,
        label: 'B',
      })
      bounds.extend(routeData.destinationCoords)

      // Add Pickup Marker if available
      if (routeData.pickupCoords) {
        new window.google.maps.Marker({
          position: routeData.pickupCoords,
          map,
          title: `Pickup: ${routeData.pickupLocation}`,
          label: 'P',
        })
        bounds.extend(routeData.pickupCoords)
      }

      // Draw Polyline
      if (routeData.encodedPolyline && window.google.maps.geometry?.polyline) {
        const decodedPath = window.google.maps.geometry.polyline.decodePath(routeData.encodedPolyline)
        const polyline = new window.google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: '#176b5b',
          strokeOpacity: 0.9,
          strokeWeight: 5,
        })
        polyline.setMap(map)
      }

      map.fitBounds(bounds)
    } catch (e) {
      console.warn('[Google Maps Render Warning]:', e)
    }
  }, [googleMapLoaded, routeData])

  if (loading) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#e8f0eb] p-6 text-slate-400 ${height} ${className}`}>
        <div className="flex flex-col items-center gap-2 text-xs font-semibold text-[#176b5b]">
          <span className="size-6 animate-spin rounded-full border-2 border-[#176b5b] border-t-transparent" />
          Calculating Google route...
        </div>
      </div>
    )
  }

  if (error || !routeData) {
    return (
      <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-100 p-6 text-slate-600 ${height} ${className}`}>
        <AlertCircle className="mb-2 size-6 text-amber-600" />
        <p className="text-xs font-bold text-slate-800">Route map unavailable</p>
        <p className="mt-1 text-center text-[11px] text-slate-500">
          Route: <b>{origin}</b> → <b>{destination}</b>
        </p>
      </div>
    )
  }

  const { distanceKm, durationMinutes, svgPath, isRealGoogleRoute } = routeData

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#e8f0eb] map-grid ${height} ${className}`}>
      {googleMapLoaded ? (
        <div ref={mapRef} className="absolute inset-0 size-full" />
      ) : (
        /* SVG Map Container */
        <>
          <svg className="absolute inset-0 size-full" viewBox="0 0 600 300" preserveAspectRatio="none">
            <path
              d="M-20 80 C90 30 130 190 260 130 S430 60 620 150"
              fill="none"
              stroke="#c0d6ca"
              strokeWidth="23"
              opacity=".7"
            />
            <path
              d="M-20 80 C90 30 130 190 260 130 S430 60 620 150"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            />
            <path
              d={svgPath}
              fill="none"
              stroke="#176b5b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>

          {/* Origin Marker */}
          <div className="absolute left-[16%] top-[69%] flex items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full border-4 border-white bg-[#e36e4a] text-white shadow-md" title={`Origin: ${origin}`}>
              <Home className="size-3" fill="currentColor" />
            </span>
            <span className="max-w-[120px] truncate rounded bg-white/95 px-1.5 py-1 text-[9px] font-bold text-slate-800 shadow-sm">
              {origin.split(',')[0]}
            </span>
          </div>

          {/* Pickup Marker */}
          {pickupLocation && (
            <div className="absolute left-[50%] top-[45%] flex items-center gap-1">
              <span className="flex size-7 items-center justify-center rounded-full border-4 border-white bg-amber-500 text-white shadow-md" title={`Pickup: ${pickupLocation}`}>
                <MapPin className="size-3.5" fill="currentColor" />
              </span>
              <span className="max-w-[120px] truncate rounded bg-white/95 px-1.5 py-1 text-[9px] font-bold text-amber-800 shadow-sm">
                {pickupLocation}
              </span>
            </div>
          )}

          {/* Destination Marker */}
          <div className="absolute right-[13%] top-[10%] flex items-center gap-1">
            <span className="max-w-[120px] truncate rounded bg-white/95 px-1.5 py-1 text-[9px] font-bold text-slate-800 shadow-sm">
              {destination.split(',')[0]}
            </span>
            <span className="flex size-7 items-center justify-center rounded-full border-4 border-white bg-[#176b5b] text-white shadow-md" title={`Destination: ${destination}`}>
              <Navigation className="size-3" fill="currentColor" />
            </span>
          </div>

          {/* Live Car Marker */}
          {live && (
            <div className="absolute left-[58%] top-[39%] flex size-8 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-white shadow-md animate-pulse">
              <Car className="size-3.5" fill="currentColor" />
            </div>
          )}
        </>
      )}

      {/* Floating Route Badge */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-white/80 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#176b5b] shadow-sm">
        <span>
          {live
            ? 'Live location · 8:22 AM'
            : `${isRealGoogleRoute ? 'Google Route' : 'Route'} · ${distanceKm} km · ${durationMinutes} min`}
        </span>
      </div>
    </div>
  )
}
