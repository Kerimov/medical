/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
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
      role: 'ADMIN'
    }
  })

  console.log('[SEED] Admin created:', adminEmail)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


