import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Использует headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic'

// Получение всех записей для пациента
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })
    }

    // Получаем записи пациента
    const appointments = await prisma.appointment.findMany({
      where: { patientId: decoded.userId },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    return NextResponse.json({ appointments })

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// Создание новой записи
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId, scheduledAt, appointmentType, notes } = body

    // Валидация
    if (!doctorId || !scheduledAt) {
      return NextResponse.json(
        { error: 'ID врача и время записи обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, что врач существует
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Врач не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является пациентом
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, name: true, email: true }
    })

    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Только пациенты могут записываться на прием' },
        { status: 403 }
      )
    }

    const appointmentDate = new Date(scheduledAt)
    
    // Проверяем, что время в будущем
    if (appointmentDate <= new Date()) {
      return NextResponse.json(
        { error: 'Нельзя записаться на прошедшее время' },
        { status: 400 }
      )
    }

    // Проверяем рабочие часы (9:00 - 21:00)
    const hour = appointmentDate.getHours()
    if (hour < 9 || hour >= 21) {
      return NextResponse.json(
        { error: 'Запись возможна только с 9:00 до 21:00' },
        { status: 400 }
      )
    }

    // Проверяем, что время кратно 15 минутам
    const minutes = appointmentDate.getMinutes()
    if (minutes % 15 !== 0) {
      return NextResponse.json(
        { error: 'Время записи должно быть кратно 15 минутам' },
        { status: 400 }
      )
    }

    // Проверяем, что время не занято
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt: appointmentDate,
        status: {
          in: ['scheduled', 'confirmed']
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Это время уже занято' },
        { status: 400 }
      )
    }

    // Создаем запись
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: decoded.userId,
        patientName: user.name,
        patientEmail: user.email,
        appointmentType: appointmentType || 'consultation',
        scheduledAt: appointmentDate,
        duration: 15, // 15 минут
        status: 'scheduled',
        notes: notes || null
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    console.log('Appointment created:', appointment.id, 'for patient:', user.name, 'with doctor:', doctor.user.name)

    return NextResponse.json({
      message: 'Запись на прием создана успешно',
      appointment
    })

  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
