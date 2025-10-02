import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// GET /api/marketplace/companies - получить каталог компаний
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Построение фильтров
    const where: any = {
      isActive: true
    }

    if (type) {
      where.type = type
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          products: {
            where: { isAvailable: true },
            take: 3 // Показываем только первые 3 продукта
          },
          _count: {
            select: { products: true }
          }
        },
        orderBy: [
          { isVerified: 'desc' },
          { rating: 'desc' },
          { reviewCount: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.company.count({ where })
    ])

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Ошибка получения каталога компаний' }, { status: 500 })
  }
}

// POST /api/marketplace/companies - создать новую компанию (только для админов)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    // Проверка на админа (можно расширить логику)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      type,
      description,
      address,
      city,
      phone,
      email,
      website,
      imageUrl,
      services,
      workingHours,
      coordinates
    } = body

    // Валидация
    if (!name || !type) {
      return NextResponse.json({ error: 'Название и тип компании обязательны' }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: {
        name,
        type,
        description,
        address,
        city,
        phone,
        email,
        website,
        imageUrl,
        services: services ? JSON.stringify(services) : null,
        workingHours: workingHours ? JSON.stringify(workingHours) : null,
        coordinates: coordinates ? JSON.stringify(coordinates) : null
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    logger.error('Error creating company:', error)
    return NextResponse.json({ error: 'Ошибка создания компании' }, { status: 500 })
  }
}
