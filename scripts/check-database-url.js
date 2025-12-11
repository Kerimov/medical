// Скрипт для проверки DATABASE_URL
require('dotenv').config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.log('❌ DATABASE_URL не найден в .env.local')
  process.exit(1)
}

console.log('📋 Текущий DATABASE_URL:')
console.log(databaseUrl)
console.log('')

// Определяем тип базы данных
if (databaseUrl.startsWith('file:')) {
  console.log('✅ Тип БД: SQLite')
  console.log('📁 Путь к файлу:', databaseUrl.replace('file:', ''))
} else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  console.log('✅ Тип БД: PostgreSQL')
  
  // Парсим URL
  try {
    const url = new URL(databaseUrl)
    console.log('🔐 Пользователь:', url.username || 'не указан')
    console.log('🌐 Хост:', url.hostname || 'не указан')
    console.log('🔌 Порт:', url.port || '5432 (по умолчанию)')
    console.log('📊 База данных:', url.pathname.replace('/', '') || 'не указана')
  } catch (e) {
    console.log('⚠️ Не удалось распарсить URL')
  }
} else {
  console.log('⚠️ Неизвестный тип БД')
}

console.log('')
console.log('💡 Примеры DATABASE_URL:')
console.log('')
console.log('SQLite:')
console.log('  DATABASE_URL="file:./prisma/dev.db"')
console.log('')
console.log('PostgreSQL (локально):')
console.log('  DATABASE_URL="postgresql://medical:medical123@localhost:5432/medical_dev"')
console.log('')
console.log('PostgreSQL (формат):')
console.log('  DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"')

