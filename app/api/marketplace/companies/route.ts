import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// GET /api/marketplace/companies - получить список компаний
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const city = searchParams.get('city')
    const verified = searchParams.get('verified')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      isActive: true
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      }
    }

    if (verified === 'true') {
      where.isVerified = true
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
            take: 3
          },
          _count: {
            select: { 
              recommendations: true,
              products: true
            }
          }
        },
        orderBy: [
          { isVerified: 'desc' },
          { rating: 'desc' },
          { name: 'asc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.company.count({ where })
    ])

    return NextResponse.json({
      companies,
      total,
      limit,
      offset
    })
  } catch (error) {
    logger.error('Error fetching companies:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Ошибка получения списка компаний' }, { status: 500 })
  }
}