import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

interface AnalysisIndicator {
  name: string
  value: number
  unit: string
  referenceMin: number
  referenceMax: number
  isNormal: boolean
}

interface AnalysisData {
  indicators: AnalysisIndicator[]
  findings?: any
}

interface RecommendationRule {
  condition: (indicators: AnalysisIndicator[], analysis: any) => boolean
  generateRecommendations: (indicators: AnalysisIndicator[], analysis: any) => Promise<any[]>
  priority: number
}

// Правила для генерации рекомендаций
const recommendationRules: RecommendationRule[] = [
  // Дефицит витамина D
  {
    condition: (indicators, analysis) => {
      const vitD = indicators.find(ind => 
        ind.name.toLowerCase().includes('витамин d') || 
        ind.name.toLowerCase().includes('25-oh') ||
        ind.name.toLowerCase().includes('кальцидиол')
      )
      return vitD && vitD.isNormal === false && vitD.value < vitD.referenceMin
    },
    generateRecommendations: async (indicators, analysis) => {
      const vitD = indicators.find(ind => 
        ind.name.toLowerCase().includes('витамин d') || 
        ind.name.toLowerCase().includes('25-oh') ||
        ind.name.toLowerCase().includes('кальцидиол')
      )
      
      const recommendations = []
      
      // Рекомендация лаборатории для повторного анализа
      const laboratories = await prisma.company.findMany({
        where: {
          type: 'LABORATORY',
          isActive: true
        },
        take: 3
      })
      
      if (laboratories.length > 0) {
        recommendations.push({
          type: 'ANALYSIS',
          title: 'Повторный анализ на витамин D',
          description: `Рекомендуется повторный анализ на витамин D через 2-3 месяца. Текущий уровень: ${vitD?.value} ${vitD?.unit} (норма: ${vitD?.referenceMin}-${vitD?.referenceMax} ${vitD?.unit})`,
          reason: `Низкий уровень витамина D (${vitD?.value} ${vitD?.unit})`,
          priority: 4,
          companyId: laboratories[0].id,
          metadata: {
            testType: 'vitamin_d',
            currentValue: vitD?.value,
            normalRange: `${vitD?.referenceMin}-${vitD?.referenceMax}`,
            unit: vitD?.unit
          }
        })
      }
      
      // Рекомендация добавок
      const healthStores = await prisma.company.findMany({
        where: {
          type: 'HEALTH_STORE',
          isActive: true
        },
        take: 2
      })
      
      if (healthStores.length > 0) {
        recommendations.push({
          type: 'SUPPLEMENT',
          title: 'Витамин D3 - биодобавка',
          description: 'Рекомендуется прием витамина D3 в дозировке 1000-2000 МЕ в день для коррекции дефицита',
          reason: `Дефицит витамина D (${vitD?.value} ${vitD?.unit})`,
          priority: 5,
          companyId: healthStores[0].id,
          metadata: {
            supplementType: 'vitamin_d3',
            dosage: '1000-2000 МЕ',
            duration: '2-3 месяца'
          }
        })
      }
      
      return recommendations
    },
    priority: 5
  },

  // Низкий гемоглобин
  {
    condition: (indicators, analysis) => {
      const hemoglobin = indicators.find(ind => 
        ind.name.toLowerCase().includes('гемоглобин') || 
        ind.name.toLowerCase().includes('hb')
      )
      return hemoglobin && hemoglobin.isNormal === false && hemoglobin.value < hemoglobin.referenceMin
    },
    generateRecommendations: async (indicators, analysis) => {
      const hemoglobin = indicators.find(ind => 
        ind.name.toLowerCase().includes('гемоглобин') || 
        ind.name.toLowerCase().includes('hb')
      )
      
      const recommendations = []
      
      // Рекомендация консультации врача
      const clinics = await prisma.company.findMany({
        where: {
          type: 'CLINIC',
          isActive: true
        },
        take: 2
      })
      
      if (clinics.length > 0) {
        recommendations.push({
          type: 'SERVICE',
          title: 'Консультация гематолога',
          description: `Низкий уровень гемоглобина (${hemoglobin?.value} ${hemoglobin?.unit}) требует консультации специалиста для выявления причины анемии`,
          reason: `Низкий гемоглобин (${hemoglobin?.value} ${hemoglobin?.unit})`,
          priority: 5,
          companyId: clinics[0].id,
          metadata: {
            specialty: 'гематолог',
            currentValue: hemoglobin?.value,
            normalRange: `${hemoglobin?.referenceMin}-${hemoglobin?.referenceMax}`,
            unit: hemoglobin?.unit
          }
        })
      }
      
      // Рекомендация препаратов железа
      const pharmacies = await prisma.company.findMany({
        where: {
          type: 'PHARMACY',
          isActive: true
        },
        take: 2
      })
      
      if (pharmacies.length > 0) {
        recommendations.push({
          type: 'SUPPLEMENT',
          title: 'Препараты железа',
          description: 'Рекомендуется прием препаратов железа для коррекции анемии. Проконсультируйтесь с врачом о дозировке',
          reason: `Низкий гемоглобин (${hemoglobin?.value} ${hemoglobin?.unit})`,
          priority: 4,
          companyId: pharmacies[0].id,
          metadata: {
            supplementType: 'iron',
            note: 'Требуется консультация врача'
          }
        })
      }
      
      return recommendations
    },
    priority: 5
  },

  // Повышенный холестерин
  {
    condition: (indicators, analysis) => {
      const cholesterol = indicators.find(ind => 
        ind.name.toLowerCase().includes('холестерин') || 
        ind.name.toLowerCase().includes('cholesterol')
      )
      return cholesterol && cholesterol.isNormal === false && cholesterol.value > cholesterol.referenceMax
    },
    generateRecommendations: async (indicators, analysis) => {
      const cholesterol = indicators.find(ind => 
        ind.name.toLowerCase().includes('холестерин') || 
        ind.name.toLowerCase().includes('cholesterol')
      )
      
      const recommendations = []
      
      // Рекомендация консультации кардиолога
      const clinics = await prisma.company.findMany({
        where: {
          type: 'CLINIC',
          isActive: true
        },
        take: 2
      })
      
      if (clinics.length > 0) {
        recommendations.push({
          type: 'SERVICE',
          title: 'Консультация кардиолога',
          description: `Повышенный уровень холестерина (${cholesterol?.value} ${cholesterol?.unit}) требует консультации кардиолога для оценки сердечно-сосудистого риска`,
          reason: `Повышенный холестерин (${cholesterol?.value} ${cholesterol?.unit})`,
          priority: 4,
          companyId: clinics[0].id,
          metadata: {
            specialty: 'кардиолог',
            currentValue: cholesterol?.value,
            normalRange: `${cholesterol?.referenceMin}-${cholesterol?.referenceMax}`,
            unit: cholesterol?.unit
          }
        })
      }
      
      // Рекомендация диетолога
      const nutritionists = await prisma.company.findMany({
        where: {
          type: 'NUTRITIONIST',
          isActive: true
        },
        take: 2
      })
      
      if (nutritionists.length > 0) {
        recommendations.push({
          type: 'SERVICE',
          title: 'Консультация диетолога',
          description: 'Рекомендуется консультация диетолога для составления плана питания, направленного на снижение холестерина',
          reason: `Повышенный холестерин (${cholesterol?.value} ${cholesterol?.unit})`,
          priority: 3,
          companyId: nutritionists[0].id,
          metadata: {
            specialty: 'диетолог',
            goal: 'снижение холестерина'
          }
        })
      }
      
      return recommendations
    },
    priority: 4
  },

  // Общие рекомендации для множественных отклонений
  {
    condition: (indicators, analysis) => {
      const abnormalCount = indicators.filter(ind => ind.isNormal === false).length
      return abnormalCount >= 3
    },
    generateRecommendations: async (indicators, analysis) => {
      const abnormalIndicators = indicators.filter(ind => ind.isNormal === false)
      
      const recommendations = []
      
      // Рекомендация комплексного обследования
      const clinics = await prisma.company.findMany({
        where: {
          type: 'CLINIC',
          isActive: true
        },
        take: 2
      })
      
      if (clinics.length > 0) {
        recommendations.push({
          type: 'SERVICE',
          title: 'Комплексное медицинское обследование',
          description: `Обнаружено ${abnormalIndicators.length} отклонений в анализах. Рекомендуется комплексное обследование для выявления причин`,
          reason: `Множественные отклонения (${abnormalIndicators.length} показателей)`,
          priority: 5,
          companyId: clinics[0].id,
          metadata: {
            abnormalCount: abnormalIndicators.length,
            abnormalIndicators: abnormalIndicators.map(ind => ind.name)
          }
        })
      }
      
      return recommendations
    },
    priority: 5
  }
]

