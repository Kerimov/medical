import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Проверяем токен
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Токен не найден' }, { status: 401 })
    }

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

    // Получаем пациентов врача
    const patients = await prisma.patientRecord.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Форматируем данные для ответа
    const formattedPatients = patients.map(record => ({
      id: record.id,
      name: record.patient.name,
      email: record.patient.email,
      phone: record.patient.phone || null,
      recordType: record.recordType,
      diagnosis: record.diagnosis,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      nextVisit: record.nextVisit
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
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Токен не найден' }, { status: 401 })
    }

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
