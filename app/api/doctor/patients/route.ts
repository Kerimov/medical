import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Проверяем токен
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })
    }

    // Проверяем, что пользователь является врачом
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: decoded.userId }
    })

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Профиль врача не найден' }, { status: 404 })
    }

    // Получаем записи на прием к врачу
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      orderBy: { scheduledAt: 'desc' }
    })

    // Получаем уникальных пациентов
    const uniquePatients = new Map()
    appointments.forEach(appointment => {
      if (!uniquePatients.has(appointment.patientId)) {
        uniquePatients.set(appointment.patientId, {
          id: appointment.patientId,
          name: appointment.patientName,
          email: appointment.patientEmail,
          lastAppointment: appointment.scheduledAt,
          appointmentCount: 1,
          lastAppointmentType: appointment.appointmentType,
          lastAppointmentStatus: appointment.status
        })
      } else {
        const patient = uniquePatients.get(appointment.patientId)
        patient.appointmentCount += 1
        if (appointment.scheduledAt > patient.lastAppointment) {
          patient.lastAppointment = appointment.scheduledAt
          patient.lastAppointmentType = appointment.appointmentType
          patient.lastAppointmentStatus = appointment.status
        }
      }
    })

    // Форматируем данные для ответа
    const formattedPatients = Array.from(uniquePatients.values()).map(patient => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: null, // В модели User нет поля phone
      recordType: patient.lastAppointmentType,
      diagnosis: null,
      status: patient.lastAppointmentStatus,
      createdAt: patient.lastAppointment,
      updatedAt: patient.lastAppointment,
      nextVisit: null,
      appointmentCount: patient.appointmentCount
    }))

    return NextResponse.json(formattedPatients)

  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении пациентов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем токен
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })
    }

    // Проверяем, что пользователь является врачом
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: decoded.userId }
    })

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Профиль врача не найден' }, { status: 404 })
    }

    const body = await request.json()
    const { patientId, recordType, diagnosis, symptoms, treatment, medications, nextVisit } = body

    // Проверяем, что пациент существует
    const patient = await prisma.user.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Пациент не найден' }, { status: 404 })
    }

    // Создаем запись о пациенте
    const patientRecord = await prisma.patientRecord.create({
      data: {
        doctorId: doctorProfile.id,
        patientId: patientId,
        recordType: recordType || 'consultation',
        diagnosis,
        symptoms,
        treatment,
        medications: medications ? JSON.stringify(medications) : null,
        nextVisit: nextVisit ? new Date(nextVisit) : null,
        status: 'active'
      },
      include: {
        patient: true
      }
    })

    return NextResponse.json(patientRecord, { status: 201 })

  } catch (error) {
    console.error('Error creating patient record:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании записи о пациенте' },
      { status: 500 }
    )
  }
}
