import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// Использует headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic'

// GET /api/reminders - получить все напоминания пользователя
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: decoded.userId },
      include: {
        analysis: true,
        document: true,
        deliveries: true
      },
      orderBy: { dueAt: 'asc' }
    })

    return NextResponse.json(reminders)
  } catch (error) {
    logger.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Ошибка получения напоминаний' }, { status: 500 })
  }
}

// POST /api/reminders - создать новое напоминание
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      dueAt,
      recurrence = 'NONE',
      channels = ['EMAIL'],
      analysisId,
      documentId
    } = body

    // Валидация
    if (!title || !dueAt) {
      return NextResponse.json({ error: 'Заголовок и дата обязательны' }, { status: 400 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: decoded.userId,
        title,
        description,
        dueAt: new Date(dueAt),
        recurrence,
        channels,
        analysisId,
        documentId
      }
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    logger.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Ошибка создания напоминания' }, { status: 500 })
  }
}
