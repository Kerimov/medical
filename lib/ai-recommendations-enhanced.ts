import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

interface UserLocation {
  city?: string
  coordinates?: { lat: number; lng: number }
}

interface AnalysisIndicator {
  name: string
  value: number
  unit: string
  referenceMin: number
  referenceMax: number
  isNormal: boolean
}

// Вычисление расстояния между двумя точками (формула Haversine)
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371 // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Поиск ближайших компаний
async function findNearbyCompanies(
  type: string,
  userLocation?: UserLocation,
  limit: number = 3
) {
  const where: any = {
    type,
    isActive: true
  }

  // Фильтр по городу, если указан
  if (userLocation?.city) {
    where.city = {
      contains: userLocation.city,
      mode: 'insensitive'
    }
  }

  let companies = await prisma.company.findMany({
    where,
    orderBy: [
      { isVerified: 'desc' },
      { rating: 'desc' }
    ],
    take: limit * 2 // Берем больше для последующей фильтрации по расстоянию
  })

  // Сортировка по расстоянию, если есть координаты
  if (userLocation?.coordinates && companies.length > 0) {
    companies = companies
      .map(company => {
        if (company.coordinates && typeof company.coordinates === 'object') {
          const coords = company.coordinates as { lat: number; lng: number }
          const distance = calculateDistance(
            userLocation.coordinates!.lat,
            userLocation.coordinates!.lng,
            coords.lat,
            coords.lng
          )
          return { ...company, distance }
        }
        return { ...company, distance: Infinity }
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
  }

  return companies.slice(0, limit)
}

// Анализ показателей здоровья пользователя
export async function analyzeUserHealth(userId: string) {
  logger.info(`Analyzing health for user ${userId}`, 'recommendations')
  
  // Получаем последние анализы пользователя
  const recentAnalyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5
  })

  logger.info(`Found ${recentAnalyses.length} recent analyses`, 'recommendations')
  recentAnalyses.forEach((a, i) => {
    logger.info(`Analysis ${i + 1}: ${a.title}, status: ${a.status}, type: ${a.type}`, 'recommendations')
  })

  // Получаем все документы с распознанными показателями
  const documents = await prisma.document.findMany({
    where: { 
      userId,
      parsed: true,
      indicators: { not: null }
    },
    orderBy: { uploadDate: 'desc' },
    take: 10
  })

  logger.info(`Found ${documents.length} parsed documents with indicators`, 'recommendations')

  const healthIssues: string[] = []
  const abnormalIndicators: any[] = []

  // Анализируем показатели из документов
  for (const doc of documents) {
    if (doc.indicators && typeof doc.indicators === 'object') {
      const indicators = doc.indicators as any[]
      logger.info(`Document ${doc.id}: processing ${indicators.length} indicators`, 'recommendations')
      
      for (const indicator of indicators) {
        const isAbnormal = !indicator.isNormal
        logger.info(`Indicator: ${indicator.name}, value: ${indicator.value}, isNormal: ${indicator.isNormal}, isAbnormal: ${isAbnormal}`, 'recommendations')
        
        if (!indicator.isNormal) {
          abnormalIndicators.push({
            ...indicator,
            documentId: doc.id,
            documentDate: doc.uploadDate
          })

          // Определяем тип проблемы
          const name = indicator.name.toLowerCase()
          logger.info(`Processing abnormal indicator: ${name}`, 'recommendations')
          
          if (name.includes('витамин d') || name.includes('25-oh')) {
            if (indicator.value < indicator.referenceMin) {
              healthIssues.push('vitamin_d_deficiency')
              logger.info(`Found vitamin D deficiency`, 'recommendations')
            }
          } else if (name.includes('холестерин') || name.includes('cholesterol')) {
            if (indicator.value > indicator.referenceMax) {
              healthIssues.push('high_cholesterol')
              logger.info(`Found high cholesterol`, 'recommendations')
            }
          } else if (name.includes('глюкоз') || name.includes('glucose')) {
            if (indicator.value > indicator.referenceMax) {
              healthIssues.push('high_glucose')
              logger.info(`Found high glucose`, 'recommendations')
            }
          } else if (name.includes('гемоглобин') || name.includes('hemoglobin')) {
            if (indicator.value < indicator.referenceMin) {
              healthIssues.push('low_hemoglobin')
              logger.info(`Found low hemoglobin`, 'recommendations')
            }
          } else if (name.includes('железо') || name.includes('ferritin')) {
            if (indicator.value < indicator.referenceMin) {
              healthIssues.push('iron_deficiency')
              logger.info(`Found iron deficiency`, 'recommendations')
            }
          }
        }
      }
    }
  }

  // Анализируем показатели из таблицы Analysis (если есть структурированные results)
  for (const analysis of recentAnalyses) {
    try {
      logger.info(`Processing analysis ${analysis.id}: ${analysis.title}`, 'recommendations')
      const parsed = typeof analysis.results === 'string' ? JSON.parse(analysis.results as unknown as string) : analysis.results
      if (!parsed) {
        logger.info(`Analysis ${analysis.id}: results is empty or invalid`, 'recommendations')
        continue
      }

      logger.info(`Analysis ${analysis.id}: parsed results structure: ${Array.isArray(parsed) ? 'array' : typeof parsed}`, 'recommendations')

      const pushFromIndicator = (nameRaw: any, v: any) => {
        const name = (nameRaw || '').toString().toLowerCase()
        const isNormal = v?.isNormal ?? v?.normal ?? v?.Normal ?? true
        const indicator = {
          name: nameRaw?.toString?.() ?? String(nameRaw),
          value: Number(v?.value ?? v?.Value),
          unit: v?.unit ?? v?.Unit,
          referenceMin: v?.referenceMin ?? v?.min ?? v?.ReferenceMin ?? NaN,
          referenceMax: v?.referenceMax ?? v?.max ?? v?.ReferenceMax ?? NaN,
          isNormal: Boolean(isNormal)
        }
        
        logger.info(`Indicator from analysis: ${indicator.name}, value: ${indicator.value}, isNormal: ${indicator.isNormal}`, 'recommendations')
        
        if (indicator.isNormal === false) {
          abnormalIndicators.push({ ...indicator, analysisId: analysis.id, analysisDate: analysis.date })
          logger.info(`Added abnormal indicator: ${indicator.name}`, 'recommendations')

          if (name.includes('витамин d') || name.includes('25-oh')) {
            healthIssues.push('vitamin_d_deficiency')
          } else if (name.includes('холестерин') || name.includes('cholesterol')) {
            healthIssues.push('high_cholesterol')
          } else if (name.includes('глюкоз') || name.includes('glucose')) {
            healthIssues.push('high_glucose')
          } else if (name.includes('гемоглобин') || name.includes('hemoglobin')) {
            healthIssues.push('low_hemoglobin')
          } else if (name.includes('железо') || name.includes('ferritin')) {
            healthIssues.push('iron_deficiency')
          }
        }
      }

      // Проверяем структуру parsed.indicators
      if (parsed.indicators && Array.isArray(parsed.indicators)) {
        logger.info(`Analysis ${analysis.id}: found ${parsed.indicators.length} indicators in parsed.indicators`, 'recommendations')
        for (const item of parsed.indicators) {
          const name = item?.name ?? item?.Name
          if (name !== undefined) pushFromIndicator(name, item)
        }
      } else if (Array.isArray(parsed)) {
        logger.info(`Analysis ${analysis.id}: results is array with ${parsed.length} items`, 'recommendations')
        for (const item of parsed) {
          const name = item?.name ?? item?.Name
          if (name !== undefined) pushFromIndicator(name, item)
        }
      } else if (typeof parsed === 'object') {
        logger.info(`Analysis ${analysis.id}: results is object with ${Object.keys(parsed).length} keys`, 'recommendations')
        const entries = Object.entries(parsed as Record<string, any>)
        for (const [nameRaw, v] of entries) {
          pushFromIndicator(nameRaw, v)
        }
      }
    } catch (err) {
      logger.error(`Error processing analysis ${analysis.id}:`, err)
      // игнорируем неструктурированные results
    }
  }

  logger.info(`Health analysis complete:`, 'recommendations', {
    healthIssues: healthIssues.length,
    uniqueHealthIssues: [...new Set(healthIssues)],
    abnormalIndicators: abnormalIndicators.length,
    recentAnalyses: recentAnalyses.length,
    documents: documents.length
  })

  return {
    healthIssues: [...new Set(healthIssues)], // Убираем дубликаты
    abnormalIndicators,
    recentAnalyses,
    documents
  }
}

