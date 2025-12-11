import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Использует headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic';

// GET - Получить все показатели
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
    const studyTypeId = searchParams.get('studyTypeId');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const where: any = {};
    if (studyTypeId) where.studyTypeId = studyTypeId;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
        { shortName: { contains: search } }
      ];
    }

    const indicators = await prisma.indicator.findMany({
      where,
      include: {
        studyType: true,
        referenceRanges: {
          include: {
            methodology: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(indicators);
  } catch (error: any) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Создать новый показатель (только для админов)
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
      studyTypeId,
      name,
      nameEn,
      code,
      shortName,
      unit,
      description,
      clinicalSignificance,
      increasedMeaning,
      decreasedMeaning,
      relatedConditions,
      synonyms,
      isActive = true
    } = body;

    if (!studyTypeId || !name || !unit) {
      return NextResponse.json(
        { error: 'Study type ID, name, and unit are required' },
        { status: 400 }
      );
    }

    const indicator = await prisma.indicator.create({
      data: {
        studyTypeId,
        name,
        nameEn,
        code,
        shortName,
        unit,
        description,
        clinicalSignificance,
        increasedMeaning,
        decreasedMeaning,
        relatedConditions,
        synonyms,
        isActive
      },
      include: {
        studyType: true
      }
    });

    return NextResponse.json(indicator, { status: 201 });
  } catch (error: any) {
    console.error('Error creating indicator:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
