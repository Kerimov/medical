/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('[CLEAR] Removing analyses, documents, and related reminders...')

  // Удаляем связанные сущности корректно по зависимостям
  await prisma.reminderDelivery.deleteMany({})
  await prisma.reminder.deleteMany({})
  await prisma.recommendationInteraction.deleteMany({})
  await prisma.recommendation.deleteMany({})
  await prisma.analysis.deleteMany({})
  await prisma.document.deleteMany({})

  console.log('[CLEAR] Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