// Генерация персонализированных рекомендаций
export async function createEnhancedRecommendationsForUser(
  userId: string,
  userLocation?: UserLocation
) {
  try {
    logger.info(`Generating enhanced recommendations for user ${userId}`, 'recommendations')

    const recommendations: any[] = []

    // Анализируем здоровье пользователя
    const healthData = await analyzeUserHealth(userId)
    const { healthIssues, abnormalIndicators, recentAnalyses, documents } = healthData

    logger.info(`Health analysis results:`, 'recommendations', {
      healthIssues: healthIssues.length,
      abnormalIndicators: abnormalIndicators.length,
      recentAnalyses: recentAnalyses.length,
      documents: documents.length
    })

    // Получаем информацию о пользователе
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // 1. Рекомендации на основе дефицита витамина D
    if (healthIssues.includes('vitamin_d_deficiency')) {
      const vitDIndicator = abnormalIndicators.find(ind => 
        ind.name.toLowerCase().includes('витамин d') || 
        ind.name.toLowerCase().includes('25-oh')
      )

      // Рекомендация анализа (без привязки к компании)
      recommendations.push({
        userId,
        type: 'ANALYSIS',
        title: 'Повторный анализ на витамин D',
        description: `Рекомендуем сдать контрольный анализ на витамин D через 2-3 месяца после начала приема добавок. Текущий уровень: ${vitDIndicator?.value} ${vitDIndicator?.unit}`,
        reason: `Низкий уровень витамина D (${vitDIndicator?.value} ${vitDIndicator?.unit})`,
        priority: 5,
        companyId: null, // Без привязки к компании
        metadata: {
          testType: 'vitamin_d',
          currentValue: vitDIndicator?.value,
          aiExplanation: 'Обнаружен дефицит витамина D по результатам анализа. Рекомендуем контрольное исследование для подтверждения динамики и подбора коррекции.'
        }
      })

      // Рекомендация добавок (без привязки к компании)
      recommendations.push({
        userId,
        type: 'SUPPLEMENT',
        title: 'Витамин D3 для коррекции дефицита',
        description: 'Рекомендуется прием витамина D3 в дозировке 2000-4000 МЕ в день. Проконсультируйтесь с врачом для подбора оптимальной дозы. Можно приобрести в аптеке или магазине здорового питания.',
        reason: `Дефицит витамина D (${vitDIndicator?.value} ${vitDIndicator?.unit})`,
        priority: 5,
        companyId: null, // Без привязки к компании
        metadata: {
          supplementType: 'vitamin_d3',
          recommendedDosage: '2000-4000 МЕ',
          duration: '2-3 месяца',
          aiExplanation: 'Добавки витамина D3 помогают безопасно и предсказуемо повысить уровень 25‑OH D до целевых значений.'
        }
      })

      // Рекомендация статьи
      recommendations.push({
        userId,
        type: 'ARTICLE',
        title: 'Витамин D: важность и способы коррекции дефицита',
        description: 'Подробная статья о роли витамина D в организме, причинах и последствиях дефицита, способах профилактики и лечения.',
        reason: 'Дефицит витамина D',
        priority: 3,
        companyId: null,
        metadata: {
          articleUrl: 'https://example.com/vitamin-d-deficiency',
          readingTime: '10 минут',
          aiExplanation: 'Рекомендуем ознакомиться с материалом, который поможет понять причины дефицита и принципы его коррекции.'
        }
      })

      // Если есть компании - добавляем их как дополнительные рекомендации (опционально)
      const laboratories = await findNearbyCompanies('LABORATORY', userLocation, 1)
      if (laboratories.length > 0) {
        recommendations.push({
          userId,
          type: 'ANALYSIS',
          title: `Лаборатория "${laboratories[0].name}" для сдачи анализа`,
          description: `Можете сдать анализ на витамин D в этой лаборатории. Текущий уровень: ${vitDIndicator?.value} ${vitDIndicator?.unit}`,
          reason: `Низкий уровень витамина D (${vitDIndicator?.value} ${vitDIndicator?.unit})`,
          priority: 4,
          companyId: laboratories[0].id,
          metadata: {
            testType: 'vitamin_d',
            currentValue: vitDIndicator?.value,
            distance: (laboratories[0] as any).distance,
            aiExplanation: 'Ближайшая лаборатория для сдачи контрольного анализа.'
          }
        })
      }
    }

    // 2. Рекомендации при повышенном холестерине
    if (healthIssues.includes('high_cholesterol')) {
      const cholIndicator = abnormalIndicators.find(ind =>
        ind.name.toLowerCase().includes('холестерин')
      )

      // Рекомендация по питанию (без привязки к компании)
      recommendations.push({
        userId,
        type: 'SERVICE',
        title: 'Коррекция питания для снижения холестерина',
        description: 'Рекомендуется снизить потребление насыщенных жиров, увеличить клетчатку и омега-3. Рассмотрите консультацию диетолога для составления индивидуального плана питания.',
        reason: `Повышенный уровень холестерина (${cholIndicator?.value} ${cholIndicator?.unit})`,
        priority: 4,
        companyId: null,
        metadata: {
          serviceType: 'nutrition_consultation',
          currentValue: cholIndicator?.value,
          aiExplanation: 'Коррекция питания (снижение насыщенных жиров, увеличение клетчатки и омега‑3) — первый шаг при гиперхолестеринемии.'
        }
      })

      // Рекомендация по физической активности (без привязки к компании)
      recommendations.push({
        userId,
        type: 'SERVICE',
        title: 'Регулярные физические нагрузки',
        description: 'Умеренная физическая активность 3-4 раза в неделю по 30-45 минут помогает снизить уровень "плохого" холестерина и повысить "хороший". Можно заниматься дома или в фитнес-центре.',
        reason: 'Повышенный холестерин',
        priority: 3,
        companyId: null,
        metadata: {
          activityType: 'cardio',
          frequency: '3-4 раза в неделю',
          duration: '30-45 минут',
          aiExplanation: 'Аэробные нагрузки улучшают липидный профиль и снижают сердечно‑сосудистые риски.'
        }
      })

      // Если есть компании - добавляем их как дополнительные рекомендации (опционально)
      const nutritionists = await findNearbyCompanies('NUTRITIONIST', userLocation, 1)
      if (nutritionists.length > 0) {
        recommendations.push({
          userId,
          type: 'SERVICE',
          title: `Консультация диетолога "${nutritionists[0].name}"`,
          description: 'Специалист поможет составить индивидуальный план питания для снижения уровня холестерина.',
          reason: `Повышенный уровень холестерина (${cholIndicator?.value} ${cholIndicator?.unit})`,
          priority: 3,
          companyId: nutritionists[0].id,
          metadata: {
            serviceType: 'nutrition_consultation',
            currentValue: cholIndicator?.value,
            distance: (nutritionists[0] as any).distance,
            aiExplanation: 'Ближайший диетолог для консультации.'
          }
        })
      }
    }

    // 3. Рекомендации при повышенной глюкозе
    if (healthIssues.includes('high_glucose')) {
      const glucoseIndicator = abnormalIndicators.find(ind =>
        ind.name.toLowerCase().includes('глюкоз')
      )

      // Рекомендация консультации врача (без привязки к компании)
      recommendations.push({
        userId,
        type: 'SERVICE',
        title: 'Консультация эндокринолога',
        description: 'Рекомендуется консультация специалиста для оценки состояния углеводного обмена и исключения сахарного диабета. Обратитесь в поликлинику или частную клинику.',
        reason: `Повышенный уровень глюкозы (${glucoseIndicator?.value} ${glucoseIndicator?.unit})`,
        priority: 5,
        companyId: null,
        metadata: {
          specialization: 'endocrinology',
          currentValue: glucoseIndicator?.value,
          aiExplanation: 'Повышенная глюкоза требует очной оценки факторов риска и возможной дообследования.'
        }
      })

      // Рекомендация анализа (без привязки к компании)
      recommendations.push({
        userId,
        type: 'ANALYSIS',
        title: 'Анализ на гликированный гемоглобин (HbA1c)',
        description: 'Этот анализ покажет средний уровень глюкозы в крови за последние 2-3 месяца. Можно сдать в любой лаборатории.',
        reason: 'Повышенная глюкоза',
        priority: 4,
        companyId: null,
        metadata: {
          testType: 'hba1c',
          aiExplanation: 'HbA1c отражает среднюю гликемию за 2–3 месяца и помогает подтвердить нарушение углеводного обмена.'
        }
      })

      // Если есть компании - добавляем их как дополнительные рекомендации (опционально)
      const clinics = await findNearbyCompanies('CLINIC', userLocation, 1)
      if (clinics.length > 0) {
        recommendations.push({
          userId,
          type: 'SERVICE',
          title: `Клиника "${clinics[0].name}" для консультации`,
          description: 'Рекомендуется консультация эндокринолога в этой клинике.',
          reason: `Повышенный уровень глюкозы (${glucoseIndicator?.value} ${glucoseIndicator?.unit})`,
          priority: 4,
          companyId: clinics[0].id,
          metadata: {
            specialization: 'endocrinology',
            currentValue: glucoseIndicator?.value,
            distance: (clinics[0] as any).distance,
            aiExplanation: 'Ближайшая клиника для консультации.'
          }
        })
      }
    }

    // 4. Рекомендации при низком гемоглобине
    if (healthIssues.includes('low_hemoglobin') || healthIssues.includes('iron_deficiency')) {
      const hbIndicator = abnormalIndicators.find(ind =>
        ind.name.toLowerCase().includes('гемоглобин') ||
        ind.name.toLowerCase().includes('железо')
      )

      // Рекомендация препаратов железа (без привязки к компании)
      recommendations.push({
        userId,
        type: 'SUPPLEMENT',
        title: 'Препараты железа для коррекции анемии',
        description: 'Рекомендуется прием препаратов железа по назначению врача. Важно: принимайте на голодный желудок и избегайте одновременного приема с кальцием и чаем. Можно приобрести в любой аптеке.',
        reason: `Низкий уровень ${hbIndicator?.name} (${hbIndicator?.value} ${hbIndicator?.unit})`,
        priority: 4,
        companyId: null,
        metadata: {
          supplementType: 'iron',
          currentValue: hbIndicator?.value,
          aiExplanation: 'Пероральные препараты железа — стандарт первой линии при железодефицитной анемии.'
        }
      })

      // Рекомендация консультации врача (без привязки к компании)
      recommendations.push({
        userId,
        type: 'SERVICE',
        title: 'Консультация терапевта',
        description: 'Необходима консультация врача для выяснения причины анемии и назначения адекватного лечения. Обратитесь в поликлинику или частную клинику.',
        reason: 'Низкий гемоглобин',
        priority: 5,
        companyId: null,
        metadata: {
          specialization: 'therapy',
          aiExplanation: 'Врач оценит возможные причины анемии (дефицит железа, кровопотери и т.д.) и подберёт тактику.'
        }
      })

      // Если есть компании - добавляем их как дополнительные рекомендации (опционально)
      const pharmacies = await findNearbyCompanies('PHARMACY', userLocation, 1)
      if (pharmacies.length > 0) {
        recommendations.push({
          userId,
          type: 'SUPPLEMENT',
          title: `Аптека "${pharmacies[0].name}" для приобретения препаратов железа`,
          description: 'Можете приобрести препараты железа в этой аптеке. Проконсультируйтесь с врачом перед приемом.',
          reason: `Низкий уровень ${hbIndicator?.name} (${hbIndicator?.value} ${hbIndicator?.unit})`,
          priority: 3,
          companyId: pharmacies[0].id,
          metadata: {
            supplementType: 'iron',
            currentValue: hbIndicator?.value,
            distance: (pharmacies[0] as any).distance,
            aiExplanation: 'Ближайшая аптека.'
          }
        })
      }
    }

    // Fallback: если есть анализы со статусом abnormal, но не удалось разобрать показатели — создаем базовые рекомендации
    if (recommendations.length === 0) {
      logger.info(`No specific recommendations created yet, checking fallback options`, 'recommendations')
      
      const allAnalysesStatuses = recentAnalyses.map(a => a.status)
      logger.info(`All analysis statuses: ${allAnalysesStatuses.join(', ')}`, 'recommendations')
      
      const abnormalAnalyses = (recentAnalyses || []).filter(a => a.status === 'abnormal')
      
      logger.info(`No specific health issues found, checking abnormal analyses: ${abnormalAnalyses.length}`, 'recommendations')
      logger.info(`Abnormal analyses details:`, 'recommendations', abnormalAnalyses.map(a => ({ id: a.id, title: a.title, status: a.status })))
      
      if (abnormalAnalyses.length > 0) {
        logger.info(`Trying to find companies for recommendations`, 'recommendations')
        const [labs, clinics] = await Promise.all([
          findNearbyCompanies('LABORATORY', userLocation, 2),
          findNearbyCompanies('CLINIC', userLocation, 1)
        ])

        logger.info(`Found companies: labs=${labs.length}, clinics=${clinics.length}`, 'recommendations')

        // Создаем уникальные рекомендации для каждого анализа
        const uniqueAnalysisTitles = new Set<string>()
        
        for (const a of abnormalAnalyses.slice(0, 2)) {
          const analysisTitle = a.title || a.type || 'Анализ'
          const analysisKey = `${a.type}-${analysisTitle}`
          
          // Пропускаем, если уже создали рекомендацию для этого типа анализа
          if (uniqueAnalysisTitles.has(analysisKey)) {
            logger.info(`Skipping duplicate analysis type: ${analysisKey}`, 'recommendations')
            continue
          }
          
          uniqueAnalysisTitles.add(analysisKey)
          
          // Создаем рекомендации БЕЗ привязки к компаниям
          recommendations.push({
            userId,
            type: 'ANALYSIS',
            title: `Контрольный анализ: ${analysisTitle}`,
            description: 'Рекомендуем пересдать анализ для подтверждения отклонений и мониторинга динамики. Можно сдать в любой лаборатории.',
            reason: 'Обнаружены отклонения в результатах анализа',
            priority: 4,
            companyId: null,
            analysisId: a.id,
            metadata: { 
              analysisId: a.id, 
              aiExplanation: 'Выявлены отклонения в анализе, рекомендуется контроль для подтверждения и мониторинга динамики.' 
            }
          })
        }
        
        // Создаем общую рекомендацию по консультации врача (только один раз)
        if (abnormalAnalyses.length > 0) {
          recommendations.push({
            userId,
            type: 'SERVICE',
            title: 'Консультация врача по результатам анализа',
            description: 'Запишитесь к врачу для интерпретации отклонений и подбора тактики коррекции. Обратитесь в поликлинику или частную клинику.',
            reason: 'Обнаружены отклонения в анализе',
            priority: 3,
            companyId: null,
            metadata: { 
              aiExplanation: 'Очная консультация нужна для выбора дальнейших шагов и исключения серьёзной патологии.' 
            }
          })
        }

        // Добавляем рекомендации с компаниями только один раз (не для каждого анализа)
        if (labs.length > 0 && abnormalAnalyses.length > 0) {
          recommendations.push({
            userId,
            type: 'ANALYSIS',
            title: `Лаборатория "${labs[0].name}" для сдачи анализа`,
            description: 'Можете сдать контрольные анализы в этой лаборатории.',
            reason: 'Обнаружены отклонения в результатах анализа',
            priority: 3,
            companyId: labs[0].id,
            metadata: { 
              distance: (labs[0] as any).distance, 
              aiExplanation: 'Ближайшая лаборатория для сдачи анализа.' 
            }
          })
        }

        if (clinics.length > 0 && abnormalAnalyses.length > 0) {
          recommendations.push({
            userId,
            type: 'SERVICE',
            title: `Клиника "${clinics[0].name}" для консультации`,
            description: 'Можете записаться на консультацию в эту клинику.',
            reason: 'Обнаружены отклонения в анализе',
            priority: 2,
            companyId: clinics[0].id,
            metadata: { 
              distance: (clinics[0] as any).distance, 
              aiExplanation: 'Ближайшая клиника для консультации.' 
            }
          })
        }
      } else if (recentAnalyses.length > 0 || documents.length > 0) {
        // Если есть анализы или документы, но нет отклонений - создаем общие рекомендации
        logger.info(`Creating general recommendations for user with analyses/documents`, 'recommendations')
        
        // Создаем общие рекомендации БЕЗ привязки к компаниям
        recommendations.push({
          userId,
          type: 'ANALYSIS',
          title: 'Плановый профилактический осмотр',
          description: 'Рекомендуем регулярно проходить профилактические обследования для поддержания здоровья. Можно сдать в любой лаборатории.',
          reason: 'Профилактика и раннее выявление заболеваний',
          priority: 2,
          companyId: null,
          metadata: { 
            aiExplanation: 'Регулярные профилактические обследования помогают выявить проблемы на ранней стадии.' 
          }
        })

        recommendations.push({
          userId,
          type: 'SERVICE',
          title: 'Консультация врача для профилактики',
          description: 'Регулярные консультации с врачом помогают поддерживать здоровье и своевременно выявлять проблемы. Обратитесь в поликлинику или частную клинику.',
          reason: 'Профилактика и поддержание здоровья',
          priority: 2,
          companyId: null,
          metadata: { 
            aiExplanation: 'Профилактические визиты к врачу важны для поддержания здоровья.' 
          }
        })

        // Если есть компании - добавляем их как дополнительные рекомендации (опционально)
        const [labs, clinics] = await Promise.all([
          findNearbyCompanies('LABORATORY', userLocation, 1),
          findNearbyCompanies('CLINIC', userLocation, 1)
        ])

        logger.info(`General recommendations: found labs=${labs.length}, clinics=${clinics.length}`, 'recommendations')

        if (labs.length > 0) {
          recommendations.push({
            userId,
            type: 'ANALYSIS',
            title: `Лаборатория "${labs[0].name}" для профилактического осмотра`,
            description: 'Можете пройти профилактическое обследование в этой лаборатории.',
            reason: 'Профилактика и раннее выявление заболеваний',
            priority: 1,
            companyId: labs[0].id,
            metadata: { 
              distance: (labs[0] as any).distance, 
              aiExplanation: 'Ближайшая лаборатория для профилактического обследования.' 
            }
          })
        }

        if (clinics.length > 0) {
          recommendations.push({
            userId,
            type: 'SERVICE',
            title: `Клиника "${clinics[0].name}" для профилактической консультации`,
            description: 'Можете записаться на профилактическую консультацию в эту клинику.',
            reason: 'Профилактика и поддержание здоровья',
            priority: 1,
            companyId: clinics[0].id,
            metadata: { 
              distance: (clinics[0] as any).distance, 
              aiExplanation: 'Ближайшая клиника для профилактической консультации.' 
            }
          })
        }
      }
    }

    // Создаем рекомендации в базе данных
    const createdRecommendations = []
    for (const rec of recommendations) {
      try {
        // Извлекаем analysisId из метаданных для более точной проверки
        const recAnalysisId = rec.metadata?.analysisId || rec.analysisId || null
        
        // Idempotency: проверяем существующие рекомендации более тщательно
        // Проверяем по нескольким критериям:
        // 1. Тип, заголовок и компания
        // 2. AnalysisId в метаданных (если есть)
        // 3. Не создаем дубликаты за последние 7 дней
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        
        const existingConditions: any[] = [
          {
            userId,
            type: rec.type,
            title: rec.title,
            companyId: rec.companyId || null,
            createdAt: { gte: sevenDaysAgo }
          }
        ]
        
        // Если есть analysisId, добавляем дополнительную проверку
        if (recAnalysisId) {
          existingConditions.push({
            userId,
            type: rec.type,
            analysisId: recAnalysisId,
            createdAt: { gte: sevenDaysAgo }
          })
        }
        
        const existing = await prisma.recommendation.findFirst({
          where: {
            OR: existingConditions,
            // Не учитываем только отклоненные рекомендации (если пользователь отклонил, можно создать снова)
            status: { not: 'DISMISSED' }
          }
        })
        
        if (existing) {
          logger.info(`Skipping duplicate recommendation: ${rec.type} - ${rec.title}`, 'recommendations')
          continue
        }

        const created = await prisma.recommendation.create({
          data: {
            userId: rec.userId,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            reason: rec.reason,
            priority: rec.priority,
            companyId: rec.companyId || null,
            productId: rec.productId || null,
            analysisId: rec.analysisId || null,
            metadata: rec.metadata ? JSON.stringify(rec.metadata) : null,
            expiresAt: rec.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней по умолчанию
          },
          include: {
            company: true,
            product: true,
            analysis: {
              select: {
                id: true,
                title: true,
                type: true
              }
            }
          }
        })
        createdRecommendations.push(created)
        logger.info(`Created recommendation: ${rec.type} - ${rec.title}`, 'recommendations')
      } catch (error) {
        logger.error('Error creating recommendation:', error)
      }
    }

    logger.info(`Created ${createdRecommendations.length} enhanced recommendations for user ${userId}`)

    return createdRecommendations
  } catch (error) {
    logger.error('Error creating enhanced recommendations:', error)
    throw error
  }
}