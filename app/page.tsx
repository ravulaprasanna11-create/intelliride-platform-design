import IntelliRideDashboard from '@/components/intelliride-dashboard'
import { AuthGate, AuthProvider } from '@/auth/auth-context'

export default function Page() {
  return <AuthProvider><AuthGate><IntelliRideDashboard /></AuthGate></AuthProvider>
}

// Frontend-only demo surface. Backend services can replace the mock actions later.
// The dashboard component intentionally owns the demo role/navigation state.

// IntelliRide — intelligent employee commute, coordinated by AI.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _brand = 'IntelliRide'

// Keep the route server-rendered while the interactive shell hydrates on the client.

// This page is the entry point for the hackathon demo.

// No external integrations are used in this phase.

// Navigation targets are represented as frontend-ready surfaces.

// Future services can be wired behind the same UI contracts.

// End of entry point.

