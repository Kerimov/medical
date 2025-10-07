import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })

    const patientId = params.id

    // Проверяем, что запрос делает врач и что пациент прикреплен к нему
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: decoded.userId },
      include: {
        patientRecords: {
          where: { patientId },
          take: 1
        }
      }
    })

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Профиль врача не найден' }, { status: 404 })
    }

    let patientRecord = doctorProfile.patientRecords[0] || null
    if (!patientRecord) {
      // Разрешаем доступ, если есть хотя бы одна запись на прием у этого врача с данным пациентом
      const hasAppointment = await prisma.appointment.findFirst({
        where: { doctorId: doctorProfile.id, patientId },
        select: { id: true }
      })
      if (!hasAppointment) {
        return NextResponse.json({ error: 'Пациент не прикреплен к врачу' }, { status: 403 })
      }
    }

    const [patient, analyses, recommendations, appointments, prescriptions, notes] = await Promise.all([
      prisma.user.findUnique({
        where: { id: patientId },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      prisma.analysis.findMany({
        where: { userId: patientId },
        orderBy: { date: 'desc' },
        include: {
          document: { select: { laboratory: true, studyDate: true } }
        }
      }),
      prisma.recommendation.findMany({
        where: { userId: patientId },
        orderBy: [ { priority: 'desc' }, { createdAt: 'desc' } ],
        include: { company: true, product: true }
      }),
      prisma.appointment.findMany({
        where: { doctorId: doctorProfile.id, patientId },
        orderBy: { scheduledAt: 'desc' }
      }),
      prisma.prescription.findMany({
        where: patientRecord ? { patientRecordId: patientRecord.id } : { patientRecordId: '' },
        orderBy: { prescribedAt: 'desc' }
      }),
      prisma.medicalNote.findMany({
        where: patientRecord ? { patientRecordId: patientRecord.id } : { patientRecordId: '' },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      patient,
      patientRecord,
      analyses,
      recommendations,
      appointments,
      prescriptions,
      notes
    })
  } catch (error) {
    console.error('Error fetching patient card data:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}


