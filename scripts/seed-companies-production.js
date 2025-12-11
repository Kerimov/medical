// Скрипт для заполнения компаний в продакшн базу
// Использование: 
//   Для локальной базы: node scripts/seed-companies-production.js
//   Для продакшн базы: DATABASE_URL="postgresql://..." node scripts/seed-companies-production.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedCompanies() {
  console.log('🏥 Seeding companies...')
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set (using default)'}`)

  const companies = [
    // Лаборатории
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Сеть современных лабораторий с широким спектром анализов',
      address: 'ул. Тверская, 10',
      city: 'Москва',
      phone: '+7 (495) 363-0-363',
      email: 'info@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.7,
      reviewCount: 1520,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7558, lng: 37.6173 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Ленинский проспект, 99',
      city: 'Москва',
      phone: '+7 (495) 532-13-13',
      email: 'info@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.6,
      reviewCount: 890,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.6918, lng: 37.5736 }
    },
    // Клиники
    {
      name: 'Медицинский центр "Здоровье+"',
      type: 'CLINIC',
      description: 'Современная клиника с опытными врачами',
      address: 'ул. Ленина, 45',
      city: 'Москва',
      phone: '+7 (495) 123-45-67',
      email: 'info@health-plus.ru',
      website: 'https://health-plus.ru',
      rating: 4.8,
      reviewCount: 245,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7558, lng: 37.6173 }
    },
    {
      name: 'Клиника "Медси"',
      type: 'CLINIC',
      description: 'Сеть частных клиник',
      address: 'Грохольский пер., 31',
      city: 'Москва',
      phone: '+7 (495) 780-40-40',
      email: 'info@medsi.ru',
      website: 'https://medsi.ru',
      rating: 4.9,
      reviewCount: 3200,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7520, lng: 37.6156 }
    },
    // Аптеки
    {
      name: 'Аптека "36,6"',
      type: 'PHARMACY',
      description: 'Сеть аптек',
      address: 'ул. Арбат, 15',
      city: 'Москва',
      phone: '+7 (495) 363-6-363',
      email: 'info@366.ru',
      website: 'https://366.ru',
      rating: 4.5,
      reviewCount: 560,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7520, lng: 37.5914 }
    },
    // Магазины здорового питания
    {
      name: 'Магазин "Здоровое питание"',
      type: 'HEALTH_STORE',
      description: 'БАДы, витамины, органические продукты',
      address: 'ул. Новый Арбат, 21',
      city: 'Москва',
      phone: '+7 (495) 234-56-78',
      email: 'info@health-store.ru',
      website: 'https://health-store.ru',
      rating: 4.4,
      reviewCount: 120,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7520, lng: 37.5831 }
    },
    // Фитнес-центры
    {
      name: 'Фитнес-клуб "World Class"',
      type: 'FITNESS_CENTER',
      description: 'Премиальный фитнес-клуб',
      address: 'ул. Тверская, 22',
      city: 'Москва',
      phone: '+7 (495) 988-88-88',
      email: 'info@worldclass.ru',
      website: 'https://worldclass.ru',
      rating: 4.6,
      reviewCount: 890,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7558, lng: 37.6173 }
    },
    // Диетологи
    {
      name: 'Диетолог Анна Петрова',
      type: 'NUTRITIONIST',
      description: 'Сертифицированный диетолог',
      address: 'ул. Садовое кольцо, 25',
      city: 'Москва',
      phone: '+7 (495) 890-12-34',
      email: 'anna@dietolog.ru',
      website: 'https://dietolog-anna.ru',
      rating: 4.8,
      reviewCount: 75,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7558, lng: 37.6176 }
    }
  ]

  let created = 0
  let skipped = 0

  for (const companyData of companies) {
    try {
      // Проверяем, существует ли компания
      const existing = await prisma.company.findFirst({
        where: { name: companyData.name }
      })

      if (existing) {
        console.log(`⏭️  Company already exists: ${companyData.name}`)
        skipped++
      } else {
        await prisma.company.create({
          data: companyData
        })
        console.log(`✅ Created company: ${companyData.name}`)
        created++
      }
    } catch (error) {
      console.error(`❌ Error creating company ${companyData.name}:`, error.message)
    }
  }

  console.log(`\n✅ Companies seeding completed!`)
  console.log(`   Created: ${created}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total: ${companies.length}`)
}

async function main() {
  try {
    await seedCompanies()
  } catch (error) {
    console.error('❌ Error seeding companies:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

