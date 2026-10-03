import { supabase } from '@/lib/supabase/client'
import { AuthUser } from '@/types/auth'
import { UpdateProfileInput } from './validation'

export async function getProfile(user: AuthUser) {
  try {
    const { data, error } = await (supabase.from('profiles') as any)
      .select('id, name, email, phone, role, avatar_url, org_id')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !data) {
      // Return deterministic user profile if not yet in database
      return {
        id: user.id,
        name: user.name,
        email: user.email || `${user.role}@intelliride.demo`,
        phone: user.phone || null,
        role: user.role,
        organization: 'IntelliRide Enterprise',
        avatar: user.avatarUrl || null,
      }
    }

    return {
      id: data.id,
      name: data.name || user.name,
      email: data.email || user.email,
      phone: data.phone || null,
      role: data.role || user.role,
      organization: 'IntelliRide Enterprise',
      avatar: data.avatar_url || null,
    }
  } catch (err) {
    return {
      id: user.id,
      name: user.name,
      email: user.email || `${user.role}@intelliride.demo`,
      phone: user.phone || null,
      role: user.role,
      organization: 'IntelliRide Enterprise',
      avatar: user.avatarUrl || null,
    }
  }
}

export async function updateProfile(user: AuthUser, updates: UpdateProfileInput) {
  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.phone !== undefined) updateData.phone = updates.phone
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl

    const { data, error } = await (supabase.from('profiles') as any)
      .upsert({
        id: user.id,
        name: updates.name || user.name,
        email: user.email || `${user.role}@intelliride.demo`,
        role: user.role,
        ...updateData,
      })
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[Profile Service] Supabase upsert error:', error)
    }

    return {
      id: user.id,
      name: updates.name || user.name,
      email: user.email || `${user.role}@intelliride.demo`,
      phone: updates.phone ?? user.phone ?? null,
      role: user.role,
      organization: updates.organization || 'IntelliRide Enterprise',
      avatar: updates.avatarUrl ?? user.avatarUrl ?? null,
    }
  } catch (err) {
    return {
      id: user.id,
      name: updates.name || user.name,
      email: user.email || `${user.role}@intelliride.demo`,
      phone: updates.phone ?? user.phone ?? null,
      role: user.role,
      organization: updates.organization || 'IntelliRide Enterprise',
      avatar: updates.avatarUrl ?? user.avatarUrl ?? null,
    }
  }
}
