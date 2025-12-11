import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET /api/marketplace/recommendations/[id] - получить детальную информацию о рекомендации
export async function GET(
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

    // Получаем рекомендацию с полной информацией
    const recommendation = await prisma.recommendation.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
            city: true,
            phone: true,
            email: true,
            website: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
            coordinates: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            category: true
          }
        },
        analysis: {
          select: {
            id: true,
            title: true,
            type: true,
            date: true
          }
        }
      }
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Рекомендация не найдена' }, { status: 404 })
    }

    // Парсим metadata если это строка
    let metadata = recommendation.metadata
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata)
      } catch {
        metadata = {}
      }
    }

    return NextResponse.json({
      recommendation: {
        ...recommendation,
        metadata
      }
    })
  } catch (error) {
    logger.error('Error fetching recommendation:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении рекомендации' },
      { status: 500 }
    )
  }
}

