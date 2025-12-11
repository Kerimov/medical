import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'

export const dynamic = 'force-dynamic'

function getToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.substring(7)
  const cookieHeader = request.headers.get('cookie')
  const cookies = cookieHeader ? parseCookies(cookieHeader) : {}
  return cookies.token || null
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded?.userId) return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: decoded.userId },
      select: { id: true }
    })
    if (!doctor) return NextResponse.json({ error: 'Профиль врача не найден' }, { status: 403 })

    const records = await prisma.patientRecord.findMany({
      where: { doctorId: doctor.id },
      select: { id: true, patientId: true, patient: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })

    const recordIds = records.map((r) => r.id)
    if (recordIds.length === 0) return NextResponse.json({ prescriptions: [] })

    const pres = await prisma.prescription.findMany({
      where: { patientRecordId: { in: recordIds } },
      orderBy: { prescribedAt: 'desc' }
    })

    const patientByRecordId = new Map(records.map((r) => [r.id, r.patient]))

    const result = pres.map((p) => ({
      ...p,
      patient: patientByRecordId.get(p.patientRecordId) || null
    }))

    return NextResponse.json({ prescriptions: result })
  } catch (e) {
    console.error('Error fetching doctor prescriptions:', e)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}


