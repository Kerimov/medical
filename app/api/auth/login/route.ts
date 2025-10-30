export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePasswords, generateToken } from '@/lib/auth'

function tryParseBody(raw: string): { email?: string; password?: string } {
  try {
    return JSON.parse(raw)
  } catch {
    // Try x-www-form-urlencoded
    try {
      const params = new URLSearchParams(raw)
      return {
        email: params.get('email') || undefined,
        password: params.get('password') || undefined
      }
    } catch {
      return {}
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text()
    const { email, password } = tryParseBody(raw)

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Поиск пользователя в БД
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('Login attempt for:', email)
    
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
      email: user.email,
      role: user.role
    })

    const response = NextResponse.json({
      message: 'Вход выполнен успешно',
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    )
  }
}

