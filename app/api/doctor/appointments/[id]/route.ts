import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    let token: string | undefined
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7)
    else {
      const cookieHeader = request.headers.get('cookie')
      const cookies = cookieHeader ? parseCookies(cookieHeader) : {}
      if (cookies.token) token = cookies.token
    }

    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: decoded.userId } })
    if (!doctor) return NextResponse.json({ error: 'Профиль врача не найден' }, { status: 403 })

    const appointmentId = params.id
    const body = await request.json()
    const { status, scheduledAt } = body

    // Проверяем, что запись принадлежит этому врачу
    const appointment = await prisma.appointment.findFirst({
      where: { 
        id: appointmentId,
        doctorId: doctor.id 
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
    }

    // Валидация для переноса
    if (scheduledAt) {
      const newDate = new Date(scheduledAt)
      const now = new Date()
      
      // Проверка, что новая дата в будущем
      if (newDate <= now) {
        return NextResponse.json({ error: 'Новая дата должна быть в будущем' }, { status: 400 })
      }

      // Проверка рабочих часов (09:00 - 21:00)
      const hour = newDate.getHours()
      if (hour < 9 || hour >= 21) {
        return NextResponse.json({ error: 'Время должно быть в рабочих часах (09:00 - 21:00)' }, { status: 400 })
      }

      // Проверка 15-минутных интервалов
      const minutes = newDate.getMinutes()
      if (minutes % 15 !== 0) {
        return NextResponse.json({ error: 'Время должно быть кратно 15 минутам' }, { status: 400 })
      }

      // Проверка, что слот свободен
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId: doctor.id,
          scheduledAt: newDate,
          status: { not: 'cancelled' },
          id: { not: appointmentId }
        }
      })

      if (conflictingAppointment) {
        return NextResponse.json({ error: 'Это время уже занято' }, { status: 400 })
      }
    }

    // Обновляем запись
    const updateData: any = {}
    if (status) updateData.status = status
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt)

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData
    })

    // Записываем информацию о действии в карточку пациента
    const actionType = status === 'cancelled' ? 'appointment_cancelled' : 'appointment_rescheduled'
    const actionDescription = status === 'cancelled' 
      ? `Запись отменена врачом. Дата: ${appointment.scheduledAt.toLocaleDateString('ru-RU')} в ${appointment.scheduledAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
      : `Запись перенесена врачом с ${appointment.scheduledAt.toLocaleDateString('ru-RU')} ${appointment.scheduledAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} на ${newDate.toLocaleDateString('ru-RU')} ${newDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`

    // Добавляем запись в историю пациента
    await prisma.patientNote.create({
      data: {
        patientId: appointment.patientId,
        doctorId: doctor.id,
        type: actionType,
        content: actionDescription,
        isPrivate: false
      }
    })

    return NextResponse.json({ 
      message: 'Запись обновлена',
      appointment: updatedAppointment 
    })

  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
