/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const email = 'seed@example.com'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const password = await bcrypt.hash('seed1234', 10)
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name: 'Seed User'
      }
    })

    await prisma.document.create({
      data: {
        userId: user.id,
        fileName: 'example.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        fileUrl: 'data:application/pdf;base64,',
        parsed: false,
        category: 'other'
      }
    })

    console.log('Seed user and document created')
  } else {
    console.log('Seed user already exists')
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



