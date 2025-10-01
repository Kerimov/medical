import { NextResponse } from 'next/server'
import { getAIConfig } from '@/lib/ai-medical-parser'

/**
 * API для проверки доступности AI-парсера
 * Используется в UI для отображения статуса
 */
export async function GET() {
  const config = getAIConfig()
  
  if (!config) {
    return NextResponse.json({
      available: false,
      provider: 'regex',
      message: 'Используется базовый regex-парсер. Для универсального распознавания добавьте API ключ в .env.local'
    })
  }
  
  return NextResponse.json({
    available: true,
    provider: config.provider,
    model: config.model,
    message: `AI-парсер активен (${config.provider})`
  })
}

