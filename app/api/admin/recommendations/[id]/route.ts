import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Использует cookies, помечаем маршрут как динамический
export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!adminUser || !adminEmails.includes(adminUser.email.toLowerCase())) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const recommendationId = params.id

    // Проверяем, что рекомендация существует
    const recommendationToDelete = await prisma.recommendation.findUnique({
      where: { id: recommendationId }
    })

    if (!recommendationToDelete) {
      return NextResponse.json({ error: 'Рекомендация не найдена' }, { status: 404 })
    }

    // Удаляем рекомендацию (каскадное удаление настроено в Prisma)
    await prisma.recommendation.delete({
      where: { id: recommendationId }
    })

    return NextResponse.json({ message: 'Рекомендация успешно удалена' })

  } catch (error) {
    console.error('Error deleting recommendation:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
