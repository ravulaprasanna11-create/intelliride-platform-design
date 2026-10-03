import { AuthUser, UserRole } from '@/types/auth'

export const DEMO_USERS: Record<UserRole, AuthUser> = {
  employee: {
    id: 'emp-001',
    name: 'Alex Morgan',
    email: 'employee@intelliride.demo',
    phone: '+91 98765 43210',
    role: 'employee',
    avatarUrl: null,
  },
  driver: {
    id: 'drv-001',
    name: 'Rahul Sharma',
    email: 'driver@intelliride.demo',
    phone: '+91 98765 43211',
    role: 'driver',
    avatarUrl: null,
  },
  admin: {
    id: 'adm-001',
    name: 'Admin User',
    email: 'admin@intelliride.demo',
    phone: '+91 98765 43212',
    role: 'admin',
    avatarUrl: null,
  },
}

export function resolveDemoUser(req?: Request): AuthUser {
  if (!req) return DEMO_USERS.employee

  const roleHeader = req.headers.get('x-demo-role') as UserRole | null
  const userIdHeader = req.headers.get('x-demo-user-id')

  if (roleHeader && DEMO_USERS[roleHeader]) {
    const user = { ...DEMO_USERS[roleHeader] }
    if (userIdHeader) user.id = userIdHeader
    return user
  }

  // Parse URL query parameter fallback
  try {
    const url = new URL(req.url)
    const roleParam = url.searchParams.get('role') as UserRole | null
    if (roleParam && DEMO_USERS[roleParam]) {
      return DEMO_USERS[roleParam]
    }
  } catch {
    // Ignore URL parse error
  }

  return DEMO_USERS.employee
}
