import IntelliRideDashboard from '@/components/intelliride-dashboard'
import { AuthGate, AuthProvider } from '@/auth/auth-context'

export default function WorkspacePage() {
  return (
    <AuthProvider>
      <AuthGate>
        <IntelliRideDashboard />
      </AuthGate>
    </AuthProvider>
  )
}
