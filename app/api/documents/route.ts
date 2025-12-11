import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'

// Маршрут использует request.headers (cookie), поэтому его нужно пометить как динамический,
// чтобы Next.js не пытался выполнять его при статическом экспорте.
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const cookieHeader = request.headers.get('cookie')
    const cookies = cookieHeader ? parseCookies(cookieHeader) : {}
    const token = cookies.token

    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      )
    }

    const documents = await prisma.document.findMany({
      where: { userId: payload.userId },
      orderBy: { uploadDate: 'desc' }
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения документов' },
      { status: 500 }
    )
  }
}

