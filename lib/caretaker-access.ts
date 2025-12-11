import { prisma } from '@/lib/db'
import type { TokenPayload } from '@/lib/auth'

export type CareCapability = 'diary_read' | 'diary_write' | 'medications_read' | 'medications_write' | 'reminders_read' | 'reminders_write'

export type ResolvePatientOk = { ok: true; patientId: string }
export type ResolvePatientErr = { ok: false; status: number; error: string }
export type ResolvePatientResult = ResolvePatientOk | ResolvePatientErr

export function isResolvePatientErr(x: ResolvePatientResult): x is ResolvePatientErr {
  return x.ok === false
}

function can(permissions: any, cap: CareCapability): boolean {
  const p = permissions || {}
  if (cap === 'diary_read') return !!p?.diary?.read
  if (cap === 'diary_write') return !!p?.diary?.write
  if (cap === 'medications_read') return !!p?.medications?.read
  if (cap === 'medications_write') return !!p?.medications?.write
  if (cap === 'reminders_read') return !!p?.reminders?.read
  if (cap === 'reminders_write') return !!p?.reminders?.write
  return false
}

export async function resolvePatientId(params: {
  payload: TokenPayload
  requestedPatientId: string | null
  capability: CareCapability
}): Promise<ResolvePatientResult> {
  const userId = params.payload?.userId
  if (!userId) return { ok: false as const, status: 401, error: 'Не авторизован' }

  const requested = (params.requestedPatientId || '').trim()
  if (!requested || requested === userId) {
    return { ok: true as const, patientId: userId }
  }

  // caretaker access check
  const link = await prisma.careRelationship.findUnique({
    where: { caretakerId_patientId: { caretakerId: userId, patientId: requested } },
    select: { id: true, permissions: true }
  })

  if (!link) return { ok: false as const, status: 403, error: 'Нет доступа к данным пациента' }
  if (!can(link.permissions, params.capability)) return { ok: false as const, status: 403, error: 'Недостаточно прав (caretaker)' }

  return { ok: true as const, patientId: requested }
}


