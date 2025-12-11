// Скрипт для проверки данных в таблице Analysis
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAnalyses() {
  try {
    console.log('🔍 Проверка данных в таблице Analysis...\n')

    // Подсчет всех анализов
    const totalAnalyses = await prisma.analysis.count()
    console.log(`📊 Всего анализов в базе: ${totalAnalyses}`)

    if (totalAnalyses === 0) {
      console.log('\n⚠️  Таблица Analysis пуста!')
      console.log('\nПроверяю документы...')
      
      const totalDocuments = await prisma.document.count()
      const parsedDocuments = await prisma.document.count({
        where: { parsed: true }
      })
      
      console.log(`📄 Всего документов: ${totalDocuments}`)
      console.log(`✅ Распознанных документов: ${parsedDocuments}`)
      
      if (parsedDocuments > 0) {
        console.log('\n⚠️  Есть распознанные документы, но анализы не созданы!')
        console.log('Проверяю документы с показателями...')
        
        const docsWithIndicators = await prisma.document.findMany({
          where: {
            parsed: true,
            indicators: { not: null }
          },
          select: {
            id: true,
            fileName: true,
            uploadDate: true,
            indicators: true,
            studyType: true
          },
          take: 5
        })
        
        console.log(`\n📋 Документы с показателями (первые 5):`)
        docsWithIndicators.forEach((doc, i) => {
          const indicators = Array.isArray(doc.indicators) ? doc.indicators : []
          const abnormal = indicators.filter((ind) => ind && ind.isNormal === false).length
          console.log(`  ${i + 1}. ${doc.fileName}`)
          console.log(`     Тип: ${doc.studyType || 'не указан'}`)
          console.log(`     Показателей: ${indicators.length}, отклонений: ${abnormal}`)
          console.log(`     Дата загрузки: ${doc.uploadDate}`)
        })
      }
      
      return
    }

    // Группировка по статусам
    const byStatus = await prisma.analysis.groupBy({
      by: ['status'],
      _count: true
    })
    console.log('\n📈 Анализы по статусам:')
    byStatus.forEach(item => {
      console.log(`  ${item.status || 'null'}: ${item._count}`)
    })

    // Анализы с отклонениями
    const abnormalAnalyses = await prisma.analysis.findMany({
      where: { status: 'abnormal' },
      select: {
        id: true,
        title: true,
        type: true,
        date: true,
        status: true,
        documentId: true,
        createdAt: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n⚠️  Анализы с отклонениями (последние 10): ${abnormalAnalyses.length}`)
    abnormalAnalyses.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.title}`)
      console.log(`     Тип: ${a.type}, Статус: ${a.status}`)
      console.log(`     Дата: ${new Date(a.date).toISOString().split('T')[0]}`)
      console.log(`     Связан с документом: ${a.documentId ? 'Да' : 'Нет'}`)
    })

    // Проверка связи с документами
    const analysesWithDocs = await prisma.analysis.count({
      where: { documentId: { not: null } }
    })
    console.log(`\n🔗 Анализов, связанных с документами: ${analysesWithDocs}`)

    // Последние анализы
    const recentAnalyses = await prisma.analysis.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        date: true,
        status: true,
        documentId: true,
        createdAt: true,
        userId: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n🕐 Последние 5 анализов:`)
    recentAnalyses.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.title}`)
      console.log(`     Тип: ${a.type}, Статус: ${a.status}`)
      console.log(`     Дата создания: ${a.createdAt.toISOString()}`)
      console.log(`     Связан с документом: ${a.documentId ? 'Да' : 'Нет'}`)
    })

    // Проверка пользователей с анализами
    const usersWithAnalyses = await prisma.analysis.groupBy({
      by: ['userId'],
      _count: true
    })
    console.log(`\n👥 Пользователей с анализами: ${usersWithAnalyses.length}`)
    usersWithAnalyses.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i + 1}. User ID: ${item.userId}, анализов: ${item._count}`)
    })

  } catch (error) {
    console.error('❌ Ошибка при проверке:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAnalyses()

