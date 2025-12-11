import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Использует cookies, помечаем маршрут как динамический
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })
    }

    // Проверяем права администратора
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'test@pma.ru,admin@example.com').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Получаем все рекомендации с пользователями, компаниями и продуктами
    const recommendations = await prisma.recommendation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            currency: true
          }
        }
      }
    })

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
