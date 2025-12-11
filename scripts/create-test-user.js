// Создание тестового пользователя для локальной разработки
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const email = 'test@medical.com'
    const password = 'test123'
    
    // Удаляем существующего пользователя если есть
    await prisma.user.deleteMany({ where: { email } })
    
    // Создаем нового
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Тестовый пользователь',
        role: 'PATIENT'
      }
    })
    
    console.log('\n✅ Тестовый пользователь создан:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Пароль: ${password}`)
    console.log(`   Роль: ${user.role}`)
    console.log(`   ID: ${user.id}`)
    console.log('\n💡 Теперь можно войти с этими данными!')
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()

