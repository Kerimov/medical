import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token: string | undefined
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7)
    else {
      const cookieHeader = request.headers.get('cookie')
      const cookies = cookieHeader ? parseCookies(cookieHeader) : {}
      if (cookies.token) token = cookies.token
    }

    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: decoded.userId } })
    if (!doctor) return NextResponse.json({ error: 'Профиль врача не найден' }, { status: 403 })

    // Пациенты из карточек
    const records = await prisma.patientRecord.findMany({
      where: { doctorId: doctor.id },
      select: { patientId: true },
    })

    // Пациенты из приемов
    const appts = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      select: { patientId: true },
    })

    const ids = Array.from(new Set([...
      records.map(r => r.patientId), ...appts.map(a => a.patientId)
    ].filter(Boolean)))

    if (ids.length === 0) return NextResponse.json({ patients: [] })

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ patients: users })
  } catch (e) {
    console.error('Error listing doctor patients:', e)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
