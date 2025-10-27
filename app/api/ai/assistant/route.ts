import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'

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
    console.log('[AI-ASSISTANT] Prisma client status:', { 
      isPrismaAvailable: !!prisma,
      hasDoctorProfileModel: !!prisma?.doctorProfile,
      prismaType: typeof prisma 
    })
    
    const { message, history } = await request.json()
    console.log('[AI-ASSISTANT] Request data:', { message: message?.substring(0, 100), hasHistory: !!history })

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
    } else {
      // Обычный AI ответ без функций
      console.log('[AI-ASSISTANT] Generating regular AI response')
      const aiResponse = await generateAIResponse(message, userId, history)
      console.log('[AI-ASSISTANT] AI response generated')
      
      return NextResponse.json({
        response: aiResponse,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('[AI-ASSISTANT] Detailed error:', error)
    console.error('[AI-ASSISTANT] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: `Ошибка обработки сообщения: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
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

// Генерация обычного AI ответа
async function generateAIResponse(message: string, userId: string, history: any[]) {
  // Используем Google Gemini если доступен
  if (process.env.GOOGLE_API_KEY) {
    try {
      const systemPrompt = `Ты - персональный медицинский ассистент. Ты помогаешь пациентам с:
- Записью на приемы к врачам
- Получением результатов анализов
- Персональными рекомендациями по здоровью
- Общими вопросами о здоровье

ВАЖНО:
- Будь дружелюбным и полезным
- Предлагай конкретные действия
- Объясняй медицинские термины простым языком
- Если не знаешь ответ - предлагай обратиться к врачу
- Отвечай на русском языке`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nВопрос пациента: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.candidates[0].content.parts[0].text
      }
    } catch (error) {
      console.error('Gemini error:', error)
    }
  }

  // Fallback ответы
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.match(/привет|здравствуй|добрый день/)) {
    return 'Здравствуйте! 👋 Я ваш персональный медицинский ассистент. Я могу помочь вам:\n\n• 📅 Записаться на прием к врачу\n• 📊 Показать результаты анализов\n• 💡 Дать персональные рекомендации\n• 👨‍⚕️ Найти подходящего врача\n\nЧто вас интересует?'
  }
  
  if (lowerMessage.match(/помощь|что ты умеешь|возможности/)) {
    return 'Я умею:\n\n📅 **Запись на прием**: "Запиши меня на прием к терапевту завтра в 10:00"\n📊 **Результаты анализов**: "Покажи мои последние анализы крови"\n💡 **Рекомендации**: "Дай мне рекомендации по питанию"\n👨‍⚕️ **Поиск врачей**: "Найди кардиолога"\n📋 **Мои записи**: "Покажи мои предстоящие приемы"\n\nПросто скажите, что вам нужно!'
  }

  if (lowerMessage.match(/спасибо|благодарю/)) {
    return 'Пожалуйста! 😊 Рад был помочь. Если возникнут еще вопросы - обращайтесь!'
  }

  if (lowerMessage.match(/как дела|как ты/)) {
    return 'У меня все отлично! 😊 Готов помочь вам с медицинскими вопросами и задачами.'
  }

  if (lowerMessage.match(/время|дата|сегодня|завтра/)) {
    const now = new Date()
    return `📅 Сегодня: ${now.toLocaleDateString('ru-RU')}\n🕐 Время: ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n\nНужна помощь с записью на прием?`
  }
  
  return 'Я готов помочь вам с медицинскими вопросами! Попробуйте спросить:\n\n• "Запиши меня на прием к врачу"\n• "Покажи мои анализы"\n• "Дай рекомендации по здоровью"\n• "Найди терапевта"\n• "Покажи мои записи на приемы"'
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
