// Проверка результатов импорта
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkResults() {
  try {
    const counts = {
      users: await prisma.user.count(),
      documents: await prisma.document.count(),
      analyses: await prisma.analysis.count(),
      companies: await prisma.company.count(),
      recommendations: await prisma.recommendation.count(),
      doctorProfiles: await prisma.doctorProfile.count(),
      reminders: await prisma.reminder.count(),
      recommendationInteractions: await prisma.recommendationInteraction.count()
    }
    
    console.log('\n📊 Текущее состояние БД после импорта:')
    Object.entries(counts).forEach(([k, v]) => {
      console.log(`   ${k}: ${v}`)
    })
    
    // Показываем пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log('\n👥 Пользователи:')
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - ${u.role}`)
    })
    
  } catch(e) {
    console.error('❌ Ошибка:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkResults()

