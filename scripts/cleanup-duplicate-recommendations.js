/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanup(userEmail) {
  // Resolve user by email if provided
  let userId = null
  if (userEmail) {
    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) throw new Error(`User with email ${userEmail} not found`)
    userId = user.id
  }

  const where = userId ? { userId } : {}

  const recs = await prisma.recommendation.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
      companyId: true,
      status: true,
      createdAt: true,
    },
  })

  // Group by composite key and keep the newest record, delete others
  const seen = new Set()
  const toDelete = []
  for (const r of recs) {
    const key = `${r.userId}|${r.type}|${r.title}|${r.companyId || 'null'}`
    if (seen.has(key)) {
      toDelete.push(r.id)
    } else {
      seen.add(key)
    }
  }

  if (toDelete.length > 0) {
    await prisma.recommendationInteraction.deleteMany({
      where: { recommendationId: { in: toDelete } },
    })
    await prisma.recommendation.deleteMany({ where: { id: { in: toDelete } } })
  }

  return { deleted: toDelete.length }
}

;(async () => {
  try {
    const email = process.argv[2] || 'test@pma.ru'
    const result = await cleanup(email)
    console.log('Cleanup completed:', result)
  } catch (e) {
    console.error('Cleanup failed:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()


