import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Валидация
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверка существования пользователя
    const existingUser = db.users.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хеширование пароля
    const hashedPassword = await hashPassword(password)

    // Создание пользователя
    const user = db.users.create({
      email,
      password: hashedPassword,
      name
    })

    console.log('User registered:', email)
    console.log('Total users in DB:', db.users.getAll().length)

    // Генерация токена
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    return NextResponse.json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}

