const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTables() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    console.log(`\n📊 Найдено таблиц: ${result.length}\n`)
    
    if (result.length === 0) {
      console.log('⚠️ Таблицы не найдены в базе данных!')
      console.log('\n💡 Выполните:')
      console.log('   npx prisma db push')
    } else {
      console.log('✅ Таблицы в базе данных:')
      result.forEach(t => console.log(`   - ${t.table_name}`))
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()

