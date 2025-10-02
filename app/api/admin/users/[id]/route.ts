import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем авторизацию
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })
    }

    // Проверяем права администратора
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!adminUser || !adminEmails.includes(adminUser.email.toLowerCase())) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const userId = params.id

    // Проверяем, что пользователь существует
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем, что админ не удаляет сам себя
    if (userId === decoded.userId) {
      return NextResponse.json({ error: 'Нельзя удалить самого себя' }, { status: 400 })
    }

    // Удаляем пользователя (каскадное удаление настроено в Prisma)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'Пользователь успешно удален' })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем авторизацию
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })
    }

    // Проверяем права администратора
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!adminUser || !adminEmails.includes(adminUser.email.toLowerCase())) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()
    const { name, email } = body

    // Проверяем, что пользователь существует
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userToUpdate) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || userToUpdate.name,
        email: email || userToUpdate.email
      }
    })

    return NextResponse.json({ 
      message: 'Пользователь успешно обновлен',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
