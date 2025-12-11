import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// Использует cookies/headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic'

// POST /api/marketplace/recommendations/[id]/interact - зафиксировать взаимодействие с рекомендацией
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Получаем токен из cookies
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    const body = await request.json()
    const { action, metadata } = body

    // Валидация
    if (!action) {
      return NextResponse.json({ error: 'Действие обязательно' }, { status: 400 })
    }

    const validActions = ['view', 'click', 'purchase', 'dismiss']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Недопустимое действие' }, { status: 400 })
    }

    // Проверяем, что рекомендация принадлежит пользователю
    const recommendation = await prisma.recommendation.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId
      }
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Рекомендация не найдена' }, { status: 404 })
    }

    // Создаем запись о взаимодействии
    const interaction = await prisma.recommendationInteraction.create({
      data: {
        recommendationId: params.id,
        action,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    })

    // Обновляем статус рекомендации в зависимости от действия
    let newStatus = recommendation.status
    if (action === 'view' && recommendation.status === 'ACTIVE') {
      newStatus = 'VIEWED'
    } else if (action === 'click' && ['ACTIVE', 'VIEWED'].includes(recommendation.status)) {
      newStatus = 'CLICKED'
    } else if (action === 'purchase') {
      newStatus = 'PURCHASED'
    } else if (action === 'dismiss') {
      newStatus = 'DISMISSED'
    }

    if (newStatus !== recommendation.status) {
      await prisma.recommendation.update({
        where: { id: params.id },
        data: { status: newStatus as any }
      })
    }

    return NextResponse.json({
      interaction,
      newStatus
    })
  } catch (error) {
    logger.error('Error recording recommendation interaction:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Ошибка записи взаимодействия' }, { status: 500 })
  }
}
