const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const email = 'seed@example.com'
    const password = 'seed1234'
    
    console.log('\n🔐 Тестирование входа...\n')
    
    // Находим пользователя
    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      console.log('❌ Пользователь не найден!')
      return
    }
    
    console.log('✅ Пользователь найден:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Имя: ${user.name}`)
    console.log(`   Роль: ${user.role}`)
    console.log(`   Хеш пароля: ${user.password.substring(0, 20)}...`)
    
    // Проверяем пароль
    const isValid = await bcrypt.compare(password, user.password)
    
    console.log(`\n🔑 Проверка пароля "${password}":`)
    if (isValid) {
      console.log('   ✅ Пароль верный!')
    } else {
      console.log('   ❌ Пароль неверный!')
      console.log('\n💡 Нужно пересоздать пользователя:')
      console.log('   node scripts/reset-seed-user.js')
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()

