import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createRecommendationsForUser } from '@/lib/ai-recommendations'
import { logger } from '@/lib/logger'

// POST /api/marketplace/recommendations/generate - сгенерировать новые рекомендации
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

    const recommendations = await createRecommendationsForUser(decoded.userId)

    return NextResponse.json({
      message: `Создано ${recommendations.length} новых рекомендаций`,
      recommendations
    })
  } catch (error) {
    logger.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Ошибка генерации рекомендаций' }, { status: 500 })
  }
}
