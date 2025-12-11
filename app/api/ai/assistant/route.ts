import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'

// Использует headers/cookies, помечаем маршрут как динамический
export const dynamic = 'force-dynamic'

function getOpenAIApiKey() {
  return process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
}

function getOpenAIModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini'
}

async function callOpenAIChat(params: {
  system: string
  user: string
  temperature?: number
  responseFormat?: { type: 'json_object' }
}) {
  const apiKey = getOpenAIApiKey()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing')
  }

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.user }
      ],
      temperature: params.temperature ?? 0.3,
      ...(params.responseFormat ? { response_format: params.responseFormat } : {})
    })
  })

  if (!resp.ok) {
    const err = await resp.text().catch(() => '')
    throw new Error(`OpenAI API error: ${resp.status} - ${err}`)
  }

  const json = await resp.json()
  const text = json?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('OpenAI returned empty response')
  }
  return text
}

// Определяем функции, которые может выполнять AI ассистент
const availableFunctions = {
  // Запись на прием
  book_appointment: {
    description: 'Записать пациента на прием к врачу',
    parameters: {
      type: 'object',
      properties: {
        doctorId: { type: 'string', description: 'ID врача' },
        appointmentType: { type: 'string', enum: ['consultation', 'follow_up', 'routine', 'emergency'], description: 'Тип приема' },
        date: { type: 'string', format: 'date', description: 'Дата приема в формате YYYY-MM-DD' },
        time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description: 'Время приема в формате HH:MM' },
        notes: { type: 'string', description: 'Дополнительные заметки' }
      },
      required: ['doctorId', 'appointmentType', 'date', 'time']
    }
  },
  
  // Получение результатов анализов
  get_analysis_results: {
    description: 'Получить результаты анализов пациента',
    parameters: {
      type: 'object',
      properties: {
        analysisId: { type: 'string', description: 'ID конкретного анализа (опционально)' },
        category: { type: 'string', description: 'Категория анализов (опционально)' },
        limit: { type: 'number', description: 'Количество последних анализов (по умолчанию 5)' }
      }
    }
  },
  
  // Получение рекомендаций
  get_recommendations: {
    description: 'Получить персональные рекомендации для пациента',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Категория рекомендаций (опционально)' },
        limit: { type: 'number', description: 'Количество рекомендаций (по умолчанию 3)' }
      }
    }
  },
  
  // Получение списка врачей
  get_doctors: {
    description: 'Получить список доступных врачей',
    parameters: {
      type: 'object',
      properties: {
        specialization: { type: 'string', description: 'Специализация врача (опционально)' },
        available: { type: 'boolean', description: 'Только доступные для записи врачи' }
      }
    }
  },
  
  // Получение записей пациента
  get_appointments: {
    description: 'Получить записи пациента на приемы',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], description: 'Статус записи (опционально)' },
        upcoming: { type: 'boolean', description: 'Только предстоящие записи' }
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[AI-ASSISTANT] Starting request processing')
    console.log('[AI-ASSISTANT] OpenAI key present:', !!getOpenAIApiKey())
    console.log('[AI-ASSISTANT] Prisma client status:', { 
      isPrismaAvailable: !!prisma,
      hasDoctorProfileModel: !!prisma?.doctorProfile,
      prismaType: typeof prisma 
    })
    
    const { message, history, documentIds, ragScope } = await request.json()
    console.log('[AI-ASSISTANT] Request data:', { 
      message: message?.substring(0, 100), 
      hasHistory: !!history,
      documentIdsCount: Array.isArray(documentIds) ? documentIds.length : 0,
      ragScope: typeof ragScope === 'string' ? ragScope : 'default'
    })

    if (!message || typeof message !== 'string') {
      console.log('[AI-ASSISTANT] Invalid message format')
      return NextResponse.json(
        { error: 'Сообщение обязательно' },
        { status: 400 }
      )
    }

    // Проверка авторизации
    const cookieHeader = request.headers.get('cookie')
    const cookies = cookieHeader ? parseCookies(cookieHeader) : {}
    const token = cookies.token
    console.log('[AI-ASSISTANT] Token check:', { hasToken: !!token })

    if (!token) {
      console.log('[AI-ASSISTANT] No token found')
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    let payload
    try {
      payload = verifyToken(token)
      console.log('[AI-ASSISTANT] Token verified:', { hasPayload: !!payload, userId: payload?.userId })
    } catch (tokenError) {
      console.error('[AI-ASSISTANT] Token verification failed:', tokenError)
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      )
    }

    if (!payload?.userId) {
      console.log('[AI-ASSISTANT] Invalid payload')
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      )
    }

    const userId = payload.userId

    const normalizedDocumentIds: string[] =
      Array.isArray(documentIds) ? documentIds.filter((x) => typeof x === 'string' && x.trim().length > 0) : []

    const effectiveRagScope: 'none' | 'attached' | 'all' =
      ragScope === 'all' || ragScope === 'attached' || ragScope === 'none'
        ? ragScope
        : normalizedDocumentIds.length > 0
          ? 'attached'
          : 'none'

    // RAG режим: либо по прикрепленным документам, либо "по всем данным пользователя".
    // В RAG режиме не запускаем авто-функции (иначе вопросы уйдут в get_analysis_results и потеряем цитирование).
    if (effectiveRagScope !== 'none') {
      console.log('[AI-ASSISTANT] Using RAG mode:', effectiveRagScope)

      // Если запрос похож на "сделай план действий" — генерируем план и создаём напоминания.
      if (effectiveRagScope === 'attached' && normalizedDocumentIds.length > 0 && isCarePlanIntent(message)) {
        const planResult = await createCarePlanFromDocuments(userId, message, normalizedDocumentIds)
        return NextResponse.json({
          response: planResult.message,
          functionResult: planResult.data,
          functionName: 'create_care_plan',
          sources: planResult.sources,
          timestamp: new Date().toISOString()
        })
      }

      const aiResponse = await generateAIResponse(message, userId, history, normalizedDocumentIds, effectiveRagScope)
      return NextResponse.json({
        response: aiResponse.response,
        sources: aiResponse.sources,
        timestamp: new Date().toISOString()
      })
    }

    // Анализируем сообщение и определяем, какую функцию вызвать
    console.log('[AI-ASSISTANT] Analyzing message for functions')
    const functionCall = await analyzeMessageAndDetermineFunction(message, userId)
    console.log('[AI-ASSISTANT] Function call result:', functionCall)

    if (functionCall) {
      // Выполняем функцию
      console.log('[AI-ASSISTANT] Executing function:', functionCall.name)
      const result = await executeFunction(functionCall, userId)
      console.log('[AI-ASSISTANT] Function result:', { success: !!result.message })

      return NextResponse.json({
        response: result.message,
        functionResult: result.data,
        functionName: functionCall.name,
        timestamp: new Date().toISOString()
      })
    }

    // Обычный AI ответ без функций
    console.log('[AI-ASSISTANT] Generating regular AI response')
    const aiResponse = await generateAIResponse(message, userId, history, [], 'none')
    console.log('[AI-ASSISTANT] AI response generated')

    return NextResponse.json({
      response: aiResponse.response,
      sources: aiResponse.sources,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[AI-ASSISTANT] Detailed error:', error)
    console.error('[AI-ASSISTANT] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: `Ошибка обработки сообщения: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

function isCarePlanIntent(message: string) {
  const t = (message || '').toLowerCase()
  return (
    /план|пошагов|что делать дальше|следующие шаги|напоминан|reminder|задач/i.test(t) &&
    !/не делай|не создавай|без напоминаний/i.test(t)
  )
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {}
  // попытка вытащить JSON из ```json ... ```
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence?.[1]) {
    try {
      return JSON.parse(fence[1])
    } catch {}
  }
  // попытка вытащить первый объект/массив
  const brace = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (brace?.[1]) {
    try {
      return JSON.parse(brace[1])
    } catch {}
  }
  return null
}

function normalizeRecurrence(value: string) {
  const v = (value || '').toUpperCase()
  if (v === 'DAILY' || v === 'WEEKLY' || v === 'MONTHLY' || v === 'YEARLY' || v === 'NONE') return v
  return 'NONE'
}

function normalizeChannels(channels: any): string[] {
  const allowed = new Set(['EMAIL', 'PUSH', 'SMS'])
  if (!Array.isArray(channels)) return ['PUSH']
  const out = channels.map((c) => String(c).toUpperCase()).filter((c) => allowed.has(c))
  return out.length > 0 ? out : ['PUSH']
}

async function createCarePlanFromDocuments(userId: string, message: string, documentIds: string[]) {
  const rag = await buildRagContext(userId, message, documentIds)

  const openaiKey = getOpenAIApiKey()
  if (!openaiKey) {
    return {
      message:
        'Чтобы сформировать план действий и создать напоминания, нужен ключ OpenAI.\n\nДобавьте в `.env.local`:\n- OPENAI_API_KEY=...\n(опционально) OPENAI_MODEL=gpt-4o-mini\n\nИ перезапустите `npm run dev`.',
      data: null,
      sources: rag.sources
    }
  }

  const systemPrompt = `Ты — медицинский ассистент.
Сформируй план действий по прикрепленным медицинским документам.

ВАЖНО:
- Не ставь диагнозы.
- Если данных недостаточно — укажи, какие данные нужны.
- План должен быть практичным: что сделать, когда, к кому обратиться.

ОТВЕЧАЙ СТРОГО В JSON (без текста вокруг):
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "dueInDays": 0,
      "recurrence": "NONE|DAILY|WEEKLY|MONTHLY|YEARLY",
      "channels": ["PUSH","EMAIL","SMS"]
    }
  ]
}

Ограничения:
- tasks: 3..7
- dueInDays: 0..90
- channels: минимум 1`

  const userBlock = `ДАННЫЕ ИЗ ДОКУМЕНТОВ:\n${rag.contextText}\n\nЗапрос пользователя: ${message}`

  let text: string
  try {
    text = await callOpenAIChat({
      system: systemPrompt,
      user: userBlock,
      temperature: 0.2,
      responseFormat: { type: 'json_object' }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      message:
        msg.includes('unsupported_country_region_territory')
          ? 'OpenAI недоступен для текущего региона/окружения (ошибка unsupported_country_region_territory). Нужен доступный регион/прокси/другой провайдер.'
          : 'Не удалось получить ответ от OpenAI для плана действий. Попробуйте позже.',
      data: { error: msg },
      sources: rag.sources
    }
  }

  const parsed = safeJsonParse(text)
  const tasks = Array.isArray(parsed?.tasks) ? parsed.tasks : []
  if (tasks.length === 0) {
    return {
      message: 'AI не смог сформировать структурированный план. Попробуйте уточнить запрос (например: "сделай план на 2 недели").',
      data: { raw: text },
      sources: rag.sources
    }
  }

  const now = Date.now()
  const created: any[] = []
  const docIdForLink = documentIds[0] || null

  for (const t of tasks.slice(0, 7)) {
    const title = String(t.title || '').trim()
    if (!title) continue
    const description = String(t.description || '').trim() || null
    const dueInDaysNum = Math.max(0, Math.min(90, Number(t.dueInDays ?? 0) || 0))
    const dueAt = new Date(now + dueInDaysNum * 24 * 60 * 60 * 1000)
    const recurrence = normalizeRecurrence(t.recurrence)
    const channels = normalizeChannels(t.channels)

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        title,
        description,
        dueAt,
        recurrence,
        channels,
        documentId: docIdForLink
      }
    })
    created.push(reminder)
  }

  const summary =
    created.length > 0
      ? `Сформировал план и создал ${created.length} напоминаний. Откройте раздел “Напоминания”, чтобы управлять ими.`
      : 'План сформирован, но напоминания создать не удалось (проверьте данные и попробуйте снова).'

  return {
    message: summary,
    data: { reminders: created, raw: parsed },
    sources: rag.sources
  }
}

