/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
<<<<<<< HEAD
  console.log('[SEED] Clearing database and creating single ADMIN...')

  // Удаляем в правильном порядке из-за внешних ключей
  await prisma.reminderDelivery.deleteMany()
  await prisma.reminder.deleteMany()
  await prisma.recommendationInteraction.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.company.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.medicalNote.deleteMany()
  await prisma.patientRecord.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.analysis.deleteMany()
  await prisma.document.deleteMany()
  await prisma.reminderPreference.deleteMany()
  await prisma.doctorProfile.deleteMany()
  await prisma.user.deleteMany()

  // Создаём единственного администратора
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')[0]?.trim() || 'admin@medical.com'
  const passwordHash = await bcrypt.hash('admin1234', 10)
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: passwordHash,
      name: 'Admin User',
=======
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
>>>>>>> df8d2bc99d7d7b1249c0521dc29a53087e3b1bfb
      role: 'ADMIN'
    }
  })

<<<<<<< HEAD
  console.log('[SEED] Admin created:', adminEmail)
=======
  console.log('✅ Администратор создан:')
  console.log('   📧 Email: admin@medical.com')
  console.log('   🔑 Пароль: admin123')
  console.log(`   🆔 ID: ${admin.id}`)
  console.log('')
  console.log('✨ База данных готова к использованию!')
>>>>>>> df8d2bc99d7d7b1249c0521dc29a53087e3b1bfb
}

main()
  .catch((e) => {
<<<<<<< HEAD
    console.error(e)
=======
    console.error('❌ Ошибка:', e)
>>>>>>> df8d2bc99d7d7b1249c0521dc29a53087e3b1bfb
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


