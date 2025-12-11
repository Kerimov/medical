// Загружаем переменные окружения из .env.production (приоритет) или из аргументов командной строки
const fs = require('fs')
const path = require('path')

// Проверяем наличие .env.production
const envProductionPath = path.join(process.cwd(), '.env.production')
if (fs.existsSync(envProductionPath)) {
  require('dotenv').config({ path: envProductionPath, override: false })
  console.log('📁 Загружен .env.production')
} else {
  console.log('⚠️  Файл .env.production не найден')
}

// Проверяем аргументы командной строки для DATABASE_URL
// Формат: DATABASE_URL=postgresql://... node script.js
const args = process.argv.slice(2)
let databaseUrl = process.env.DATABASE_URL

// Ищем DATABASE_URL в аргументах
for (const arg of args) {
  if (arg.startsWith('DATABASE_URL=')) {
    databaseUrl = arg.split('=').slice(1).join('=')
    break
  }
}

// Если DATABASE_URL не найден, просим указать
if (!databaseUrl) {
  console.error('\n❌ Ошибка: DATABASE_URL не найден!')
  console.error('\n📝 Варианты решения:')
  console.error('   1. Добавьте DATABASE_URL в файл .env.production:')
  console.error('      DATABASE_URL=postgresql://user:password@host:port/database')
  console.error('   2. Установите переменную окружения перед запуском:')
  console.error('      $env:DATABASE_URL="postgresql://..." ; node scripts/clear-production-data.js (PowerShell)')
  console.error('      set DATABASE_URL=postgresql://... && node scripts/clear-production-data.js (CMD)')
  console.error('      export DATABASE_URL=postgresql://... && node scripts/clear-production-data.js (Linux/Mac)')
  console.error('   3. Передайте через аргумент:')
  console.error('      node scripts/clear-production-data.js DATABASE_URL=postgresql://...')
  process.exit(1)
}

// Проверяем, что это PostgreSQL URL
if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  console.error('\n❌ Ошибка: DATABASE_URL должен начинаться с postgresql:// или postgres://')
  console.error('   Текущий URL:', databaseUrl.substring(0, 30) + '...')
  process.exit(1)
}

const { PrismaClient } = require('@prisma/client')

// Создаем Prisma Client с явным указанием DATABASE_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

async function main() {
  console.log('🧹 Начинаем очистку документов и анализов на ПРОДАКШЕНЕ...\n')
  console.log('⚠️  ВНИМАНИЕ: Это удалит все документы и анализы!')
  console.log('📊 Подключение к базе данных: ✅ Настроено')
  console.log('📊 URL базы данных:', databaseUrl.substring(0, 20) + '...\n')

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

    // 3. Удаляем доставки напоминаний, связанных с анализами или документами
    console.log('\n3️⃣ Удаление доставок напоминаний...')
    const remindersWithAnalyses = await prisma.reminder.findMany({
      where: { 
        OR: [
          { analysisId: { not: null } },
          { documentId: { not: null } }
        ]
      },
      select: { id: true }
    })
    
    if (remindersWithAnalyses.length > 0) {
      const reminderIds = remindersWithAnalyses.map(r => r.id)
      const deletedDeliveries = await prisma.reminderDelivery.deleteMany({
        where: { reminderId: { in: reminderIds } }
      })
      console.log(`   ✅ Удалено доставок: ${deletedDeliveries.count}`)
    } else {
      console.log('   ℹ️  Нет напоминаний с анализами/документами')
    }

    // 4. Удаляем напоминания, связанные с анализами или документами
    console.log('\n4️⃣ Удаление напоминаний, связанных с анализами/документами...')
    const deletedReminders = await prisma.reminder.deleteMany({
      where: { 
        OR: [
          { analysisId: { not: null } },
          { documentId: { not: null } }
        ]
      }
    })
    console.log(`   ✅ Удалено напоминаний: ${deletedReminders.count}`)

    // 5. Удаляем все анализы
    console.log('\n5️⃣ Удаление всех анализов...')
    const deletedAnalyses = await prisma.analysis.deleteMany({})
    console.log(`   ✅ Удалено анализов: ${deletedAnalyses.count}`)

    // 6. Удаляем все документы
    console.log('\n6️⃣ Удаление всех документов...')
    const deletedDocuments = await prisma.document.deleteMany({})
    console.log(`   ✅ Удалено документов: ${deletedDocuments.count}`)

    console.log('\n✨ Очистка на продакшене завершена успешно!')
    console.log('\n📊 Итоги:')
    console.log(`   • Удалено документов: ${deletedDocuments.count}`)
    console.log(`   • Удалено анализов: ${deletedAnalyses.count}`)
    console.log(`   • Удалено рекомендаций: ${deletedRecommendations.count}`)
    console.log(`   • Удалено напоминаний: ${deletedReminders.count}`)
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

