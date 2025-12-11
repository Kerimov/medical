// Список пользователей для входа
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true
      },
      orderBy: {
        email: 'asc'
      }
    })
    
    console.log('\n👥 Пользователи для входа:')
    console.log('   (пароли нужно узнать из прода или сбросить)')
    console.log('')
    users.forEach(u => {
      console.log(`   📧 ${u.email}`)
      console.log(`      Имя: ${u.name}`)
      console.log(`      Роль: ${u.role}`)
      console.log('')
    })
    
    console.log('💡 Для сброса пароля используй:')
    console.log('   node scripts/reset-seed-user.js')
    console.log('   (нужно будет адаптировать для других пользователей)')
    
  } catch(e) {
    console.error('❌ Ошибка:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()