// Анализ сообщения и определение нужной функции
async function analyzeMessageAndDetermineFunction(message: string, userId: string) {
  const lowerMessage = message.toLowerCase()
  
  // Запись на прием - сначала показываем список врачей
  if (lowerMessage.match(/записать|записаться|запись.*прием|прием.*врач|когда.*врач/) && 
      !lowerMessage.match(/\d{1,2}:\d{2}/) && // Нет времени
      !lowerMessage.match(/\d{1,2}[.\-/]\d{1,2}/)) { // Нет даты
    // Если нет конкретной даты/времени, показываем список врачей
    return {
      name: 'get_doctors',
      parameters: await extractDoctorParameters(message)
    }
  }
  
  // Запись на прием с конкретными параметрами
  if (lowerMessage.match(/записать|записаться|запись.*прием/) && 
      (lowerMessage.match(/\d{1,2}:\d{2}/) || lowerMessage.match(/\d{1,2}[.\-/]\d{1,2}/))) {
    return {
      name: 'book_appointment',
      parameters: await extractAppointmentParameters(message, userId)
    }
  }
  
  // Результаты анализов
  if (lowerMessage.match(/анализ|результат|показатель|лабораторн|кровь|моча|биохимия/)) {
    return {
      name: 'get_analysis_results',
      parameters: await extractAnalysisParameters(message)
    }
  }
  
  // Рекомендации
  if (lowerMessage.match(/рекомендац|совет|что.*делать|как.*лечить|диета|упражнен/)) {
    return {
      name: 'get_recommendations',
      parameters: await extractRecommendationParameters(message)
    }
  }
  
  // Список врачей
  if (lowerMessage.match(/врач|доктор|специалист|кто.*лечит|какой.*врач/)) {
    return {
      name: 'get_doctors',
      parameters: await extractDoctorParameters(message)
    }
  }
  
  // Записи на приемы
  if (lowerMessage.match(/мои.*записи|прием|расписание|когда.*прием/)) {
    return {
      name: 'get_appointments',
      parameters: await extractAppointmentQueryParameters(message)
    }
  }
  
  return null
}

