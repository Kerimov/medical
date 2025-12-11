// Скрипт для проверки подключения к PostgreSQL
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔌 Проверка подключения к базе данных...')
    console.log('')
    
    // Пробуем подключиться
    await prisma.$connect()
    console.log('✅ Подключение успешно!')
    console.log('')
    
    // Проверяем версию PostgreSQL
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📊 Версия PostgreSQL:')
    console.log(result[0]?.version || 'Не удалось получить версию')
    console.log('')
    
    // Проверяем текущую базу данных
    const dbName = await prisma.$queryRaw`SELECT current_database()`
    console.log('📁 Текущая база данных:', dbName[0]?.current_database || 'неизвестно')
    console.log('')
    
    // Проверяем таблицы
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    if (tables.length > 0) {
      console.log('📋 Найденные таблицы:')
      tables.forEach((t) => console.log(`  - ${t.table_name}`))
    } else {
      console.log('⚠️ Таблицы не найдены. Выполните: npx prisma db push')
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения:')
    console.error(error.message)
    console.log('')
    console.log('💡 Возможные причины:')
    console.log('  1. PostgreSQL не запущен')
    console.log('  2. Неправильный DATABASE_URL в .env.local')
    console.log('  3. База данных не создана')
    console.log('  4. Неправильные credentials')
    console.log('')
    console.log('🔧 Решения:')
    console.log('  - Запустите PostgreSQL: docker-compose up -d')
    console.log('  - Проверьте DATABASE_URL в .env.local')
    console.log('  - Создайте базу: npx prisma db push')
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

