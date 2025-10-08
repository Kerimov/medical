import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { MedicalSourcesManager } from '@/lib/medical-sources';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const sourcesManager = new MedicalSourcesManager();

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации (только для админов)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { queries, sources } = body;

    if (!queries || !Array.isArray(queries)) {
      return NextResponse.json({ error: 'Queries array is required' }, { status: 400 });
    }

    console.log(`🔄 Starting knowledge sync for ${queries.length} queries`);

    const results = [];
    let totalUpdated = 0;

    for (const query of queries) {
      try {
        console.log(`🔍 Processing query: "${query}"`);
        
        // Поиск знаний в источниках
        const extractedKnowledge = await sourcesManager.searchKnowledge(query, sources);
        
        // Сохранение в базу данных
        const savedCount = await saveKnowledgeToDatabase(extractedKnowledge);
        totalUpdated += savedCount;
        
        results.push({
          query,
          found: extractedKnowledge.length,
          saved: savedCount,
          success: true
        });

        console.log(`✅ Query "${query}": found ${extractedKnowledge.length}, saved ${savedCount}`);
        
      } catch (error) {
        console.error(`❌ Error processing query "${query}":`, error);
        results.push({
          query,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }

    console.log(`🎉 Knowledge sync completed. Total updated: ${totalUpdated}`);

    return NextResponse.json({
      success: true,
      totalQueries: queries.length,
      totalUpdated,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in knowledge sync:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Функция сохранения знаний в базу данных
async function saveKnowledgeToDatabase(knowledgeArray: any[]): Promise<number> {
  let savedCount = 0;

  for (const knowledge of knowledgeArray) {
    try {
      // Сохранение типа исследования
      if (knowledge.studyType) {
        const studyType = await prisma.studyType.upsert({
          where: { 
            name: knowledge.studyType.name 
          },
          update: {
            ...knowledge.studyType,
            sources: knowledge.sources,
            lastUpdated: new Date(knowledge.sources.lastChecked)
          },
          create: {
            ...knowledge.studyType,
            sources: knowledge.sources,
            lastUpdated: new Date(knowledge.sources.lastChecked)
          }
        });

        // Сохранение показателей
        if (knowledge.indicators && knowledge.indicators.length > 0) {
          for (const indicatorData of knowledge.indicators) {
            const indicator = await prisma.indicator.upsert({
              where: {
                studyTypeId_name: {
                  studyTypeId: studyType.id,
                  name: indicatorData.name
                }
              },
              update: {
                ...indicatorData,
                sources: knowledge.sources,
                lastUpdated: new Date(knowledge.sources.lastChecked)
              },
              create: {
                ...indicatorData,
                studyTypeId: studyType.id,
                sources: knowledge.sources,
                lastUpdated: new Date(knowledge.sources.lastChecked)
              }
            });

            // Сохранение референсных диапазонов
            if (knowledge.referenceRanges && knowledge.referenceRanges.length > 0) {
              for (const rangeData of knowledge.referenceRanges) {
                // Найти или создать методологию
                const methodology = await prisma.methodology.upsert({
                  where: {
                    name: rangeData.methodology
                  },
                  update: {
                    name: rangeData.methodology,
                    type: 'OTHER',
                    sources: knowledge.sources,
                    lastUpdated: new Date(knowledge.sources.lastChecked)
                  },
                  create: {
                    name: rangeData.methodology,
                    type: 'OTHER',
                    sources: knowledge.sources,
                    lastUpdated: new Date(knowledge.sources.lastChecked)
                  }
                });

                // Создать референсный диапазон
                await prisma.referenceRange.upsert({
                  where: {
                    indicatorId_methodologyId_gender_ageGroupMin_ageGroupMax: {
                      indicatorId: indicator.id,
                      methodologyId: methodology.id,
                      gender: rangeData.gender || 'all',
                      ageGroupMin: rangeData.ageGroupMin || 0,
                      ageGroupMax: rangeData.ageGroupMax || 100
                    }
                  },
                  update: {
                    ...rangeData,
                    conditions: rangeData.note ? { note: rangeData.note } : null
                  },
                  create: {
                    indicatorId: indicator.id,
                    methodologyId: methodology.id,
                    ...rangeData,
                    conditions: rangeData.note ? { note: rangeData.note } : null
                  }
                });
              }
            }

            savedCount++;
          }
        }
      }
    } catch (error) {
      console.error('Error saving knowledge to database:', error);
    }
  }

  return savedCount;
}

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Получение статистики синхронизации
    const stats = await prisma.studyType.aggregate({
      _count: {
        id: true
      },
      _max: {
        lastUpdated: true
      }
    });

    const indicatorStats = await prisma.indicator.aggregate({
      _count: {
        id: true
      },
      _max: {
        lastUpdated: true
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        studyTypes: stats._count.id,
        indicators: indicatorStats._count.id,
        lastStudyTypeUpdate: stats._max.lastUpdated,
        lastIndicatorUpdate: indicatorStats._max.lastUpdated
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting sync stats:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
