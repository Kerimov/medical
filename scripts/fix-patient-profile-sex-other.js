// One-off maintenance: convert PatientProfile.sex='OTHER' to NULL
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$executeRawUnsafe(
    'UPDATE "PatientProfile" SET "sex" = NULL WHERE "sex" = \'OTHER\''
  )
  console.log('Updated rows:', result)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