// Основная функция для генерации рекомендаций
export async function generateRecommendationsForUser(userId: string): Promise<any[]> {
  try {
    // Получаем последние анализы пользователя
    const analyses = await prisma.analysis.findMany({
      where: {
        userId,
        status: 'abnormal' // Только анализы с отклонениями
      },
      orderBy: { createdAt: 'desc' },
      take: 5 // Последние 5 анализов
    })

    if (analyses.length === 0) {
      return []
    }

    const allRecommendations = []

    for (const analysis of analyses) {
      try {
        // Парсим результаты анализа
        let analysisData: AnalysisData
        if (typeof analysis.results === 'string') {
          analysisData = JSON.parse(analysis.results)
        } else {
          analysisData = analysis.results as AnalysisData
        }

        if (!analysisData.indicators || !Array.isArray(analysisData.indicators)) {
          continue
        }

        // Применяем правила рекомендаций
        for (const rule of recommendationRules) {
          if (rule.condition(analysisData.indicators, analysis)) {
            try {
              const recommendations = await rule.generateRecommendations(analysisData.indicators, analysis)
              
              // Добавляем связь с анализом
              const recommendationsWithAnalysis = recommendations.map(rec => ({
                ...rec,
                analysisId: analysis.id,
                userId
              }))
              
              allRecommendations.push(...recommendationsWithAnalysis)
            } catch (error) {
              logger.error('Error generating recommendations for rule:', error)
            }
          }
        }
      } catch (error) {
        logger.error('Error processing analysis for recommendations:', error)
      }
    }

    // Удаляем дубликаты и сортируем по приоритету
    const uniqueRecommendations = allRecommendations.filter((rec, index, self) => 
      index === self.findIndex(r => 
        r.type === rec.type && 
        r.title === rec.title && 
        r.companyId === rec.companyId
      )
    )

    return uniqueRecommendations.sort((a, b) => b.priority - a.priority)
  } catch (error) {
    logger.error('Error generating recommendations for user:', error)
    return []
  }
}

// Функция для создания рекомендаций в базе данных
export async function createRecommendationsForUser(userId: string): Promise<any[]> {
  try {
    const recommendations = await generateRecommendationsForUser(userId)
    
    if (recommendations.length === 0) {
      return []
    }

    const createdRecommendations = []

    for (const rec of recommendations) {
      try {
        // Проверяем, не существует ли уже такая рекомендация
        const existing = await prisma.recommendation.findFirst({
          where: {
            userId,
            type: rec.type,
            title: rec.title,
            companyId: rec.companyId,
            status: { in: ['ACTIVE', 'VIEWED'] }
          }
        })

        if (!existing) {
          const created = await prisma.recommendation.create({
            data: {
              userId: rec.userId,
              type: rec.type,
              title: rec.title,
              description: rec.description,
              reason: rec.reason,
              priority: rec.priority,
              companyId: rec.companyId,
              productId: rec.productId,
              analysisId: rec.analysisId,
              metadata: rec.metadata ? JSON.stringify(rec.metadata) : null,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
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
        }
      } catch (error) {
        logger.error('Error creating recommendation:', error)
      }
    }

    return createdRecommendations
  } catch (error) {
    logger.error('Error creating recommendations for user:', error)
    return []
  }
}
