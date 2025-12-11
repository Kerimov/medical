require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Начинаем очистку всех анализов и связанных данных...\n')

  try {
    // 1. Удаляем взаимодействия с рекомендациями, связанными с анализами
    console.log('1️⃣ Удаление взаимодействий с рекомендациями...')
    const recommendationsWithAnalyses = await prisma.recommendation.findMany({
      where: { analysisId: { not: null } },
      select: { id: true }
    })
    
    if (recommendationsWithAnalyses.length > 0) {
      const recommendationIds = recommendationsWithAnalyses.map(r => r.id)
      const deletedInteractions = await prisma.recommendationInteraction.deleteMany({
        where: { recommendationId: { in: recommendationIds } }
      })
      console.log(`   ✅ Удалено взаимодействий: ${deletedInteractions.count}`)
    } else {
      console.log('   ℹ️  Нет рекомендаций с анализами')
    }

    // 2. Удаляем рекомендации, связанные с анализами
    console.log('\n2️⃣ Удаление рекомендаций, связанных с анализами...')
    const deletedRecommendations = await prisma.recommendation.deleteMany({
      where: { analysisId: { not: null } }
    })
    console.log(`   ✅ Удалено рекомендаций: ${deletedRecommendations.count}`)

    // 3. Удаляем доставки напоминаний, связанных с анализами
    console.log('\n3️⃣ Удаление доставок напоминаний...')
    const remindersWithAnalyses = await prisma.reminder.findMany({
      where: { analysisId: { not: null } },
      select: { id: true }
    })
    
    if (remindersWithAnalyses.length > 0) {
      const reminderIds = remindersWithAnalyses.map(r => r.id)
      const deletedDeliveries = await prisma.reminderDelivery.deleteMany({
        where: { reminderId: { in: reminderIds } }
      })
      console.log(`   ✅ Удалено доставок: ${deletedDeliveries.count}`)
    } else {
      console.log('   ℹ️  Нет напоминаний с анализами')
    }

    // 4. Удаляем напоминания, связанные с анализами
    console.log('\n4️⃣ Удаление напоминаний, связанных с анализами...')
    const deletedReminders = await prisma.reminder.deleteMany({
      where: { analysisId: { not: null } }
    })
    console.log(`   ✅ Удалено напоминаний: ${deletedReminders.count}`)

    // 5. Удаляем все анализы
    console.log('\n5️⃣ Удаление всех анализов...')
    const deletedAnalyses = await prisma.analysis.deleteMany({})
    console.log(`   ✅ Удалено анализов: ${deletedAnalyses.count}`)

    // 6. Очищаем связи в документах (documentId в анализах уже удален, но можно сбросить parsed)
    console.log('\n6️⃣ Сброс статуса обработки документов...')
    const resetDocuments = await prisma.document.updateMany({
      where: { parsed: true },
      data: { 
        parsed: false,
        studyDate: null,
        studyType: null,
        laboratory: null,
        doctor: null,
        findings: null,
        rawText: null,
        ocrConfidence: null,
        category: null,
        indicators: null
      }
    })
    console.log(`   ✅ Сброшено документов: ${resetDocuments.count}`)

    console.log('\n✨ Очистка завершена успешно!')
    console.log('\n📊 Итоги:')
    console.log(`   • Удалено анализов: ${deletedAnalyses.count}`)
    console.log(`   • Удалено рекомендаций: ${deletedRecommendations.count}`)
    console.log(`   • Удалено напоминаний: ${deletedReminders.count}`)
    console.log(`   • Сброшено документов: ${resetDocuments.count}`)
    console.log('\n💡 Теперь вы можете загрузить документы заново для создания новых анализов.')

  } catch (error) {
    console.error('❌ Ошибка при очистке:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

