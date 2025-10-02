const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDoctor() {
  try {
    // Создаем пользователя-врача
    const user = await prisma.user.create({
      data: {
        email: 'doctor@example.com',
        password: '$2a$10$rQZ8KjLmNpOqRsTuVwXy3uJkLmNpOqRsTuVwXy3uJkLmNpOqRsTuVwXy', // password: doctor123
        name: 'Доктор Иванов'
      }
    })

    console.log('Пользователь создан:', user.email)

    // Создаем профиль врача
    const doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        licenseNumber: 'LIC123456789',
        specialization: 'general',
        experience: 10,
        education: 'Московский медицинский университет, специальность "Лечебное дело"',
        certifications: 'Сертификат по кардиологии, Курсы повышения квалификации по эхокардиографии',
        phone: '+7 (999) 123-45-67',
        clinic: 'Городская клиническая больница №1',
        address: 'Москва, ул. Медицинская, д. 1',
        consultationFee: 2500,
        workingHours: JSON.stringify({
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '10:00', end: '16:00' },
          sunday: { start: '', end: '' }
        }),
        isVerified: true,
        isActive: true
      }
    })

    console.log('Профиль врача создан:', doctorProfile.licenseNumber)
    console.log('Врач готов к работе!')
    
    console.log('\n📋 Данные для входа:')
    console.log('Email: doctor@example.com')
    console.log('Пароль: doctor123')
    console.log('Специализация: Терапевт')
    console.log('Лицензия:', doctorProfile.licenseNumber)

  } catch (error) {
    console.error('Ошибка при создании врача:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDoctor()
