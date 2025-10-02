import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { createRecommendationsForUser } from '@/lib/ai-recommendations'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Токен не найден' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    const analyses = await prisma.analysis.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error('Error fetching analyses:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении анализов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Токен не найден' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    const { title, type, date, laboratory, doctor, results, normalRange, status, notes } = await request.json()

    // Валидация
    if (!title || !type || !date || !results) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId: payload.userId,
        title,
        type,
        date: new Date(date),
        laboratory,
        doctor,
        results: JSON.stringify(results),
        normalRange,
        status: status || 'normal',
        notes
      }
    })

    // Генерируем рекомендации, если анализ имеет отклонения
    if (status === 'abnormal') {
      try {
        await createRecommendationsForUser(payload.userId)
      } catch (error) {
        console.error('Error generating recommendations:', error)
        // Не прерываем создание анализа из-за ошибки рекомендаций
      }
    }

    return NextResponse.json({
      message: 'Анализ успешно сохранен',
      analysis: {
        ...analysis,
        results: JSON.parse(analysis.results)
      }
    })
  } catch (error) {
    console.error('Error creating analysis:', error)
    return NextResponse.json(
      { error: 'Ошибка при сохранении анализа' },
      { status: 500 }
    )
  }
}
