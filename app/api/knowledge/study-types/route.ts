import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Использует headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic';

// GET - Получить все типы исследований
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === 'true';

    const studyTypes = await prisma.studyType.findMany({
      where,
      include: {
        indicators: {
          where: { isActive: true },
          include: {
            referenceRanges: {
              include: {
                methodology: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(studyTypes);
  } catch (error: any) {
    console.error('Error fetching study types:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Создать новый тип исследования (только для админов)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      nameEn,
      code,
      category,
      description,
      clinicalSignificance,
      preparation,
      biomaterial,
      isActive = true
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const studyType = await prisma.studyType.create({
      data: {
        name,
        nameEn,
        code,
        category,
        description,
        clinicalSignificance,
        preparation,
        biomaterial,
        isActive
      }
    });

    return NextResponse.json(studyType, { status: 201 });
  } catch (error: any) {
    console.error('Error creating study type:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
