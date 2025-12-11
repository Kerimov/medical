const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const count = await prisma.user.count()
    console.log(`\n👥 Пользователей в базе: ${count}\n`)
    
    if (count === 0) {
      console.log('⚠️ Пользователей нет! Выполните: npm run db:seed\n')
    } else {
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          email: true,
          name: true,
          role: true
        }
      })
      console.log('📋 Пользователи:')
      users.forEach(u => {
        console.log(`   - ${u.email} (${u.name}) - ${u.role}`)
      })
    }
  } catch (error) {
    console.error('\n❌ Ошибка подключения к базе данных:')
    console.error(error.message)
    console.log('\n💡 Проверьте:')
    console.log('   1. PostgreSQL запущен')
    console.log('   2. DATABASE_URL правильный в .env.local')
    console.log('   3. База данных создана')
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()

