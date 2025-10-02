import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// GET /api/marketplace/companies/[id] - получить детали компании
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Компания не найдена' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    logger.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Ошибка получения информации о компании' }, { status: 500 })
  }
}

// PUT /api/marketplace/companies/[id] - обновить компанию
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
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
      coordinates,
      isActive
    } = body

    // Проверяем, что компания существует
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id }
    })

    if (!existingCompany) {
      return NextResponse.json({ error: 'Компания не найдена' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (description !== undefined) updateData.description = description
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (website !== undefined) updateData.website = website
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (services !== undefined) updateData.services = JSON.stringify(services)
    if (workingHours !== undefined) updateData.workingHours = JSON.stringify(workingHours)
    if (coordinates !== undefined) updateData.coordinates = JSON.stringify(coordinates)
    if (isActive !== undefined) updateData.isActive = isActive

    const company = await prisma.company.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(company)
  } catch (error) {
    logger.error('Error updating company:', error)
    return NextResponse.json({ error: 'Ошибка обновления компании' }, { status: 500 })
  }
}

// DELETE /api/marketplace/companies/[id] - удалить компанию
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    // Проверяем, что компания существует
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id }
    })

    if (!existingCompany) {
      return NextResponse.json({ error: 'Компания не найдена' }, { status: 404 })
    }

    // Мягкое удаление - помечаем как неактивную
    await prisma.company.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Компания удалена' })
  } catch (error) {
    logger.error('Error deleting company:', error)
    return NextResponse.json({ error: 'Ошибка удаления компании' }, { status: 500 })
  }
}
