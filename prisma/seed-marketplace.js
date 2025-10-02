const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedMarketplace() {
  console.log('Seeding marketplace data...')

  // Создаем компании
  const companies = [
    // Лаборатории
    {
      name: 'ДНКОМ',
      type: 'LABORATORY',
      description: 'Сеть медицинских лабораторий с современным оборудованием',
      address: 'ул. Тверская, 12',
      city: 'Москва',
      phone: '+7 (495) 123-45-67',
      email: 'info@dnkom.ru',
      website: 'https://dnkom.ru',
      rating: 4.5,
      reviewCount: 150,
      isVerified: true,
      services: JSON.stringify([
        'Общий анализ крови',
        'Биохимический анализ',
        'Анализ на витамины',
        'Гормональные исследования',
        'Онкомаркеры'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '07:00-20:00',
        'Сб': '08:00-18:00',
        'Вс': '09:00-16:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7558, lng: 37.6176 })
    },
    {
      name: 'Инвитро',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'ул. Арбат, 25',
      city: 'Москва',
      phone: '+7 (495) 363-36-36',
      email: 'info@invitro.ru',
      website: 'https://invitro.ru',
      rating: 4.3,
      reviewCount: 200,
      isVerified: true,
      services: JSON.stringify([
        'Все виды анализов',
        'Генетические исследования',
        'Цитологические исследования',
        'Микробиологические исследования'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '07:30-19:30',
        'Сб': '08:00-17:00',
        'Вс': '09:00-15:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7522, lng: 37.5911 })
    },
    {
      name: 'Гемотест',
      type: 'LABORATORY',
      description: 'Сеть лабораторий с широким спектром исследований',
      address: 'пр. Мира, 45',
      city: 'Москва',
      phone: '+7 (495) 532-13-13',
      email: 'info@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.2,
      reviewCount: 120,
      isVerified: true,
      services: JSON.stringify([
        'Клинические анализы',
        'Биохимические анализы',
        'Иммунологические исследования',
        'Анализ на инфекции'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '07:00-20:00',
        'Сб': '08:00-18:00',
        'Вс': '09:00-16:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7887, lng: 37.6341 })
    },

    // Клиники
    {
      name: 'Медицинский центр "Здоровье"',
      type: 'CLINIC',
      description: 'Многопрофильная клиника с опытными специалистами',
      address: 'ул. Ленина, 78',
      city: 'Москва',
      phone: '+7 (495) 234-56-78',
      email: 'info@zdorovie-clinic.ru',
      website: 'https://zdorovie-clinic.ru',
      rating: 4.7,
      reviewCount: 85,
      isVerified: true,
      services: JSON.stringify([
        'Консультации врачей',
        'Диагностика',
        'Лечение',
        'Профилактические осмотры'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '08:00-21:00',
        'Сб': '09:00-18:00',
        'Вс': '10:00-16:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7616, lng: 37.6094 })
    },
    {
      name: 'Клиника "Семейная"',
      type: 'CLINIC',
      description: 'Семейная клиника с индивидуальным подходом',
      address: 'ул. Пушкина, 15',
      city: 'Москва',
      phone: '+7 (495) 345-67-89',
      email: 'info@family-clinic.ru',
      website: 'https://family-clinic.ru',
      rating: 4.4,
      reviewCount: 65,
      isVerified: true,
      services: JSON.stringify([
        'Семейная медицина',
        'Педиатрия',
        'Гинекология',
        'Кардиология'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '08:30-20:00',
        'Сб': '09:00-17:00',
        'Вс': '10:00-15:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7749, lng: 37.6014 })
    },

    // Аптеки
    {
      name: 'Аптека "36,6"',
      type: 'PHARMACY',
      description: 'Сеть аптек с широким ассортиментом лекарств',
      address: 'ул. Красная Площадь, 1',
      city: 'Москва',
      phone: '+7 (495) 456-78-90',
      email: 'info@366.ru',
      website: 'https://366.ru',
      rating: 4.1,
      reviewCount: 300,
      isVerified: true,
      services: JSON.stringify([
        'Лекарственные препараты',
        'Биодобавки',
        'Медицинские изделия',
        'Консультация фармацевта'
      ]),
      workingHours: JSON.stringify({
        'Пн-Вс': '08:00-22:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7539, lng: 37.6208 })
    },
    {
      name: 'Аптека "Невис"',
      type: 'PHARMACY',
      description: 'Аптека с профессиональными консультациями',
      address: 'ул. Тверская, 8',
      city: 'Москва',
      phone: '+7 (495) 567-89-01',
      email: 'info@nevis.ru',
      website: 'https://nevis.ru',
      rating: 4.3,
      reviewCount: 180,
      isVerified: true,
      services: JSON.stringify([
        'Рецептурные препараты',
        'Безрецептурные лекарства',
        'Витамины и БАДы',
        'Детское питание'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '08:00-21:00',
        'Сб-Вс': '09:00-20:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7558, lng: 37.6176 })
    },

    // Магазины здорового питания
    {
      name: 'Магазин "Здоровое питание"',
      type: 'HEALTH_STORE',
      description: 'Магазин натуральных продуктов и биодобавок',
      address: 'ул. Арбат, 30',
      city: 'Москва',
      phone: '+7 (495) 678-90-12',
      email: 'info@health-store.ru',
      website: 'https://health-store.ru',
      rating: 4.6,
      reviewCount: 95,
      isVerified: true,
      services: JSON.stringify([
        'Биодобавки',
        'Витамины',
        'Натуральные продукты',
        'Органическая косметика'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '09:00-21:00',
        'Сб': '10:00-20:00',
        'Вс': '10:00-19:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7522, lng: 37.5911 })
    },
    {
      name: 'Фитнес-центр "Актив"',
      type: 'FITNESS_CENTER',
      description: 'Современный фитнес-центр с персональными тренерами',
      address: 'ул. Ленинский проспект, 50',
      city: 'Москва',
      phone: '+7 (495) 789-01-23',
      email: 'info@aktiv-fitness.ru',
      website: 'https://aktiv-fitness.ru',
      rating: 4.5,
      reviewCount: 140,
      isVerified: true,
      services: JSON.stringify([
        'Тренажерный зал',
        'Групповые занятия',
        'Персональные тренировки',
        'Йога и пилатес'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '06:00-23:00',
        'Сб-Вс': '08:00-22:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7067, lng: 37.5856 })
    },
    {
      name: 'Диетолог Анна Петрова',
      type: 'NUTRITIONIST',
      description: 'Сертифицированный диетолог с 10-летним опытом',
      address: 'ул. Садовое кольцо, 25',
      city: 'Москва',
      phone: '+7 (495) 890-12-34',
      email: 'anna@dietolog.ru',
      website: 'https://dietolog-anna.ru',
      rating: 4.8,
      reviewCount: 75,
      isVerified: true,
      services: JSON.stringify([
        'Консультации по питанию',
        'Составление диет',
        'Коррекция веса',
        'Спортивное питание'
      ]),
      workingHours: JSON.stringify({
        'Пн-Пт': '09:00-18:00',
        'Сб': '10:00-16:00'
      }),
      coordinates: JSON.stringify({ lat: 55.7558, lng: 37.6176 })
    }
  ]

  for (const companyData of companies) {
    await prisma.company.create({
      data: companyData
    })
  }

  // Создаем продукты для некоторых компаний
  const healthStore = await prisma.company.findFirst({
    where: { name: 'Магазин "Здоровое питание"' }
  })

  if (healthStore) {
    const products = [
      {
        companyId: healthStore.id,
        name: 'Витамин D3 2000 МЕ',
        description: 'Высококачественный витамин D3 в удобной форме капсул',
        category: 'Витамины',
        price: 890.00,
        currency: 'RUB',
        tags: JSON.stringify(['витамин D', 'иммунитет', 'кости']),
        isAvailable: true
      },
      {
        companyId: healthStore.id,
        name: 'Омега-3 1000мг',
        description: 'Рыбий жир высшего качества для поддержания сердечно-сосудистой системы',
        category: 'Омега-3',
        price: 1200.00,
        currency: 'RUB',
        tags: JSON.stringify(['омега-3', 'сердце', 'мозг']),
        isAvailable: true
      },
      {
        companyId: healthStore.id,
        name: 'Магний + B6',
        description: 'Комплекс магния и витамина B6 для нервной системы',
        category: 'Минералы',
        price: 650.00,
        currency: 'RUB',
        tags: JSON.stringify(['магний', 'нервы', 'стресс']),
        isAvailable: true
      }
    ]

    for (const productData of products) {
      await prisma.product.create({
        data: productData
      })
    }
  }

  console.log('Marketplace data seeded successfully!')
}

module.exports = { seedMarketplace }

if (require.main === module) {
  seedMarketplace()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
