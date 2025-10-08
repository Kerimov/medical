/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedCompanies() {
  console.log('🏥 Seeding companies...')

  const companies = [
    // Клиники
    {
      name: 'Медицинский центр "Здоровье+"',
      type: 'CLINIC',
      description: 'Современная клиника с опытными врачами и новейшим оборудованием',
      address: 'ул. Ленина, 45',
      city: 'Москва',
      phone: '+7 (495) 123-45-67',
      email: 'info@health-plus.ru',
      website: 'https://health-plus.ru',
      rating: 4.8,
      reviewCount: 245,
      isVerified: true,
      services: ['Терапия', 'Кардиология', 'Эндокринология', 'УЗИ', 'ЭКГ'],
      workingHours: {
        monday: { start: '08:00', end: '20:00' },
        tuesday: { start: '08:00', end: '20:00' },
        wednesday: { start: '08:00', end: '20:00' },
        thursday: { start: '08:00', end: '20:00' },
        friday: { start: '08:00', end: '20:00' },
        saturday: { start: '09:00', end: '18:00' },
        sunday: { start: '10:00', end: '16:00' }
      },
      coordinates: { lat: 55.7558, lng: 37.6173 },
      products: [
        {
          name: 'Консультация терапевта',
          description: 'Первичный прием специалиста',
          category: 'Консультации',
          price: 2500,
          currency: 'RUB',
          tags: ['терапевт', 'консультация']
        },
        {
          name: 'УЗИ внутренних органов',
          description: 'Комплексное УЗИ брюшной полости',
          category: 'Диагностика',
          price: 3500,
          currency: 'RUB',
          tags: ['УЗИ', 'диагностика']
        }
      ]
    },
    {
      name: 'Клиника "Семейный доктор"',
      type: 'CLINIC',
      description: 'Семейная клиника для всей семьи',
      address: 'пр-т Мира, 12',
      city: 'Москва',
      phone: '+7 (495) 234-56-78',
      email: 'contact@family-doctor.ru',
      website: 'https://family-doctor.ru',
      rating: 4.6,
      reviewCount: 189,
      isVerified: true,
      services: ['Педиатрия', 'Терапия', 'Гинекология', 'Дерматология'],
      workingHours: {
        monday: { start: '09:00', end: '21:00' },
        tuesday: { start: '09:00', end: '21:00' },
        wednesday: { start: '09:00', end: '21:00' },
        thursday: { start: '09:00', end: '21:00' },
        friday: { start: '09:00', end: '21:00' },
        saturday: { start: '10:00', end: '18:00' }
      },
      coordinates: { lat: 55.7887, lng: 37.6258 }
    },

    // Лаборатории
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая сеть медицинских лабораторий',
      address: 'ул. Тверская, 8',
      city: 'Москва',
      phone: '+7 (495) 345-67-89',
      email: 'info@invitro.ru',
      website: 'https://invitro.ru',
      rating: 4.9,
      reviewCount: 1250,
      isVerified: true,
      services: ['Общий анализ крови', 'Биохимия', 'Гормоны', 'Инфекции', 'Аллергены'],
      workingHours: {
        monday: { start: '07:30', end: '20:00' },
        tuesday: { start: '07:30', end: '20:00' },
        wednesday: { start: '07:30', end: '20:00' },
        thursday: { start: '07:30', end: '20:00' },
        friday: { start: '07:30', end: '20:00' },
        saturday: { start: '08:00', end: '17:00' },
        sunday: { start: '09:00', end: '15:00' }
      },
      coordinates: { lat: 55.7625, lng: 37.6061 },
      products: [
        {
          name: 'Общий анализ крови',
          description: 'Развернутый анализ крови с лейкоцитарной формулой',
          category: 'Анализы',
          price: 850,
          currency: 'RUB',
          tags: ['кровь', 'ОАК']
        },
        {
          name: 'Биохимический анализ крови',
          description: 'Комплексная биохимия (12 показателей)',
          category: 'Анализы',
          price: 2100,
          currency: 'RUB',
          tags: ['биохимия', 'кровь']
        },
        {
          name: 'Витамин D',
          description: 'Анализ на витамин D (25-OH)',
          category: 'Анализы',
          price: 1800,
          currency: 'RUB',
          tags: ['витамины', 'витамин D']
        }
      ]
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Федеральная сеть медицинских лабораторий',
      address: 'ул. Арбат, 23',
      city: 'Москва',
      phone: '+7 (495) 456-78-90',
      email: 'info@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.7,
      reviewCount: 890,
      isVerified: true,
      services: ['ПЦР тесты', 'Анализы крови', 'Генетика', 'Онкомаркеры'],
      workingHours: {
        monday: { start: '07:00', end: '20:00' },
        tuesday: { start: '07:00', end: '20:00' },
        wednesday: { start: '07:00', end: '20:00' },
        thursday: { start: '07:00', end: '20:00' },
        friday: { start: '07:00', end: '20:00' },
        saturday: { start: '08:00', end: '18:00' },
        sunday: { start: '09:00', end: '16:00' }
      },
      coordinates: { lat: 55.7512, lng: 37.5850 }
    },

    // Аптеки
    {
      name: 'Аптека "36.6"',
      type: 'PHARMACY',
      description: 'Круглосуточная аптека с широким ассортиментом',
      address: 'ул. Пушкинская, 5',
      city: 'Москва',
      phone: '+7 (495) 567-89-01',
      email: 'info@366.ru',
      website: 'https://366.ru',
      rating: 4.5,
      reviewCount: 567,
      isVerified: true,
      workingHours: {
        monday: { start: '00:00', end: '23:59' },
        tuesday: { start: '00:00', end: '23:59' },
        wednesday: { start: '00:00', end: '23:59' },
        thursday: { start: '00:00', end: '23:59' },
        friday: { start: '00:00', end: '23:59' },
        saturday: { start: '00:00', end: '23:59' },
        sunday: { start: '00:00', end: '23:59' }
      },
      coordinates: { lat: 55.7644, lng: 37.6014 },
      products: [
        {
          name: 'Витамин D3 5000 МЕ',
          description: 'Для профилактики дефицита витамина D',
          category: 'Витамины',
          price: 890,
          currency: 'RUB',
          tags: ['витамины', 'витамин D', 'БАД']
        },
        {
          name: 'Омега-3',
          description: 'Полиненасыщенные жирные кислоты, 120 капсул',
          category: 'Витамины',
          price: 1250,
          currency: 'RUB',
          tags: ['витамины', 'омега-3', 'БАД']
        }
      ]
    },

    // Магазины здорового питания
    {
      name: 'Магазин "Здоровое питание"',
      type: 'HEALTH_STORE',
      description: 'Органические продукты и спортивное питание',
      address: 'ул. Новый Арбат, 15',
      city: 'Москва',
      phone: '+7 (495) 678-90-12',
      email: 'info@healthfood.ru',
      website: 'https://healthfood.ru',
      rating: 4.8,
      reviewCount: 234,
      isVerified: true,
      services: ['Органические продукты', 'Спортивное питание', 'Суперфуды', 'БАДы'],
      workingHours: {
        monday: { start: '09:00', end: '21:00' },
        tuesday: { start: '09:00', end: '21:00' },
        wednesday: { start: '09:00', end: '21:00' },
        thursday: { start: '09:00', end: '21:00' },
        friday: { start: '09:00', end: '21:00' },
        saturday: { start: '10:00', end: '20:00' },
        sunday: { start: '10:00', end: '20:00' }
      },
      coordinates: { lat: 55.7531, lng: 37.5865 },
      products: [
        {
          name: 'Спирулина в таблетках',
          description: 'Органическая спирулина, 500 таблеток',
          category: 'Суперфуды',
          price: 1450,
          currency: 'RUB',
          tags: ['суперфуды', 'спирулина', 'органика']
        },
        {
          name: 'Протеин сывороточный',
          description: 'Концентрат сывороточного белка, 900г',
          category: 'Спортивное питание',
          price: 2890,
          currency: 'RUB',
          tags: ['спортпит', 'протеин']
        }
      ]
    },

    // Фитнес-центры
    {
      name: 'Фитнес-клуб "Спортлайф"',
      type: 'FITNESS_CENTER',
      description: 'Современный фитнес-клуб с бассейном и групповыми программами',
      address: 'ул. Большая Якиманка, 34',
      city: 'Москва',
      phone: '+7 (495) 789-01-23',
      email: 'info@sportlife.ru',
      website: 'https://sportlife.ru',
      rating: 4.6,
      reviewCount: 456,
      isVerified: true,
      services: ['Тренажерный зал', 'Бассейн', 'Групповые программы', 'Персональные тренировки', 'Сауна'],
      workingHours: {
        monday: { start: '06:00', end: '23:00' },
        tuesday: { start: '06:00', end: '23:00' },
        wednesday: { start: '06:00', end: '23:00' },
        thursday: { start: '06:00', end: '23:00' },
        friday: { start: '06:00', end: '23:00' },
        saturday: { start: '08:00', end: '22:00' },
        sunday: { start: '08:00', end: '22:00' }
      },
      coordinates: { lat: 55.7346, lng: 37.6206 }
    },

    // Диетологи
    {
      name: 'Центр диетологии "НутриЛайф"',
      type: 'NUTRITIONIST',
      description: 'Профессиональные диетологи и нутрициологи',
      address: 'ул. Остоженка, 18',
      city: 'Москва',
      phone: '+7 (495) 890-12-34',
      email: 'info@nutrilife.ru',
      website: 'https://nutrilife.ru',
      rating: 4.9,
      reviewCount: 178,
      isVerified: true,
      services: ['Индивидуальные программы питания', 'Коррекция веса', 'Спортивная диетология', 'Детское питание'],
      workingHours: {
        monday: { start: '10:00', end: '20:00' },
        tuesday: { start: '10:00', end: '20:00' },
        wednesday: { start: '10:00', end: '20:00' },
        thursday: { start: '10:00', end: '20:00' },
        friday: { start: '10:00', end: '20:00' },
        saturday: { start: '11:00', end: '18:00' }
      },
      coordinates: { lat: 55.7450, lng: 37.5877 },
      products: [
        {
          name: 'Консультация диетолога',
          description: 'Первичный прием с составлением программы питания',
          category: 'Консультации',
          price: 4500,
          currency: 'RUB',
          tags: ['диетолог', 'консультация']
        }
      ]
    }
  ]

  for (const companyData of companies) {
    const { products, ...companyInfo } = companyData

    // Проверяем, существует ли компания
    const existing = await prisma.company.findFirst({
      where: { name: companyInfo.name }
    })

    let company
    if (existing) {
      console.log(`⏭️  Company already exists: ${companyInfo.name}`)
      company = existing
    } else {
      company = await prisma.company.create({
        data: companyInfo
      })
      console.log(`✅ Created company: ${company.name}`)
    }

    // Создаем продукты для компании
    if (products && !existing) {
      for (const productData of products) {
        await prisma.product.create({
          data: {
            ...productData,
            companyId: company.id
          }
        })
      }
      console.log(`  📦 Added ${products.length} products`)
    }
  }

  console.log('✅ Companies seeding completed!')
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
