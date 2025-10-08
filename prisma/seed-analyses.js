/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = 'test@pma.ru'
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log('User not found:', email)
    return
  }

  const now = new Date()
  const items = [
    {
      title: 'Общий анализ крови', type: 'Общий анализ крови', date: new Date(now.getTime() - 86400000 * 3),
      laboratory: 'Инвитро', doctor: 'Иванова И.И.', status: 'abnormal', normalRange: 'См. по показателям',
      results: { 'Гемоглобин': { value: 120, unit: 'г/л', normal: false }, 'Лейкоциты': { value: 6.2, unit: '10^9/л', normal: true } }
    },
    {
      title: 'Биохимический анализ крови', type: 'Биохимия', date: new Date(now.getTime() - 86400000 * 10),
      laboratory: 'Гемотест', doctor: 'Петров П.П.', status: 'abnormal', normalRange: 'См. по показателям',
      results: { 'Глюкоза': { value: 5.1, unit: 'ммоль/л', normal: true }, 'Холестерин': { value: 6.4, unit: 'ммоль/л', normal: false } }
    },
    {
      title: 'Витамин D (25-OH)', type: 'Витамин D', date: new Date(now.getTime() - 86400000 * 20),
      laboratory: 'Инвитро', doctor: 'Сидорова С.С.', status: 'abnormal', normalRange: '30-100 нг/мл',
      results: { 'Витамин D (25-OH)': { value: 18, unit: 'нг/мл', normal: false } }
    }
  ]

  for (const it of items) {
    await prisma.analysis.create({
      data: {
        userId: user.id,
        title: it.title,
        type: it.type,
        date: it.date,
        laboratory: it.laboratory,
        doctor: it.doctor,
        results: JSON.stringify(it.results),
        normalRange: it.normalRange,
        status: it.status,
      }
    })
  }

  console.log('Inserted demo analyses:', items.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
