import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { createEnhancedRecommendationsForUser } from '@/lib/ai-recommendations-enhanced'

// Использует cookies/headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic'

// GET /api/marketplace/recommendations - получить персонализированные рекомендации
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: decoded.userId
    }

    // Добавляем фильтр по статусу только если он указан
    if (status && status !== 'all') {
      where.status = status as any
    }

    if (type) {
      where.type = type
    }

    let recommendations = await prisma.recommendation.findMany({
      where,
      include: {
        company: true,
        product: true,
        analysis: {
          select: {
            id: true,
            title: true,
            type: true,
            date: true
          }
        },
        _count: {
          select: { interactions: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Если рекомендаций ещё нет, выполняем одноразовую материализацию
    if (recommendations.length === 0) {
      try {
        await createEnhancedRecommendationsForUser(decoded.userId)
        recommendations = await prisma.recommendation.findMany({
          where,
          include: {
            company: true,
            product: true,
            analysis: {
              select: { id: true, title: true, type: true, date: true }
            },
            _count: { select: { interactions: true } }
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          take: limit
        })
      } catch (e) {
        logger.error('Auto-materialization failed:', e instanceof Error ? e.message : String(e))
      }
    }

    return NextResponse.json({
      recommendations,
      total: recommendations.length
    })
  } catch (error) {
    logger.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Ошибка получения рекомендаций' }, { status: 500 })
  }
}

// POST /api/marketplace/recommendations - создать новую рекомендацию
export async function POST(request: NextRequest) {
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
    const {
      type,
      title,
      description,
      reason,
      priority = 1,
      companyId,
      productId,
      analysisId,
      metadata,
      expiresAt
    } = body

    // Валидация
    if (!type || !title) {
      return NextResponse.json({ error: 'Тип и заголовок рекомендации обязательны' }, { status: 400 })
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        userId: decoded.userId,
        type,
        title,
        description,
        reason,
        priority,
        companyId,
        productId,
        analysisId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        company: true,
        product: true,
        analysis: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json(recommendation, { status: 201 })
  } catch (error) {
    logger.error('Error creating recommendation:', error)
    return NextResponse.json({ error: 'Ошибка создания рекомендации' }, { status: 500 })
  }
}
