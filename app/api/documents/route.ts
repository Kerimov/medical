import { NextRequest, NextResponse } from 'next/server'
import { documentsDb } from '@/lib/documents'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'

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

    // Получаем документы пользователя
    const documents = documentsDb.findByUserId(payload.userId)

    return NextResponse.json({
      documents: documents.map(doc => ({
        ...doc,
        // Не отправляем сырой текст для экономии трафика
        rawText: undefined
      }))
    })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения документов' },
      { status: 500 }
    )
  }
}

