// Скрипт для экспорта данных из продакшен БД
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function main() {
  // Используем DATABASE_URL из переменных окружения
  // Для продакшена нужно указать DATABASE_URL_PROD в .env.local
  const prodUrl = process.env.DATABASE_URL_PROD || process.env.DATABASE_URL
  
  if (!prodUrl) {
    console.error('❌ DATABASE_URL не найден!')
    console.log('\n💡 Создай .env.local с:')
    console.log('   DATABASE_URL_PROD="postgresql://user:password@host:port/database"')
    process.exit(1)
  }
  
  console.log('📤 Экспорт данных из продакшен БД...\n')
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: prodUrl
      }
    }
  })
  
  try {
    const result = {}
    
    async function safeFetch(name, fn) {
      try {
        console.log(`📋 Экспорт ${name}...`)
        const data = await fn()
        result[name] = data
        console.log(`   ✅ ${data.length} записей`)
      } catch (e) {
        console.error(`   ❌ Ошибка: ${e.message}`)
        result[name] = { __error: String(e && e.message ? e.message : e) }
      }
    }
    
    // Экспортируем все таблицы в правильном порядке (с учетом зависимостей)
    await safeFetch('users', () => prisma.user.findMany())
    await safeFetch('doctorProfiles', () => prisma.doctorProfile.findMany())
    await safeFetch('patientRecords', () => prisma.patientRecord.findMany())
    await safeFetch('documents', () => prisma.document.findMany())
    await safeFetch('analyses', () => prisma.analysis.findMany())
    await safeFetch('indicators', () => prisma.indicator.findMany())
    await safeFetch('reminders', () => prisma.reminder.findMany())
    await safeFetch('reminderPreferences', () => prisma.reminderPreference.findMany())
    await safeFetch('reminderDeliveries', () => prisma.reminderDelivery.findMany())
    await safeFetch('recommendations', () => prisma.recommendation.findMany())
    await safeFetch('recommendationInteractions', () => prisma.recommendationInteraction.findMany())
    await safeFetch('appointments', () => prisma.appointment.findMany())
    await safeFetch('prescriptions', () => prisma.prescription.findMany())
    await safeFetch('medicalNotes', () => prisma.medicalNote.findMany())
    await safeFetch('companies', () => prisma.company.findMany())
    await safeFetch('products', () => prisma.product.findMany())
    await safeFetch('healthDiaryEntries', () => prisma.healthDiaryEntry.findMany())
    await safeFetch('diaryTags', () => prisma.diaryTag.findMany())
    await safeFetch('diaryTagOnEntries', () => prisma.diaryTagOnEntry.findMany())
    await safeFetch('studyTypes', () => prisma.studyType.findMany())
    await safeFetch('methodologies', () => prisma.methodology.findMany())
    await safeFetch('referenceRanges', () => prisma.referenceRange.findMany())
    
    const outDir = path.join(process.cwd(), 'export')
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const outFile = path.join(outDir, `production-data-${timestamp}.json`)
    
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8')
    
    console.log('\n✅ Экспорт завершен!')
    console.log(`📁 Файл: ${outFile}`)
    console.log('\n📊 Статистика:')
    Object.entries(result).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`   ${key}: ${value.length} записей`)
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('❌ Ошибка экспорта:', e)
  process.exit(1)
})

