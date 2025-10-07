/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Очистка базы данных...')

  // Удаляем все данные в правильном порядке (учитываем связи)
  await prisma.recommendationInteraction.deleteMany({})
  await prisma.recommendation.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.company.deleteMany({})
  await prisma.reminderDelivery.deleteMany({})
  await prisma.reminder.deleteMany({})
  await prisma.reminderPreference.deleteMany({})
  await prisma.analysis.deleteMany({})
  await prisma.document.deleteMany({})
  await prisma.appointment.deleteMany({})
  await prisma.prescription.deleteMany({})
  await prisma.medicalNote.deleteMany({})
  await prisma.patientRecord.deleteMany({})
  await prisma.doctorProfile.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('✅ База данных очищена')

  // Создаем одного администратора
  console.log('👤 Создание администратора...')
  
  const password = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@medical.com',
      password,
      name: 'Администратор',
      role: 'ADMIN'
    }
  })

  console.log('✅ Администратор создан:')
  console.log('   📧 Email: admin@medical.com')
  console.log('   🔑 Пароль: admin123')
  console.log(`   🆔 ID: ${admin.id}`)
  console.log('')
  console.log('✨ База данных готова к использованию!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


