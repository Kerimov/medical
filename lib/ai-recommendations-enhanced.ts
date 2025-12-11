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
  // Получаем последние анализы пользователя
  const recentAnalyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5
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

  const healthIssues: string[] = []
  const abnormalIndicators: any[] = []

  // Анализируем показатели из документов
  for (const doc of documents) {
    if (doc.indicators && typeof doc.indicators === 'object') {
      const indicators = doc.indicators as any[]
      
      for (const indicator of indicators) {
        if (!indicator.isNormal) {
          abnormalIndicators.push({
            ...indicator,
            documentId: doc.id,
            documentDate: doc.uploadDate
          })

          // Определяем тип проблемы
          const name = indicator.name.toLowerCase()
          if (name.includes('витамин d') || name.includes('25-oh')) {
            if (indicator.value < indicator.referenceMin) {
              healthIssues.push('vitamin_d_deficiency')
            }
          } else if (name.includes('холестерин') || name.includes('cholesterol')) {
            if (indicator.value > indicator.referenceMax) {
              healthIssues.push('high_cholesterol')
            }
          } else if (name.includes('глюкоз') || name.includes('glucose')) {
            if (indicator.value > indicator.referenceMax) {
              healthIssues.push('high_glucose')
            }
          } else if (name.includes('гемоглобин') || name.includes('hemoglobin')) {
            if (indicator.value < indicator.referenceMin) {
              healthIssues.push('low_hemoglobin')
            }
          } else if (name.includes('железо') || name.includes('ferritin')) {
            if (indicator.value < indicator.referenceMin) {
              healthIssues.push('iron_deficiency')
            }
          }
        }
      }
    }
  }

  // Анализируем показатели из таблицы Analysis (если есть структурированные results)
  for (const analysis of recentAnalyses) {
    try {
      const parsed = typeof analysis.results === 'string' ? JSON.parse(analysis.results as unknown as string) : analysis.results
      if (!parsed) continue

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
        if (indicator.isNormal === false) {
          abnormalIndicators.push({ ...indicator, analysisId: analysis.id, analysisDate: analysis.date })

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

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const name = item?.name ?? item?.Name
          if (name !== undefined) pushFromIndicator(name, item)
        }
      } else if (typeof parsed === 'object') {
        const entries = Object.entries(parsed as Record<string, any>)
        for (const [nameRaw, v] of entries) {
          pushFromIndicator(nameRaw, v)
        }
      }
    } catch {
      // игнорируем неструктурированные results
    }
  }

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

      // Находим ближайшие лаборатории
      const laboratories = await findNearbyCompanies('LABORATORY', userLocation, 3)
      
      if (laboratories.length > 0) {
        for (const lab of laboratories.slice(0, 2)) {
          recommendations.push({
            userId,
            type: 'ANALYSIS',
            title: 'Повторный анализ на витамин D',
            description: `Рекомендуем сдать контрольный анализ на витамин D через 2-3 месяца после начала приема добавок. Текущий уровень: ${vitDIndicator?.value} ${vitDIndicator?.unit}`,
            reason: `Низкий уровень витамина D (${vitDIndicator?.value} ${vitDIndicator?.unit})`,
            priority: 5,
            companyId: lab.id,
            metadata: {
              testType: 'vitamin_d',
              currentValue: vitDIndicator?.value,
              distance: (lab as any).distance,
              aiExplanation: 'Обнаружен дефицит витамина D по результатам анализа. Рекомендуем контрольное исследование для подтверждения динамики и подбора коррекции.'
            }
          })
        }
      }

      // Находим аптеки и магазины здорового питания
      const pharmacies = await findNearbyCompanies('PHARMACY', userLocation, 2)
      const healthStores = await findNearbyCompanies('HEALTH_STORE', userLocation, 2)

      const stores = [...pharmacies, ...healthStores]
      
      if (stores.length > 0) {
        for (const store of stores.slice(0, 2)) {
          recommendations.push({
            userId,
            type: 'SUPPLEMENT',
            title: 'Витамин D3 для коррекции дефицита',
            description: 'Рекомендуется прием витамина D3 в дозировке 2000-4000 МЕ в день. Проконсультируйтесь с врачом для подбора оптимальной дозы.',
            reason: `Дефицит витамина D (${vitDIndicator?.value} ${vitDIndicator?.unit})`,
            priority: 5,
            companyId: store.id,
            metadata: {
              supplementType: 'vitamin_d3',
              recommendedDosage: '2000-4000 МЕ',
              duration: '2-3 месяца',
              distance: (store as any).distance,
              aiExplanation: 'Добавки витамина D3 помогают безопасно и предсказуемо повысить уровень 25‑OH D до целевых значений.'
            }
          })
        }
      }

      // Рекомендация статьи
        recommendations.push({
        userId,
        type: 'ARTICLE',
        title: 'Витамин D: важность и способы коррекции дефицита',
        description: 'Подробная статья о роли витамина D в организме, причинах и последствиях дефицита, способах профилактики и лечения.',
        reason: 'Дефицит витамина D',
        priority: 3,
        metadata: {
          articleUrl: 'https://example.com/vitamin-d-deficiency',
            readingTime: '10 минут',
            aiExplanation: 'Рекомендуем ознакомиться с материалом, который поможет понять причины дефицита и принципы его коррекции.'
        }
      })
    }

    // 2. Рекомендации при повышенном холестерине
    if (healthIssues.includes('high_cholesterol')) {
      const cholIndicator = abnormalIndicators.find(ind =>
        ind.name.toLowerCase().includes('холестерин')
      )

      // Рекомендуем диетолога
      const nutritionists = await findNearbyCompanies('NUTRITIONIST', userLocation, 2)
      
      if (nutritionists.length > 0) {
        recommendations.push({
          userId,
          type: 'SERVICE',
          title: 'Консультация диетолога для коррекции питания',
          description: 'Специалист поможет составить индивидуальный план питания для снижения уровня холестерина.',
          reason: `Повышенный уровень холестерина (${cholIndicator?.value} ${cholIndicator?.unit})`,
          priority: 4,
          companyId: nutritionists[0].id,
          metadata: {
            serviceType: 'nutrition_consultation',
            currentValue: cholIndicator?.value,
            distance: (nutritionists[0] as any).distance,
            aiExplanation: 'Коррекция питания (снижение насыщенных жиров, увеличение клетчатки и омега‑3) — первый шаг при гиперхолестеринемии.'
          }
        })
      }

      // Рекомендуем фитнес
      const fitnessСenters = await findNearbyCompanies('FITNESS_CENTER', userLocation, 2)
      
      if (fitnessСenters.length > 0) {
        recommendations.push({
          userId,
          type: 'SERVICE',
          title: 'Регулярные физические нагрузки',
          description: 'Умеренная физическая активность 3-4 раза в неделю помогает снизить уровень "плохого" холестерина и повысить "хороший".',
          reason: 'Повышенный холестерин',
          priority: 3,
          companyId: fitnessСenters[0].id,
          metadata: {
            activityType: 'cardio',
            frequency: '3-4 раза в неделю',
            duration: '30-45 минут',
            distance: (fitnessСenters[0] as any).distance,
            aiExplanation: 'Аэробные нагрузки улучшают липидный профиль и снижают сердечно‑сосудистые риски.'
          }
        })
      }
    }

    // 3. Рекомендации при повышенной глюкозе
    if (healthIssues.includes('high_glucose')) {
      const glucoseIndicator = abnormalIndicators.find(ind =>
        ind.name.toLowerCase().includes('глюкоз')
      )

      // Рекомендуем эндокринолога (клиники)
      const clinics = await findNearbyCompanies('CLINIC', userLocation, 2)
      
      if (clinics.length > 0) {
        recommendations.push({
          userId,
          type: 'SERVICE',
          title: 'Консультация эндокринолога',
          description: 'Рекомендуется консультация специалиста для оценки состояния углеводного обмена и исключения сахарного диабета.',
          reason: `Повышенный уровень глюкозы (${glucoseIndicator?.value} ${glucoseIndicator?.unit})`,
          priority: 5,
          companyId: clinics[0].id,
          metadata: {
            specialization: 'endocrinology',
            currentValue: glucoseIndicator?.value,
            distance: (clinics[0] as any).distance,
            aiExplanation: 'Повышенная глюкоза требует очной оценки факторов риска и возможной дообследования.'
          }
        })
      }

      // Рекомендуем анализ на гликированный гемоглобин
      const laboratories = await findNearbyCompanies('LABORATORY', userLocation, 2)
      
      if (laboratories.length > 0) {
        recommendations.push({
          userId,
          type: 'ANALYSIS',
          title: 'Анализ на гликированный гемоглобин (HbA1c)',
          description: 'Этот анализ покажет средний уровень глюкозы в крови за последние 2-3 месяца.',
          reason: 'Повышенная глюкоза',
          priority: 4,
          companyId: laboratories[0].id,
          metadata: {
            testType: 'hba1c',
            distance: (laboratories[0] as any).distance,
            aiExplanation: 'HbA1c отражает среднюю гликемию за 2–3 месяца и помогает подтвердить нарушение углеводного обмена.'
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

      // Рекомендуем препараты железа
      const pharmacies = await findNearbyCompanies('PHARMACY', userLocation, 2)
      
      if (pharmacies.length > 0) {
        recommendations.push({
          userId,
          type: 'SUPPLEMENT',
          title: 'Препараты железа для коррекции анемии',
          description: 'Рекомендуется прием препаратов железа. Важно: принимайте на голодный желудок и избегайте одновременного приема с кальцием и чаем.',
          reason: `Низкий уровень ${hbIndicator?.name} (${hbIndicator?.value} ${hbIndicator?.unit})`,
          priority: 4,
          companyId: pharmacies[0].id,
          metadata: {
            supplementType: 'iron',
            currentValue: hbIndicator?.value,
            distance: (pharmacies[0] as any).distance,
            aiExplanation: 'Пероральные препараты железа — стандарт первой линии при железодефицитной анемии.'
          }
        })
      }

      // Рекомендуем консультацию терапевта
      const clinics = await findNearbyCompanies('CLINIC', userLocation, 2)
      
      if (clinics.length > 0) {
        recommendations.push({
          userId,
          type: 'SERVICE',
          title: 'Консультация терапевта',
          description: 'Необходима консультация врача для выяснения причины анемии и назначения адекватного лечения.',
          reason: 'Низкий гемоглобин',
          priority: 5,
          companyId: clinics[0].id,
          metadata: {
            specialization: 'therapy',
            distance: (clinics[0] as any).distance,
            aiExplanation: 'Врач оценит возможные причины анемии (дефицит железа, кровопотери и т.д.) и подберёт тактику.'
          }
        })
      }
    }

    // Fallback: если есть анализы со статусом abnormal, но не удалось разобрать показатели — создаем базовые рекомендации
    if (recommendations.length === 0) {
      const abnormalAnalyses = (recentAnalyses || []).filter(a => (a as any)?.status === 'abnormal')
      
      logger.info(`No specific health issues found, checking abnormal analyses: ${abnormalAnalyses.length}`, 'recommendations')
      
      if (abnormalAnalyses.length > 0) {
        const [labs, clinics] = await Promise.all([
          findNearbyCompanies('LABORATORY', userLocation, 2),
          findNearbyCompanies('CLINIC', userLocation, 1)
        ])

        logger.info(`Found companies: labs=${labs.length}, clinics=${clinics.length}`, 'recommendations')

        for (const a of abnormalAnalyses.slice(0, 2)) {
          if (labs.length > 0) {
            recommendations.push({
              userId,
              type: 'ANALYSIS',
              title: `Контрольный анализ: ${a.title || a.type}`,
              description: 'Рекомендуем пересдать анализ для подтверждения отклонений и мониторинга динамики.',
              reason: 'Обнаружены отклонения в результатах анализа',
              priority: 4,
              companyId: labs[0].id,
              metadata: { analysisId: (a as any).id, distance: (labs[0] as any).distance, aiExplanation: 'Выявлены отклонения в анализе, рекомендуется контроль в ближайшей лаборатории.' }
            })
          }

          if (clinics.length > 0) {
            recommendations.push({
              userId,
              type: 'SERVICE',
              title: 'Консультация врача по результатам анализа',
              description: 'Запишитесь к врачу для интерпретации отклонений и подбора тактики коррекции.',
              reason: 'Обнаружены отклонения в анализе',
              priority: 3,
              companyId: clinics[0].id,
              metadata: { analysisId: (a as any).id, distance: (clinics[0] as any).distance, aiExplanation: 'Очная консультация нужна для выбора дальнейших шагов и исключения серьёзной патологии.' }
            })
          }
        }
      } else if (recentAnalyses.length > 0 || documents.length > 0) {
        // Если есть анализы или документы, но нет отклонений - создаем общие рекомендации
        logger.info(`Creating general recommendations for user with analyses/documents`, 'recommendations')
        
        const [labs, clinics] = await Promise.all([
          findNearbyCompanies('LABORATORY', userLocation, 1),
          findNearbyCompanies('CLINIC', userLocation, 1)
        ])

        if (labs.length > 0) {
          recommendations.push({
            userId,
            type: 'ANALYSIS',
            title: 'Плановый профилактический осмотр',
            description: 'Рекомендуем регулярно проходить профилактические обследования для поддержания здоровья.',
            reason: 'Профилактика и раннее выявление заболеваний',
            priority: 2,
            companyId: labs[0].id,
            metadata: { 
              distance: (labs[0] as any).distance, 
              aiExplanation: 'Регулярные профилактические обследования помогают выявить проблемы на ранней стадии.' 
            }
          })
        }

        if (clinics.length > 0) {
          recommendations.push({
            userId,
            type: 'SERVICE',
            title: 'Консультация врача для профилактики',
            description: 'Регулярные консультации с врачом помогают поддерживать здоровье и своевременно выявлять проблемы.',
            reason: 'Профилактика и поддержание здоровья',
            priority: 2,
            companyId: clinics[0].id,
            metadata: { 
              distance: (clinics[0] as any).distance, 
              aiExplanation: 'Профилактические визиты к врачу важны для поддержания здоровья.' 
            }
          })
        }
      }
    }

    // Создаем рекомендации в базе данных
    const createdRecommendations = []
    for (const rec of recommendations) {
      try {
        // Idempotency: skip if a similar recommendation already exists
        const existing = await prisma.recommendation.findFirst({
          where: {
            userId,
            type: rec.type,
            title: rec.title,
            companyId: rec.companyId || undefined,
            status: { in: ['ACTIVE', 'VIEWED', 'CLICKED'] }
          }
        })
        if (existing) {
          continue
        }

        const created = await prisma.recommendation.create({
          data: rec,
          include: {
            company: true,
            product: true
          }
        })
        createdRecommendations.push(created)
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
