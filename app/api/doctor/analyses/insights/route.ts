import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'
import { getAIConfig } from '@/lib/ai-medical-parser'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const patientId = url.searchParams.get('patientId') || ''
    if (!patientId) return NextResponse.json({ error: 'patientId обязателен' }, { status: 400 })

    // auth
    const authHeader = request.headers.get('authorization')
    let token: string | undefined
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7)
    else {
      const cookieHeader = request.headers.get('cookie')
      const cookies = cookieHeader ? parseCookies(cookieHeader) : {}
      if (cookies.token) token = cookies.token
    }
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: decoded.userId } })
    if (!doctor) return NextResponse.json({ error: 'Профиль врача не найден' }, { status: 403 })

    const [hasRecord, hasAppointment] = await Promise.all([
      prisma.patientRecord.findFirst({ where: { doctorId: doctor.id, patientId }, select: { id: true } }),
      prisma.appointment.findFirst({ where: { doctorId: doctor.id, patientId }, select: { id: true } }),
    ])
    if (!hasRecord && !hasAppointment) return NextResponse.json({ error: 'Нет доступа к пациенту' }, { status: 403 })

    // collect last 12 months analyses
    const analyses = await prisma.analysis.findMany({
      where: { userId: patientId, parsed: true },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, title: true, indicators: true }
    })

    const summaryInput = analyses.slice(-40).map(a => {
      const date = (a.date as unknown as Date).toISOString().slice(0,10)
      const indicators = Array.isArray(a.indicators) ? a.indicators as any[] : []
      const lines = indicators
        .filter(i => typeof i?.value !== 'undefined')
        .map(i => `${i.name}: ${i.value}${i.unit ? ' ' + i.unit : ''} [${i.referenceMin ?? ''}-${i.referenceMax ?? ''}] ${i.isNormal === false ? '(abn)' : ''}`)
        .join('; ')
      return `${date} — ${a.title || 'Анализ'}: ${lines}`
    }).join('\n')

    const ai = getAIConfig()
    let insights = ''
    if (ai?.provider === 'openai' && ai.apiKey) {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ai.apiKey}` },
          body: JSON.stringify({
            model: ai.model || 'gpt-4o-mini-2024-07-18',
            temperature: 0,
            messages: [
              { role: 'system', content: 'Ты медицинский ассистент. Суммаризируй динамику показателей анализов. Коротко, по-русски. Выдели ухудшения/улучшения, перечисли риски и рекомендации. Структура: Итог, Улучшения, Ухудшения, Риски, Рекомендации.' },
              { role: 'user', content: `Данные анализов по датам:\n${summaryInput}` }
            ]
          })
        })
        const json = await resp.json().catch(() => ({} as any))
        insights = json?.choices?.[0]?.message?.content || ''
      } catch (e) {
        insights = ''
      }
    }

    if (!insights) {
      // simple fallback: count abnormal per indicator
      const counts: Record<string, { abn: number; total: number }> = {}
      for (const a of analyses) {
        const inds = Array.isArray(a.indicators) ? a.indicators as any[] : []
        for (const i of inds) {
          const key = i?.name || 'Показатель'
          if (!counts[key]) counts[key] = { abn: 0, total: 0 }
          counts[key].total++
          if (i?.isNormal === false) counts[key].abn++
        }
      }
      const worst = Object.entries(counts).filter(([, v]) => v.total > 0).sort((a, b) => (b[1].abn / b[1].total) - (a[1].abn / a[1].total)).slice(0, 5)
      insights = worst.length
        ? `Наибольшее число отклонений: ${worst.map(([k, v]) => `${k} (${v.abn}/${v.total})`).join(', ')}.`
        : 'Существенных отклонений по динамике не выявлено.'
    }

    return NextResponse.json({ insights })
  } catch (e) {
    console.error('Insights API error:', e)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}


