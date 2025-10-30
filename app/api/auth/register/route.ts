export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

function tryParseBody(raw: string): { email?: string; password?: string; name?: string } {
  try {
    return JSON.parse(raw)
  } catch {
    try {
      const params = new URLSearchParams(raw)
      return {
        email: params.get('email') || undefined,
        password: params.get('password') || undefined,
        name: params.get('name') || undefined
      }
    } catch {
      return {}
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text()
    const { email, password, name } = tryParseBody(raw)

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
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хеширование пароля
    const hashedPassword = await hashPassword(password)

    // Создание пользователя
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name } })

    console.log('User registered:', email)

    // Генерация токена
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const response = NextResponse.json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // Устанавливаем cookie с токеном
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 дней
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}

