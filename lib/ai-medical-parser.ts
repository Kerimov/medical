/**
 * AI-POWERED МЕДИЦИНСКИЙ ПАРСЕР
 * 
 * Универсальное решение для распознавания ЛЮБЫХ медицинских анализов
 * с использованием Large Language Models (OpenAI GPT-4, Claude и др.)
 * 
 * Преимущества:
 * - Работает с любыми форматами лабораторий
 * - Не требует ручной настройки под каждую клинику
 * - Понимает контекст и медицинскую терминологию
 * - Автоматически определяет референсные значения
 */

import { MedicalData } from './ocr'

interface AIParserConfig {
  provider: 'openai' | 'anthropic' | 'local'
  apiKey?: string
  model?: string
}

/**
 * Промпт для AI-модели
 * Детальная инструкция для извлечения медицинских данных
 */
const MEDICAL_EXTRACTION_PROMPT = `Ты - эксперт по анализу медицинских документов. Твоя задача - извлечь структурированные данные из текста медицинского анализа.

ВАЖНО: Анализируй РЕАЛЬНЫЕ данные из документа, не придумывай значения!

Извлеки следующую информацию:

1. **Тип исследования** - название анализа (например: "Общий анализ крови", "Биохимический анализ", "Анализ мочи")

2. **Дата исследования** - дата взятия биоматериала или регистрации (формат: YYYY-MM-DD)

3. **Лаборатория** - название медучреждения или лаборатории

4. **Врач** - ФИО врача (если указано)

5. **Показатели** - МАКСИМАЛЬНОЕ количество медицинских показателей из документа:
   Для КАЖДОГО показателя извлеки:
   - name: полное название показателя с аббревиатурой (например: "Гемоглобин (Hb)")
   - value: числовое значение (только число, без единиц)
   - unit: единицы измерения (г/л, %, тыс/мкл и т.д.)
   - referenceMin: минимальное референсное значение (если указано)
   - referenceMax: максимальное референсное значение (если указано)
   - isNormal: true если значение в пределах нормы, false если есть отклонение

6. **Заключение** - выводы, рекомендации, комментарии врача (если есть)

ФОРМАТ ОТВЕТА - строго JSON (без markdown, без комментариев):

{
  "studyType": "название анализа",
  "studyDate": "YYYY-MM-DD",
  "laboratory": "название лаборатории",
  "doctor": "ФИО врача или null",
  "findings": "заключение врача или null",
  "indicators": [
    {
      "name": "Показатель (Аббр)",
      "value": 123.45,
      "unit": "г/л",
      "referenceMin": 120,
      "referenceMax": 160,
      "isNormal": true
    }
  ]
}

ПРАВИЛА:
- Извлекай ВСЕ показатели, которые есть в документе
- Если референсные значения не указаны, используй медицинские стандарты
- Для isNormal сравни value с referenceMin/Max
- Если данные отсутствуют, используй null
- Отвечай ТОЛЬКО JSON, без дополнительного текста
- Не придумывай данные - используй только то, что есть в тексте`

/**
 * Универсальный AI-парсер медицинских документов
 */
export async function parseWithAI(
  ocrText: string,
  config: AIParserConfig
): Promise<MedicalData> {
  console.log('[AI-PARSER] Starting AI-powered medical data extraction...')
  console.log(`[AI-PARSER] Provider: ${config.provider}, Model: ${config.model || 'default'}`)
  
  try {
    let response: string
    
    switch (config.provider) {
      case 'openai':
        response = await parseWithOpenAI(ocrText, config)
        break
      
      case 'anthropic':
        response = await parseWithClaude(ocrText, config)
        break
      
      case 'local':
        response = await parseWithLocalModel(ocrText, config)
        break
      
      default:
        throw new Error(`Unknown AI provider: ${config.provider}`)
    }
    
    // Парсим JSON-ответ
    const data = JSON.parse(response)
    
    // Валидация и нормализация данных
    const medicalData: MedicalData = {
      studyType: data.studyType || undefined,
      studyDate: data.studyDate ? new Date(data.studyDate) : undefined,
      laboratory: data.laboratory || undefined,
      doctor: data.doctor || undefined,
      findings: data.findings || undefined,
      indicators: data.indicators || []
    }
    
    console.log(`[AI-PARSER] ✅ Successfully extracted ${medicalData.indicators.length} indicators`)
    console.log(`[AI-PARSER] Study: ${medicalData.studyType}`)
    
    return medicalData
    
  } catch (error) {
    console.error('[AI-PARSER] ❌ Error:', error)
    throw error
  }
}

/**
 * Парсинг через OpenAI API (GPT-4)
 */
async function parseWithOpenAI(
  ocrText: string,
  config: AIParserConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('OpenAI API key is required')
  }
  
  const model = config.model || 'gpt-4o-mini' // Используем более дешевую модель
  
  console.log(`[AI-PARSER] Calling OpenAI API (model: ${model})...`)
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: MEDICAL_EXTRACTION_PROMPT
        },
        {
          role: 'user',
          content: `Проанализируй следующий медицинский документ:\n\n${ocrText}`
        }
      ],
      temperature: 0.1, // Низкая температура для точности
      response_format: { type: 'json_object' } // Принудительный JSON
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }
  
  const result = await response.json()
  const content = result.choices[0].message.content
  
  console.log('[AI-PARSER] OpenAI response received')
  return content
}

/**
 * Парсинг через Anthropic API (Claude)
 */
async function parseWithClaude(
  ocrText: string,
  config: AIParserConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('Anthropic API key is required')
  }
  
  const model = config.model || 'claude-3-5-sonnet-20241022'
  
  console.log(`[AI-PARSER] Calling Anthropic API (model: ${model})...`)
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      temperature: 0.1,
      system: MEDICAL_EXTRACTION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Проанализируй следующий медицинский документ:\n\n${ocrText}`
        }
      ]
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${error}`)
  }
  
  const result = await response.json()
  const content = result.content[0].text
  
  console.log('[AI-PARSER] Claude response received')
  
  // Claude может вернуть текст с ```json, нужно извлечь JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }
  
  return content
}

/**
 * Парсинг через локальную модель (Ollama, LM Studio и др.)
 */
async function parseWithLocalModel(
  ocrText: string,
  config: AIParserConfig
): Promise<string> {
  const model = config.model || 'llama3.2'
  const endpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434'
  
  console.log(`[AI-PARSER] Calling local LLM (model: ${model})...`)
  
  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      prompt: `${MEDICAL_EXTRACTION_PROMPT}\n\nДокумент:\n${ocrText}`,
      stream: false,
      format: 'json'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Local LLM error: ${response.status}`)
  }
  
  const result = await response.json()
  console.log('[AI-PARSER] Local LLM response received')
  
  return result.response
}

/**
 * Получение конфигурации из переменных окружения
 */
export function getAIConfig(): AIParserConfig | null {
  // Приоритет: OpenAI > Anthropic > Local
  
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    }
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
    }
  }
  
  if (process.env.USE_LOCAL_LLM === 'true') {
    return {
      provider: 'local',
      model: process.env.LOCAL_LLM_MODEL || 'llama3.2'
    }
  }
  
  return null
}

/**
 * Проверка доступности AI-парсера
 */
export function isAIParserAvailable(): boolean {
  return getAIConfig() !== null
}