// Извлечение параметров для записи на прием
async function extractAppointmentParameters(message: string, userId: string) {
  const params: any = {}
  
  // Попытка извлечь дату
  const dateMatch = message.match(/(\d{1,2})[.\-/](\d{1,2})(?:[.\-/](\d{2,4}))?|(завтра|послезавтра|сегодня)/)
  if (dateMatch) {
    if (dateMatch[4]) {
      // Относительная дата (завтра, послезавтра, сегодня)
      const today = new Date()
      if (dateMatch[4] === 'завтра') {
        today.setDate(today.getDate() + 1)
      } else if (dateMatch[4] === 'послезавтра') {
        today.setDate(today.getDate() + 2)
      }
      params.date = today.toISOString().split('T')[0]
    } else if (dateMatch[1] && dateMatch[2]) {
      // Конкретная дата (дд.мм или дд.мм.гггг)
      const day = dateMatch[1].padStart(2, '0')
      const month = dateMatch[2].padStart(2, '0')
      const year = dateMatch[3] || new Date().getFullYear().toString()
      params.date = `${year.length === 2 ? '20' + year : year}-${month}-${day}`
    }
  } else {
    params.date = new Date().toISOString().split('T')[0]
  }
  
  // Попытка извлечь время
  const timeMatch = message.match(/(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    params.time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
  } else {
    params.time = '10:00' // По умолчанию
  }
  
  // Тип приема
  if (message.match(/консультац/i)) {
    params.appointmentType = 'consultation'
  } else if (message.match(/повторн|контрольн/i)) {
    params.appointmentType = 'follow_up'
  } else if (message.match(/планов|профилактич/i)) {
    params.appointmentType = 'routine'
  } else if (message.match(/срочн|экстрен/i)) {
    params.appointmentType = 'emergency'
  } else {
    params.appointmentType = 'consultation'
  }
  
  // Попытка извлечь ФИО врача из сообщения
  try {
    // Ищем паттерны типа "к [ФИО]" или "врачу [ФИО]"
    const doctorNameMatch = message.match(/(?:к|врачу)\s+([А-ЯЁа-яё]+(?:\s+[А-ЯЁа-яё]+){1,3})/i)
    
    if (doctorNameMatch) {
      const doctorName = doctorNameMatch[1].trim()
      console.log('[AI-ASSISTANT] Searching for doctor by name:', doctorName)
      
      // Ищем врача по имени (частичное совпадение)
      const doctors = await prisma.doctorProfile.findMany({
        include: { user: true },
        take: 10
      })
      
      const foundDoctor = doctors.find(d => 
        d.user.name.toLowerCase().includes(doctorName.toLowerCase()) ||
        doctorName.toLowerCase().includes(d.user.name.toLowerCase())
      )
      
      if (foundDoctor) {
        params.doctorId = foundDoctor.id
        console.log('[AI-ASSISTANT] Doctor found by name:', foundDoctor.user.name)
      } else {
        console.log('[AI-ASSISTANT] Doctor not found by name, using first available')
        // Если не нашли по имени, берем первого доступного
        if (doctors.length > 0) {
          params.doctorId = doctors[0].id
        }
      }
    } else {
      // Если ФИО не указано, берем первого доступного врача
      const doctors = await prisma.doctorProfile.findMany({
        include: { user: true },
        take: 1
      })
      
      if (doctors.length > 0) {
        params.doctorId = doctors[0].id
      }
    }
  } catch (dbError) {
    console.error('[AI-ASSISTANT] Database error in extractAppointmentParameters:', dbError)
    // Продолжаем без doctorId, функция bookAppointment обработает это
  }
  
  return params
}

// Извлечение параметров для анализов
async function extractAnalysisParameters(message: string) {
  const params: any = {}
  
  if (message.match(/кровь|общий.*анализ/i)) {
    params.category = 'blood'
  } else if (message.match(/моча/i)) {
    params.category = 'urine'
  } else if (message.match(/биохимия/i)) {
    params.category = 'biochemistry'
  }
  
  const limitMatch = message.match(/последн(ие|их)?\s*(\d+)/)
  if (limitMatch) {
    params.limit = parseInt(limitMatch[2])
  } else {
    params.limit = 5
  }
  
  return params
}

// Извлечение параметров для рекомендаций
async function extractRecommendationParameters(message: string) {
  const params: any = {}
  
  if (message.match(/питан|диет/i)) {
    params.category = 'nutrition'
  } else if (message.match(/физическ|спорт|упражнен/i)) {
    params.category = 'exercise'
  } else if (message.match(/лекарств|препарат/i)) {
    params.category = 'medication'
  }
  
  const limitMatch = message.match(/(\d+).*рекомендац/)
  if (limitMatch) {
    params.limit = parseInt(limitMatch[1])
  } else {
    params.limit = 3
  }
  
  return params
}

// Извлечение параметров для врачей
async function extractDoctorParameters(message: string) {
  const params: any = {}
  
  if (message.match(/терапевт|семейн/i)) {
    params.specialization = 'Терапевт'
  } else if (message.match(/кардиолог|сердц/i)) {
    params.specialization = 'Кардиолог'
  } else if (message.match(/невролог|головн/i)) {
    params.specialization = 'Невролог'
  } else if (message.match(/эндокринолог|диабет/i)) {
    params.specialization = 'Эндокринолог'
  }
  
  if (message.match(/доступн|свободн/i)) {
    params.available = true
  }
  
  return params
}

// Извлечение параметров для запросов записей
async function extractAppointmentQueryParameters(message: string) {
  const params: any = {}
  
  if (message.match(/предстоящ|ближайш|будущ/i)) {
    params.upcoming = true
  } else if (message.match(/отменен/i)) {
    params.status = 'cancelled'
  } else if (message.match(/завершен|прошедш/i)) {
    params.status = 'completed'
  }
  
  return params
}

// Выполнение функций
async function executeFunction(functionCall: any, userId: string) {
  try {
    switch (functionCall.name) {
      case 'book_appointment':
        return await bookAppointment(functionCall.parameters, userId)
      
      case 'get_analysis_results':
        return await getAnalysisResults(functionCall.parameters, userId)
      
      case 'get_recommendations':
        return await getRecommendations(functionCall.parameters, userId)
      
      case 'get_doctors':
        return await getDoctors(functionCall.parameters)
      
      case 'get_appointments':
        return await getAppointments(functionCall.parameters, userId)
      
      default:
        return {
          message: 'Извините, я не понимаю, что вы хотите сделать.',
          data: null
        }
    }
  } catch (error) {
    console.error(`Error executing function ${functionCall.name}:`, error)
    return {
      message: 'Произошла ошибка при выполнении запроса. Попробуйте еще раз.',
      data: null
    }
  }
}

// Функция записи на прием
async function bookAppointment(params: any, userId: string) {
  try {
    console.log('[AI-ASSISTANT] bookAppointment called with params:', params)
    console.log('[AI-ASSISTANT] Prisma availability check:', { 
      hasPrisma: !!prisma,
      hasDoctorProfileModel: !!prisma?.doctorProfile,
      doctorProfileModelType: typeof prisma?.doctorProfile
    })
    
    if (!prisma || !prisma.doctorProfile) {
      throw new Error('Prisma client not initialized properly')
    }
    
    const { doctorId, appointmentType, date, time, notes } = params
    
    // Проверяем, что врач существует
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: true }
    })
    console.log('[AI-ASSISTANT] Doctor found:', !!doctor)
    
    if (!doctorId) {
      return {
        message: '⚠️ В системе пока нет зарегистрированных врачей.\n\n💡 Чтобы записаться на прием:\n1. Администратор должен создать учетную запись врача через Prisma Studio (http://localhost:5555)\n2. Или позвоните в регистратуру для записи\n\n📞 Телефон регистратуры: +7 (999) 123-45-67\n\n🔧 Для администратора:\n• Откройте http://localhost:5555\n• Создайте пользователя с ролью DOCTOR\n• Создайте запись в таблице DoctorProfile с userId этого пользователя',
        data: null
      }
    }

    if (!doctor) {
      return {
        message: '⚠️ Указанный врач не найден в системе.\n\nПопробуйте:\n• "Покажи список врачей"\n• "Найди терапевта"\n• Или позвоните в регистратуру для записи',
        data: null
      }
    }
    
    // Получаем информацию о пациенте
    const patient = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!patient) {
      return {
        message: '⚠️ Не удалось найти информацию о пациенте.',
        data: null
      }
    }
    
    // Создаем запись на прием
    const scheduledAt = new Date(`${date}T${time}:00`)
    
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: userId,
        patientName: patient.name,
        patientEmail: patient.email,
        appointmentType,
        scheduledAt,
        duration: 30,
        status: 'scheduled',
        notes
      },
      include: {
        doctor: {
          include: { user: true }
        }
      }
    })
    
    return {
      message: `✅ Запись на прием успешно создана!\n\n📅 Дата: ${scheduledAt.toLocaleDateString('ru-RU')}\n🕐 Время: ${scheduledAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n👨‍⚕️ Врач: ${doctor.user.name}\n📋 Тип: ${getAppointmentTypeLabel(appointmentType)}`,
      data: appointment
    }
  } catch (error) {
    console.error('[AI-ASSISTANT] Error in bookAppointment:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('Unique constraint')) {
      return {
        message: '⚠️ Выбранное время уже занято.\n\nПопробуйте:\n• Выбрать другое время\n• "Покажи свободные слоты на завтра"\n• Позвонить в регистратуру для уточнения расписания',
        data: null
      }
    }
    
    return {
      message: `⚠️ Не удалось создать запись на прием.\n\n🔍 Причина: ${errorMessage}\n\n💡 Попробуйте:\n• Указать конкретную дату и время\n• Проверить, что врач доступен\n• Позвонить в регистратуру`,
      data: null
    }
  }
}

