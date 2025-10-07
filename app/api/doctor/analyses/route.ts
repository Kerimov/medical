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

    const { searchParams } = new URL(request.url)
    const filterPatientId = searchParams.get('patientId')

    // Получаем всех пациентов врача
    const patientRecords = await prisma.patientRecord.findMany({
      where: { doctorId: doctorProfile.id },
      select: { patientId: true }
    })

    let patientIds = patientRecords.map(record => record.patientId)
    if (filterPatientId) {
      patientIds = patientIds.filter(id => id === filterPatientId)
    }

    if (patientIds.length === 0) {
      return NextResponse.json([])
    }

    // Получаем анализы пациентов (возможен фильтр по одному пациенту)
    const analyses = await prisma.analysis.findMany({
      where: {
        userId: {
          in: patientIds
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        document: {
          select: {
            fileName: true,
            studyDate: true,
            laboratory: true
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(analyses)

  } catch (error) {
    console.error('Error fetching doctor analyses:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении анализов' },
      { status: 500 }
    )
  }
}
