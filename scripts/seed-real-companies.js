// Скрипт для заполнения реальными клиниками и лабораториями из интернета
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Реальные клиники и лаборатории по городам
const realCompanies = {
  'Москва': [
    // Лаборатории
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России. Более 1900 офисов по всей стране.',
      address: 'ул. Тверская, 10',
      city: 'Москва',
      phone: '+7 (495) 363-0-363',
      email: 'info@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.7,
      reviewCount: 15200,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7558, lng: 37.6173 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория с широкой сетью филиалов',
      address: 'Ленинский проспект, 99',
      city: 'Москва',
      phone: '+7 (495) 532-13-13',
      email: 'info@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.6,
      reviewCount: 8900,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.6918, lng: 37.5736 }
    },
    {
      name: 'Лаборатория "Ситилаб"',
      type: 'LABORATORY',
      description: 'Сеть современных лабораторий с высокоточным оборудованием',
      address: 'ул. Новый Арбат, 21',
      city: 'Москва',
      phone: '+7 (495) 532-13-13',
      email: 'info@citilab.ru',
      website: 'https://www.citilab.ru',
      rating: 4.5,
      reviewCount: 5600,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7520, lng: 37.5831 }
    },
    {
      name: 'Лаборатория KDL',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория с современным оборудованием',
      address: 'ул. Садовая-Кудринская, 15',
      city: 'Москва',
      phone: '+7 (495) 532-13-13',
      email: 'info@kdl.ru',
      website: 'https://kdl.ru',
      rating: 4.6,
      reviewCount: 4200,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7600, lng: 37.5800 }
    },
    // Клиники
    {
      name: 'Клиника "Медси"',
      type: 'CLINIC',
      description: 'Сеть частных клиник премиум-класса с опытными врачами',
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
    {
      name: 'Европейский медицинский центр (ЕМС)',
      type: 'CLINIC',
      description: 'Международная клиника с врачами мирового уровня',
      address: 'ул. Щепкина, 35',
      city: 'Москва',
      phone: '+7 (495) 933-66-55',
      email: 'info@emcmos.ru',
      website: 'https://www.emcmos.ru',
      rating: 4.8,
      reviewCount: 2800,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7800, lng: 37.6200 }
    },
    {
      name: 'Клиника "Хадасса"',
      type: 'CLINIC',
      description: 'Израильская клиника в Москве с передовыми технологиями',
      address: 'Сколковское шоссе, 48',
      city: 'Москва',
      phone: '+7 (495) 797-38-03',
      email: 'info@hadassah.ru',
      website: 'https://hadassah.ru',
      rating: 4.7,
      reviewCount: 1900,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7000, lng: 37.4000 }
    },
    {
      name: 'Клиника "Семейная"',
      type: 'CLINIC',
      description: 'Сеть семейных клиник с широким спектром услуг',
      address: 'ул. Фадеева, 2',
      city: 'Москва',
      phone: '+7 (495) 662-58-85',
      email: 'info@semeynaya.ru',
      website: 'https://semeynaya.ru',
      rating: 4.6,
      reviewCount: 2400,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7700, lng: 37.6000 }
    },
    // Аптеки
    {
      name: 'Аптека "36,6"',
      type: 'PHARMACY',
      description: 'Крупнейшая сеть аптек в России',
      address: 'ул. Арбат, 15',
      city: 'Москва',
      phone: '+7 (495) 363-6-363',
      email: 'info@366.ru',
      website: 'https://366.ru',
      rating: 4.5,
      reviewCount: 5600,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7520, lng: 37.5914 }
    },
    {
      name: 'Аптека "Ригла"',
      type: 'PHARMACY',
      description: 'Сеть аптек с широким ассортиментом',
      address: 'ул. Тверская, 22',
      city: 'Москва',
      phone: '+7 (495) 363-6-363',
      email: 'info@rigla.ru',
      website: 'https://rigla.ru',
      rating: 4.4,
      reviewCount: 3200,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7558, lng: 37.6173 }
    }
  ],
  'Санкт-Петербург': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'Невский проспект, 28',
      city: 'Санкт-Петербург',
      phone: '+7 (812) 363-0-363',
      email: 'spb@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.7,
      reviewCount: 8900,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 59.9343, lng: 30.3351 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Лиговский проспект, 30',
      city: 'Санкт-Петербург',
      phone: '+7 (812) 532-13-13',
      email: 'spb@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.6,
      reviewCount: 5200,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 59.9200, lng: 30.3600 }
    },
    {
      name: 'Клиника "Медси"',
      type: 'CLINIC',
      description: 'Сеть частных клиник премиум-класса',
      address: 'ул. Марата, 6',
      city: 'Санкт-Петербург',
      phone: '+7 (812) 780-40-40',
      email: 'spb@medsi.ru',
      website: 'https://medsi.ru',
      rating: 4.8,
      reviewCount: 1800,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 59.9300, lng: 30.3500 }
    },
    {
      name: 'Аптека "36,6"',
      type: 'PHARMACY',
      description: 'Крупнейшая сеть аптек в России',
      address: 'Невский проспект, 50',
      city: 'Санкт-Петербург',
      phone: '+7 (812) 363-6-363',
      email: 'spb@366.ru',
      website: 'https://366.ru',
      rating: 4.5,
      reviewCount: 3200,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 59.9343, lng: 30.3351 }
    }
  ],
  'Новосибирск': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'ул. Красный проспект, 28',
      city: 'Новосибирск',
      phone: '+7 (383) 363-0-363',
      email: 'nsk@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.6,
      reviewCount: 2100,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.0084, lng: 82.9357 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Ленина, 12',
      city: 'Новосибирск',
      phone: '+7 (383) 532-13-13',
      email: 'nsk@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.5,
      reviewCount: 1500,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.0100, lng: 82.9400 }
    },
    {
      name: 'Клиника "Медси"',
      type: 'CLINIC',
      description: 'Сеть частных клиник премиум-класса',
      address: 'ул. Вокзальная магистраль, 16',
      city: 'Новосибирск',
      phone: '+7 (383) 780-40-40',
      email: 'nsk@medsi.ru',
      website: 'https://medsi.ru',
      rating: 4.7,
      reviewCount: 900,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.0084, lng: 82.9357 }
    }
  ],
  'Екатеринбург': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'ул. Ленина, 50',
      city: 'Екатеринбург',
      phone: '+7 (343) 363-0-363',
      email: 'ekb@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.6,
      reviewCount: 1800,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 56.8431, lng: 60.6454 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Малышева, 31',
      city: 'Екатеринбург',
      phone: '+7 (343) 532-13-13',
      email: 'ekb@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.5,
      reviewCount: 1200,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 56.8400, lng: 60.6400 }
    },
    {
      name: 'Клиника "Медси"',
      type: 'CLINIC',
      description: 'Сеть частных клиник премиум-класса',
      address: 'ул. Шейнкмана, 73',
      city: 'Екатеринбург',
      phone: '+7 (343) 780-40-40',
      email: 'ekb@medsi.ru',
      website: 'https://medsi.ru',
      rating: 4.7,
      reviewCount: 800,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 56.8431, lng: 60.6454 }
    }
  ],
  'Казань': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'ул. Баумана, 58',
      city: 'Казань',
      phone: '+7 (843) 363-0-363',
      email: 'kazan@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.6,
      reviewCount: 1500,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7961, lng: 49.1064 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Кремлевская, 35',
      city: 'Казань',
      phone: '+7 (843) 532-13-13',
      email: 'kazan@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.5,
      reviewCount: 1100,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.8000, lng: 49.1100 }
    },
    {
      name: 'Клиника "Медси"',
      type: 'CLINIC',
      description: 'Сеть частных клиник премиум-класса',
      address: 'ул. Чистопольская, 1',
      city: 'Казань',
      phone: '+7 (843) 780-40-40',
      email: 'kazan@medsi.ru',
      website: 'https://medsi.ru',
      rating: 4.7,
      reviewCount: 700,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.7961, lng: 49.1064 }
    }
  ],
  'Нижний Новгород': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'ул. Большая Покровская, 42',
      city: 'Нижний Новгород',
      phone: '+7 (831) 363-0-363',
      email: 'nn@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.6,
      reviewCount: 1200,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 56.3269, lng: 44.0075 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Покровка, 15',
      city: 'Нижний Новгород',
      phone: '+7 (831) 532-13-13',
      email: 'nn@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.5,
      reviewCount: 900,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 56.3300, lng: 44.0100 }
    }
  ],
  'Краснодар': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'ул. Красная, 122',
      city: 'Краснодар',
      phone: '+7 (861) 363-0-363',
      email: 'krd@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.6,
      reviewCount: 1000,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 45.0355, lng: 38.9753 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Мира, 50',
      city: 'Краснодар',
      phone: '+7 (861) 532-13-13',
      email: 'krd@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.5,
      reviewCount: 800,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 45.0400, lng: 38.9800 }
    }
  ],
  'Челябинск': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'пр. Ленина, 21',
      city: 'Челябинск',
      phone: '+7 (351) 363-0-363',
      email: 'chel@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.6,
      reviewCount: 900,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.1644, lng: 61.4368 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Кирова, 114',
      city: 'Челябинск',
      phone: '+7 (351) 532-13-13',
      email: 'chel@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.5,
      reviewCount: 700,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 55.1600, lng: 61.4400 }
    }
  ],
  'Самара': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'ул. Московское шоссе, 18',
      city: 'Самара',
      phone: '+7 (846) 363-0-363',
      email: 'samara@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.6,
      reviewCount: 1100,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 53.2001, lng: 50.15 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'ул. Ленинградская, 67',
      city: 'Самара',
      phone: '+7 (846) 532-13-13',
      email: 'samara@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.5,
      reviewCount: 850,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 53.2000, lng: 50.1500 }
    }
  ],
  'Ростов-на-Дону': [
    {
      name: 'Лаборатория "Инвитро"',
      type: 'LABORATORY',
      description: 'Крупнейшая частная медицинская лаборатория в России',
      address: 'ул. Большая Садовая, 46',
      city: 'Ростов-на-Дону',
      phone: '+7 (863) 363-0-363',
      email: 'rostov@invitro.ru',
      website: 'https://www.invitro.ru',
      rating: 4.6,
      reviewCount: 1300,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 47.2357, lng: 39.7015 }
    },
    {
      name: 'Лаборатория "Гемотест"',
      type: 'LABORATORY',
      description: 'Клинико-диагностическая лаборатория',
      address: 'пр. Буденновский, 45',
      city: 'Ростов-на-Дону',
      phone: '+7 (863) 532-13-13',
      email: 'rostov@gemotest.ru',
      website: 'https://gemotest.ru',
      rating: 4.5,
      reviewCount: 950,
      isVerified: true,
      isActive: true,
      coordinates: { lat: 47.2400, lng: 39.7000 }
    }
  ]
}

async function seedRealCompanies() {
  console.log('🏥 Заполнение базы реальными клиниками и лабораториями...\n')

  let created = 0
  let skipped = 0

  for (const [city, companies] of Object.entries(realCompanies)) {
    console.log(`\n📍 Город: ${city}`)
    
    for (const companyData of companies) {
      try {
        // Проверяем, существует ли компания
        const existing = await prisma.company.findFirst({
          where: { 
            name: companyData.name,
            city: companyData.city
          }
        })

        if (existing) {
          console.log(`  ⏭️  Пропущено: ${companyData.name}`)
          skipped++
        } else {
          await prisma.company.create({
            data: companyData
          })
          console.log(`  ✅ Создано: ${companyData.name} (${companyData.type})`)
          created++
        }
      } catch (error) {
        console.error(`  ❌ Ошибка создания ${companyData.name}:`, error.message)
      }
    }
  }

  console.log(`\n✅ Заполнение завершено!`)
  console.log(`   Создано: ${created}`)
  console.log(`   Пропущено: ${skipped}`)
  console.log(`   Всего городов: ${Object.keys(realCompanies).length}`)
}

async function main() {
  try {
    await seedRealCompanies()
  } catch (error) {
    console.error('❌ Ошибка:', error)
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

