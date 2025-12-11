import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createEnhancedRecommendationsForUser } from '@/lib/ai-recommendations-enhanced'
import { logger } from '@/lib/logger'

// Использует cookies/headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic'

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

    // Получаем данные о геолокации из тела запроса (если есть)
    let userLocation
    try {
      const body = await request.json()
      userLocation = body.location
    } catch {
      // Если тело запроса пустое или некорректное, продолжаем без геолокации
    }

    const recommendations = await createEnhancedRecommendationsForUser(
      decoded.userId,
      userLocation
    )

    return NextResponse.json({
      message: `Создано ${recommendations.length} новых персонализированных рекомендаций`,
      recommendations,
      count: recommendations.length
    })
  } catch (error) {
    logger.error('Error generating recommendations:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Ошибка генерации рекомендаций' }, { status: 500 })
  }
}
