import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Маршрут использует request.headers (Authorization), поэтому помечаем его как динамический,
// чтобы Next.js не пытался выполнять его при статическом экспорте.
export const dynamic = 'force-dynamic'

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

    // Получаем всех врачей
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        isActive: true
        // Временно убираем проверку isVerified для тестирования
        // isVerified: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      specialization: doctor.specialization,
      experience: doctor.experience,
      education: doctor.education,
      phone: doctor.phone,
      clinic: doctor.clinic,
      consultationFee: doctor.consultationFee
    }))

    return NextResponse.json({ doctors: formattedDoctors })

  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
