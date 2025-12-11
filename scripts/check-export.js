// Проверка содержимого файла экспорта
const fs = require('fs')
const path = require('path')

const exportDir = path.join(process.cwd(), 'export')
if (!fs.existsSync(exportDir)) {
  console.log('❌ Папка export не найдена')
  process.exit(1)
}

const files = fs.readdirSync(exportDir)
  .filter(f => f.startsWith('production-data-') && f.endsWith('.json'))
  .sort()
  .reverse()

if (files.length === 0) {
  console.log('❌ Файлы экспорта не найдены')
  process.exit(1)
}

const latestFile = path.join(exportDir, files[0])
console.log(`\n📁 Файл: ${files[0]}`)
console.log(`   Размер: ${(fs.statSync(latestFile).size / 1024).toFixed(2)} KB`)

const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'))

console.log('\n📊 Статистика экспорта:')
Object.entries(data).forEach(([key, value]) => {
  if (Array.isArray(value)) {
    console.log(`   ${key}: ${value.length} записей`)
  }
})

console.log('\n✅ Файл готов к импорту!')

