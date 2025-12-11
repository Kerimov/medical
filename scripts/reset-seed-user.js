const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetSeedUser() {
  try {
    const email = 'seed@example.com'
    
    // Удаляем существующего пользователя
    await prisma.user.deleteMany({ where: { email } })
    console.log('✅ Старый пользователь удален')
    
    // Создаем нового с правильным паролем
    const password = await bcrypt.hash('seed1234', 10)
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name: 'Seed User',
        role: 'PATIENT'
      }
    })
    
    console.log('\n✅ Пользователь создан:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Пароль: seed1234`)
    console.log(`   Роль: ${user.role}`)
    console.log(`   ID: ${user.id}`)
    console.log('\n💡 Теперь можно войти с этими данными!')
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

resetSeedUser()

