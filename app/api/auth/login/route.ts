import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePasswords, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Поиск пользователя
    const user = db.users.findByEmail(email)
    console.log('Login attempt for:', email)
    console.log('Total users in DB:', db.users.getAll().length)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль. Пожалуйста, сначала зарегистрируйтесь.' },
        { status: 401 }
      )
    }

    // Проверка пароля
    const isPasswordValid = await comparePasswords(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    // Генерация токена
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    return NextResponse.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    )
  }
}

