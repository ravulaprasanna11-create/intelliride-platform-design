export interface UpdateProfileInput {
  name?: string
  organization?: string
  avatarUrl?: string
  phone?: string
}

export function validateUpdateProfileInput(body: any): { valid: boolean; error?: string; data?: UpdateProfileInput } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload' }
  }

  // Prevent restricted field updates
  if ('role' in body || 'id' in body || 'admin' in body || 'user_id' in body) {
    return { valid: false, error: 'Modifying restricted fields (role, user ID, privileges) is not permitted' }
  }

  const updates: UpdateProfileInput = {}

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return { valid: false, error: 'Name cannot be empty' }
    }
    updates.name = body.name.trim()
  }

  if (body.organization !== undefined) {
    if (typeof body.organization !== 'string') {
      return { valid: false, error: 'Organization must be a string' }
    }
    updates.organization = body.organization.trim()
  }

  if (body.avatarUrl !== undefined) {
    if (typeof body.avatarUrl !== 'string') {
      return { valid: false, error: 'Avatar URL must be a string' }
    }
    updates.avatarUrl = body.avatarUrl.trim()
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string') {
      return { valid: false, error: 'Phone must be a string' }
    }
    updates.phone = body.phone.trim()
  }

  return { valid: true, data: updates }
}