// Функция получения результатов анализов
async function getAnalysisResults(params: any, userId: string) {
  try {
    const { category, limit = 5 } = params
    
    let whereClause: any = { userId }
    
    if (category) {
      whereClause.category = category
    }
    
    const analyses = await prisma.analysis.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    
    if (analyses.length === 0) {
      return {
        message: 'У вас пока нет результатов анализов. Загрузите их в разделе "Документы".',
        data: null
      }
    }
    
    let message = `📊 Ваши результаты анализов:\n\n`
    
    analyses.forEach((analysis, index) => {
      message += `${index + 1}. ${analysis.title || 'Анализ'}\n`
      message += `   📅 Дата: ${new Date(analysis.createdAt).toLocaleDateString('ru-RU')}\n`
      
      if (analysis.results) {
        try {
          const results = JSON.parse(analysis.results)
          if (results.indicators && results.indicators.length > 0) {
            message += `   📈 Показатели:\n`
            results.indicators.slice(0, 3).forEach((indicator: any) => {
              const status = indicator.isNormal ? '✅' : '❌'
              message += `      • ${indicator.name}: ${indicator.value} ${indicator.unit || ''} ${status}\n`
            })
            if (results.indicators.length > 3) {
              message += `      • ... и еще ${results.indicators.length - 3} показателей\n`
            }
          }
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
      message += `\n`
    })
    
    return {
      message,
      data: analyses
    }
  } catch (error) {
    return {
      message: 'Не удалось получить результаты анализов.',
      data: null
    }
  }
}

// Функция получения рекомендаций
async function getRecommendations(params: any, userId: string) {
  try {
    const { category, limit = 3 } = params
    
    let whereClause: any = { status: 'ACTIVE' }
    
    if (category) {
      whereClause.category = category
    }
    
    const recommendations = await prisma.recommendation.findMany({
      where: whereClause,
      orderBy: { priority: 'desc' },
      take: limit
    })
    
    if (recommendations.length === 0) {
      return {
        message: 'Сейчас нет персональных рекомендаций. Проверьте раздел "Рекомендации" для общих советов по здоровью.',
        data: null
      }
    }
    
    let message = `💡 Персональные рекомендации:\n\n`
    
    recommendations.forEach((rec, index) => {
      message += `${index + 1}. ${rec.title}\n`
      message += `   📝 ${rec.description}\n`
      if (rec.type) {
        message += `   🏷️ Тип: ${rec.type}\n`
      }
      message += `\n`
    })
    
    return {
      message,
      data: recommendations
    }
  } catch (error) {
    return {
      message: 'Не удалось получить рекомендации.',
      data: null
    }
  }
}

// Функция получения списка врачей
async function getDoctors(params: any) {
  try {
    const { specialization, available } = params
    
    let whereClause: any = {}
    
    if (specialization) {
      whereClause.specialization = {
        contains: specialization,
        mode: 'insensitive'
      }
    }
    
    const doctors = await prisma.doctorProfile.findMany({
      where: whereClause,
      include: { user: true },
      take: 10
    })
    
    if (doctors.length === 0) {
      return {
        message: 'Врачи не найдены. Попробуйте изменить критерии поиска.',
        data: null
      }
    }
    
    let message = `👨‍⚕️ Доступные врачи:\n\n`
    
    doctors.forEach((doctor, index) => {
      message += `${index + 1}. **${doctor.user.name}**\n`
      message += `   🏥 Специализация: ${doctor.specialization}\n`
      if (doctor.phone) {
        message += `   📞 Телефон: ${doctor.phone}\n`
      }
      message += `\n`
    })
    
    message += `\n📅 Для записи на прием напишите:\n`
    message += `"Запиши меня к [ФИО врача] на [дата] в [время]"\n\n`
    message += `Например:\n`
    message += `• "Запиши меня к ${doctors[0].user.name} на завтра в 14:00"\n`
    message += `• "Запиши меня к ${doctors[0].user.name} на 10.10 в 10:00"\n`
    message += `• "Запиши меня к ${doctors[0].user.name} на послезавтра в 15:30"`
    
    return {
      message,
      data: doctors
    }
  } catch (error) {
    return {
      message: 'Не удалось получить список врачей.',
      data: null
    }
  }
}

// Функция получения записей на приемы
async function getAppointments(params: any, userId: string) {
  try {
    const { status, upcoming } = params
    
    let whereClause: any = { patientId: userId }
    
    if (status) {
      whereClause.status = status
    }
    
    if (upcoming) {
      whereClause.scheduledAt = {
        gte: new Date()
      }
    }
    
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        doctor: {
          include: { user: true }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10
    })
    
    if (appointments.length === 0) {
      return {
        message: upcoming ? 'У вас нет предстоящих записей на приемы.' : 'У вас нет записей на приемы.',
        data: null
      }
    }
    
    let message = `📅 Ваши записи на приемы:\n\n`
    
    appointments.forEach((appointment, index) => {
      message += `${index + 1}. ${appointment.doctor.user.name}\n`
      message += `   📅 Дата: ${new Date(appointment.scheduledAt).toLocaleDateString('ru-RU')}\n`
      message += `   🕐 Время: ${new Date(appointment.scheduledAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n`
      message += `   📋 Тип: ${getAppointmentTypeLabel(appointment.appointmentType)}\n`
      message += `   📊 Статус: ${getStatusLabel(appointment.status)}\n`
      if (appointment.notes) {
        message += `   📝 Заметки: ${appointment.notes}\n`
      }
      message += `\n`
    })
    
    return {
      message,
      data: appointments
    }
  } catch (error) {
    return {
      message: 'Не удалось получить записи на приемы.',
      data: null
    }
  }
}

type RagSource = {
  sourceType: 'document' | 'analysis' | 'diary' | 'knowledge'
  id: string
  label: string
  date?: string | null
  url?: string | null
  snippet?: string

  // legacy fields (kept for backwards compatibility in some fallbacks)
  documentId?: string
  fileName?: string
  studyType?: string | null
  studyDate?: string | null
}

type AiResponseWithSources = {
  response: string
  sources: RagSource[]
}

function normalizeForSearch(input: string) {
  return (input || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(input: string) {
  const norm = normalizeForSearch(input)
  if (!norm) return []
  return norm.split(' ').filter((t) => t.length >= 2)
}

function splitIntoChunks(text: string, chunkSize = 900, overlap = 120) {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const chunks: string[] = []
  let i = 0
  while (i < clean.length) {
    const end = Math.min(clean.length, i + chunkSize)
    chunks.push(clean.slice(i, end))
    if (end === clean.length) break
    i = Math.max(0, end - overlap)
  }
  return chunks
}

function scoreChunk(queryTokens: string[], chunkText: string) {
  const t = normalizeForSearch(chunkText)
  if (!t) return 0
  let score = 0
  for (const q of queryTokens) {
    if (t.includes(q)) score += 2
  }
  return score
}

function formatIndicatorsForPrompt(indicators: any) {
  if (!Array.isArray(indicators) || indicators.length === 0) return ''
  const lines: string[] = []
  for (const i of indicators.slice(0, 80)) {
    if (!i || typeof i !== 'object') continue
    const name = i.name ?? i.shortName ?? 'Показатель'
    const value = i.value ?? '—'
    const unit = i.unit ? ` ${i.unit}` : ''
    const refMin = i.referenceMin ?? null
    const refMax = i.referenceMax ?? null
    const ref =
      refMin !== null || refMax !== null ? ` (норма: ${refMin ?? '—'}–${refMax ?? '—'})` : ''
    const flag = i.isNormal === false ? ' ⚠️' : i.isNormal === true ? ' ✅' : ''
    lines.push(`- ${name}: ${value}${unit}${ref}${flag}`)
  }
  return lines.join('\n')
}

async function buildRagContext(userId: string, message: string, documentIds: string[]) {
  const docs = await prisma.document.findMany({
    where: {
      userId,
      id: { in: documentIds }
    },
    select: {
      id: true,
      fileName: true,
      uploadDate: true,
      studyDate: true,
      studyType: true,
      laboratory: true,
      doctor: true,
      findings: true,
      rawText: true,
      indicators: true
    }
  })

  const queryTokens = tokenize(message)
  const scored: Array<{ score: number; docId: string; docMeta: any; snippet: string }> = []

  for (const d of docs) {
    const baseTextParts: string[] = []
    if (d.findings) baseTextParts.push(String(d.findings))
    if (d.rawText) baseTextParts.push(String(d.rawText))
    const indicatorText = formatIndicatorsForPrompt(d.indicators)
    if (indicatorText) baseTextParts.push(indicatorText)
    const fullText = baseTextParts.join('\n')
    const chunks = splitIntoChunks(fullText, 900, 120)
    for (const c of chunks) {
      const s = scoreChunk(queryTokens, c)
      if (s > 0) {
        scored.push({ score: s, docId: d.id, docMeta: d, snippet: c })
      }
    }
    // fallback: если совпадений нет, добавляем короткий фрагмент, чтобы AI видел документ
    if (queryTokens.length > 0 && scored.filter((x) => x.docId === d.id).length === 0) {
      const fallback = (d.findings || indicatorText || d.rawText || '').toString().slice(0, 900)
      if (fallback) scored.push({ score: 1, docId: d.id, docMeta: d, snippet: fallback })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  // Важно: дедуп по документу. Иначе если один документ дал несколько релевантных чанков,
  // в UI будут дублироваться одинаковые "источники".
  const top: typeof scored = []
  const seenDoc = new Set<string>()
  for (const x of scored) {
    if (top.length >= 6) break
    if (seenDoc.has(x.docId)) continue
    seenDoc.add(x.docId)
    top.push(x)
  }

  const sources: RagSource[] = top.map((x) => ({
    sourceType: 'document',
    id: x.docId,
    label: x.docMeta.fileName,
    date: (x.docMeta.studyDate ?? x.docMeta.uploadDate)?.toISOString?.() ?? null,
    url: `/documents/${x.docId}`,
    snippet: x.snippet,
    documentId: x.docId,
    fileName: x.docMeta.fileName,
    studyType: x.docMeta.studyType ?? null,
    studyDate: (x.docMeta.studyDate ?? x.docMeta.uploadDate)?.toISOString?.() ?? null
  }))

  const promptBlocks = top.map((x, idx) => {
    const meta = x.docMeta
    const dateStr = meta.studyDate ?? meta.uploadDate
      ? new Date(meta.studyDate ?? meta.uploadDate).toLocaleDateString('ru-RU')
      : '—'
    const header = `[SOURCE ${idx + 1}] (DOCUMENT) ${meta.fileName}; Тип: ${meta.studyType ?? '—'}; Дата: ${dateStr}; Лаб: ${meta.laboratory ?? '—'}; URL: /documents/${x.docId}`
    return `${header}\n${x.snippet}`
  })

  return {
    sources,
    contextText: promptBlocks.join('\n\n')
  }
}

async function buildAllUserRagContext(userId: string, message: string) {
  const queryTokens = tokenize(message)

  const [docs, analyses, diary, kbIndicators] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      orderBy: { uploadDate: 'desc' },
      take: 40,
      select: {
        id: true,
        fileName: true,
        uploadDate: true,
        studyDate: true,
        studyType: true,
        laboratory: true,
        doctor: true,
        findings: true,
        rawText: true,
        indicators: true
      }
    }),
    prisma.analysis.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 60,
      select: { id: true, title: true, type: true, date: true, status: true, results: true, notes: true }
    }),
    prisma.healthDiaryEntry.findMany({
      where: { userId },
      orderBy: { entryDate: 'desc' },
      take: 90,
      select: {
        id: true,
        entryDate: true,
        mood: true,
        painScore: true,
        sleepHours: true,
        steps: true,
        temperature: true,
        weight: true,
        systolic: true,
        diastolic: true,
        pulse: true,
        symptoms: true,
        notes: true
      }
    }),
    (async () => {
      const toks = queryTokens.slice(0, 6)
      if (toks.length === 0) return []
      const OR: any[] = []
      for (const t of toks) {
        OR.push({ name: { contains: t, mode: 'insensitive' } })
        OR.push({ shortName: { contains: t, mode: 'insensitive' } })
        OR.push({ description: { contains: t, mode: 'insensitive' } })
        OR.push({ increasedMeaning: { contains: t, mode: 'insensitive' } })
        OR.push({ decreasedMeaning: { contains: t, mode: 'insensitive' } })
      }
      return await prisma.indicator.findMany({
        where: { OR },
        take: 18,
        select: {
          id: true,
          name: true,
          shortName: true,
          unit: true,
          description: true,
          increasedMeaning: true,
          decreasedMeaning: true,
          maintenanceRecommendations: true,
          improvementRecommendations: true
        }
      })
    })()
  ])

  const scored: Array<{ score: number; source: RagSource; snippet: string }> = []

  // documents
  for (const d of docs) {
    const baseTextParts: string[] = []
    if (d.findings) baseTextParts.push(String(d.findings))
    if (d.rawText) baseTextParts.push(String(d.rawText))
    const indicatorText = formatIndicatorsForPrompt(d.indicators)
    if (indicatorText) baseTextParts.push(indicatorText)
    const fullText = baseTextParts.join('\n')
    const chunks = splitIntoChunks(fullText, 900, 120)
    for (const c of chunks) {
      const s = scoreChunk(queryTokens, c)
      if (s > 0) {
        scored.push({
          score: s + 1,
          source: {
            sourceType: 'document',
            id: d.id,
            label: d.fileName,
            date: (d.studyDate ?? d.uploadDate)?.toISOString?.() ?? null,
            url: `/documents/${d.id}`,
            snippet: c,
            documentId: d.id,
            fileName: d.fileName,
            studyType: d.studyType ?? null,
            studyDate: (d.studyDate ?? d.uploadDate)?.toISOString?.() ?? null
          },
          snippet: c
        })
      }
    }
  }

  // analyses
  for (const a of analyses) {
    let parsed: any = null
    try {
      parsed = a?.results ? JSON.parse(a.results as unknown as string) : null
    } catch {
      parsed = null
    }
    const inds = Array.isArray(parsed?.indicators) ? parsed.indicators : []
    const indsText = formatIndicatorsForPrompt(inds)
    const notes = a.notes ? String(a.notes) : ''
    const header = `Анализ: ${a.title}; Тип: ${a.type}; Дата: ${(a.date as unknown as Date).toISOString().slice(0, 10)}; Статус: ${a.status}; URL: /analyses/${a.id}`
    const fullText = [header, indsText, notes].filter(Boolean).join('\n')
    const chunks = splitIntoChunks(fullText, 900, 120)
    for (const c of chunks) {
      const s = scoreChunk(queryTokens, c)
      if (s > 0) {
        scored.push({
          score: s + 2,
          source: {
            sourceType: 'analysis',
            id: a.id,
            label: a.title,
            date: (a.date as unknown as Date).toISOString?.() ?? null,
            url: `/analyses/${a.id}`,
            snippet: c
          },
          snippet: c
        })
      }
    }
  }

  // diary
  for (const e of diary) {
    const dateIso = (e.entryDate as unknown as Date).toISOString?.() ?? null
    const lines: string[] = []
    lines.push(`Дневник: ${(e.entryDate as unknown as Date).toISOString().slice(0, 10)}`)
    if (e.symptoms) lines.push(`Симптомы: ${e.symptoms}`)
    if (e.notes) lines.push(`Заметки: ${e.notes}`)
    const vitals: string[] = []
    if (typeof e.sleepHours === 'number') vitals.push(`сон ${e.sleepHours}ч`)
    if (typeof e.steps === 'number') vitals.push(`шаги ${e.steps}`)
    if (typeof e.temperature === 'number') vitals.push(`t ${e.temperature}`)
    if (typeof e.weight === 'number') vitals.push(`вес ${e.weight}`)
    if (typeof e.pulse === 'number') vitals.push(`пульс ${e.pulse}`)
    if (typeof e.systolic === 'number' && typeof e.diastolic === 'number') vitals.push(`АД ${e.systolic}/${e.diastolic}`)
    if (typeof e.mood === 'number') vitals.push(`настроение ${e.mood}/5`)
    if (typeof e.painScore === 'number') vitals.push(`боль ${e.painScore}/10`)
    if (vitals.length) lines.push(`Показатели: ${vitals.join(', ')}`)
    const text = lines.join('\n')
    const s = scoreChunk(queryTokens, text)
    if (s > 0) {
      scored.push({
        score: s + 1,
        source: {
          sourceType: 'diary',
          id: e.id,
          label: `Дневник ${dateIso ? new Date(dateIso).toLocaleDateString('ru-RU') : ''}`.trim(),
          date: dateIso,
          url: null,
          snippet: text
        },
        snippet: text
      })
    }
  }

  // knowledge
  for (const k of kbIndicators as any[]) {
    const text = [
      `Показатель: ${k.name}${k.shortName ? ` (${k.shortName})` : ''}; Ед.: ${k.unit}`,
      k.description ? `Описание: ${k.description}` : '',
      k.increasedMeaning ? `Повышение: ${k.increasedMeaning}` : '',
      k.decreasedMeaning ? `Понижение: ${k.decreasedMeaning}` : '',
      k.maintenanceRecommendations ? `Поддержание: ${k.maintenanceRecommendations}` : '',
      k.improvementRecommendations ? `Улучшение: ${k.improvementRecommendations}` : ''
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, 900)
    const s = scoreChunk(queryTokens, text)
    if (s > 0) {
      scored.push({
        score: s + 1,
        source: {
          sourceType: 'knowledge',
          id: k.id,
          label: k.name,
          date: null,
          url: null,
          snippet: text
        },
        snippet: text
      })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  const picked: typeof scored = []
  const byType = (t: RagSource['sourceType']) => scored.filter((x) => x.source.sourceType === t)
  for (const t of ['analysis', 'document', 'diary', 'knowledge'] as const) {
    picked.push(...byType(t).slice(0, 2))
  }
  for (const x of scored) {
    if (picked.length >= 10) break
    if (picked.some((p) => p.source.sourceType === x.source.sourceType && p.source.id === x.source.id && p.snippet === x.snippet)) continue
    picked.push(x)
  }
  // Дедуп по источнику (sourceType + id), чтобы не возвращать несколько чанков одного и того же анализа/документа.
  const topUnique: typeof picked = []
  const seenSrc = new Set<string>()
  for (const x of picked) {
    if (topUnique.length >= 10) break
    const key = `${x.source.sourceType}:${x.source.id}`
    if (seenSrc.has(key)) continue
    seenSrc.add(key)
    topUnique.push(x)
  }
  const top = topUnique

  const sources: RagSource[] = top.map((x) => ({ ...x.source, snippet: x.snippet }))
  const promptBlocks = top.map((x, idx) => {
    const src = x.source
    const dateStr = src.date ? new Date(src.date).toLocaleDateString('ru-RU') : '—'
    const urlStr = src.url ? `; URL: ${src.url}` : ''
    const header = `[SOURCE ${idx + 1}] (${src.sourceType.toUpperCase()}) ${src.label}; Дата: ${dateStr}${urlStr}`
    return `${header}\n${x.snippet}`
  })

  return { sources, contextText: promptBlocks.join('\n\n') }
}

// Генерация обычного AI ответа (с RAG по прикрепленным документам / по всем данным пользователя)
async function generateAIResponse(
  message: string,
  userId: string,
  history: any[],
  documentIds: string[],
  ragScope: 'none' | 'attached' | 'all'
): Promise<AiResponseWithSources> {
  const hasDocs = Array.isArray(documentIds) && documentIds.length > 0
  const rag =
    ragScope === 'all'
      ? await buildAllUserRagContext(userId, message)
      : hasDocs
        ? await buildRagContext(userId, message, documentIds)
        : { sources: [], contextText: '' }

  // Используем OpenAI если доступен
  const openaiKey = getOpenAIApiKey()
  if (openaiKey) {
    try {
      const systemPrompt = `Ты — персональный медицинский ассистент.

Твоя задача: отвечать на вопрос пациента на русском языке.

КРИТИЧЕСКИ ВАЖНО:
- Если приложены источники (SOURCE), опирайся ТОЛЬКО на них и не выдумывай факты.
- Если данных в SOURCE недостаточно — честно скажи, чего не хватает, и что нужно уточнить/загрузить.
- Не ставь диагнозы. При рисках — рекомендуй обратиться к врачу/в неотложную помощь.
- Объясняй медицинские термины простым языком.

ФОРМАТ ОТВЕТА:
1) Короткий вывод (1–3 предложения)
2) Детали/объяснение по пунктам
3) Что делать дальше (практические шаги)
4) Источники: перечисли использованные SOURCE (например: SOURCE 1, SOURCE 2). Если у SOURCE есть URL — добавь его.`

      const userBlock =
        rag.contextText && rag.contextText.trim().length > 0
          ? `ДАННЫЕ (RAG):\n${rag.contextText}\n\nВопрос пациента: ${message}`
          : `Вопрос пациента: ${message}`

      const text = await callOpenAIChat({
        system: systemPrompt,
        user: userBlock,
        temperature: 0.5
      })
      return { response: text, sources: rag.sources }
    } catch (error) {
      console.error('OpenAI error:', error)
    }
  }

  // Fallback ответы
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.match(/привет|здравствуй|добрый день/)) {
    return {
      response:
        'Здравствуйте! Я ваш персональный медицинский ассистент.\n\nЯ могу помочь вам:\n\n• Записаться на прием к врачу\n• Показать результаты анализов\n• Дать персональные рекомендации\n• Найти подходящего врача\n\nЧто вас интересует?',
      sources: rag.sources
    }
  }

  if (lowerMessage.match(/помощь|что ты умеешь|возможности/)) {
    return {
      response:
        'Я умею:\n\n• Запись на прием: "Запиши меня на прием к терапевту завтра в 10:00"\n• Результаты анализов: "Покажи мои последние анализы крови"\n• Рекомендации: "Дай мне рекомендации по питанию"\n• Поиск врачей: "Найди кардиолога"\n• Мои записи: "Покажи мои предстоящие приемы"\n\nЕсли вы прикрепите документы в чате — я смогу отвечать по ним (с источниками).',
      sources: rag.sources
    }
  }

  if (lowerMessage.match(/спасибо|благодарю/)) {
    return { response: 'Пожалуйста! Рад был помочь. Если возникнут еще вопросы — обращайтесь!', sources: rag.sources }
  }

  if (lowerMessage.match(/как дела|как ты/)) {
    return { response: 'У меня все отлично! Готов помочь вам с медицинскими вопросами и задачами.', sources: rag.sources }
  }

  if (lowerMessage.match(/время|дата|сегодня|завтра/)) {
    const now = new Date()
    return {
      response: `Сегодня: ${now.toLocaleDateString('ru-RU')}\nВремя: ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n\nНужна помощь с записью на прием?`,
      sources: rag.sources
    }
  }

  // Если есть источники, но OpenAI не настроен — скажем прямо и покажем, что нашли
  if (rag.sources.length > 0) {
    return {
      response:
        `Я вижу ваши данные, но AI сейчас не настроен (нет OPENAI_API_KEY).\n\nЯ могу использовать эти источники:\n${rag.sources
          .slice(0, 3)
          .map((s, idx) => `- SOURCE ${idx + 1}: ${s.label}${s.url ? ` (${s.url})` : ''}`)
          .join('\n')}\n\nДобавьте OPENAI_API_KEY — и я смогу сделать полноценный разбор по документам.`,
      sources: rag.sources
    }
  }

  return {
    response:
      'Я готов помочь вам с медицинскими вопросами! Попробуйте спросить:\n\n• "Запиши меня на прием к врачу"\n• "Покажи мои анализы"\n• "Дай рекомендации по здоровью"\n• "Найди терапевта"\n• "Покажи мои записи на приемы"',
    sources: rag.sources
  }
}

// Вспомогательные функции
function getAppointmentTypeLabel(type: string): string {
  switch (type) {
    case 'consultation': return 'Консультация'
    case 'follow_up': return 'Повторный прием'
    case 'routine': return 'Плановый осмотр'
    case 'emergency': return 'Срочный прием'
    default: return type
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'scheduled': return 'Запланировано'
    case 'confirmed': return 'Подтверждено'
    case 'completed': return 'Завершено'
    case 'cancelled': return 'Отменено'
    case 'rescheduled': return 'Перенесено'
    default: return status
  }
}
