import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Использует headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic';

// GET - Получить все нормативные диапазоны
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
    const indicatorId = searchParams.get('indicatorId');
    const methodologyId = searchParams.get('methodologyId');
    const gender = searchParams.get('gender');
    const age = searchParams.get('age');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (indicatorId) where.indicatorId = indicatorId;
    if (methodologyId) where.methodologyId = methodologyId;
    if (gender) where.gender = gender;
    if (isActive !== null) where.isActive = isActive === 'true';
    
    // Фильтр по возрасту
    if (age) {
      const ageNum = parseFloat(age);
      where.OR = [
        { ageGroupMin: null, ageGroupMax: null },
        {
          AND: [
            { OR: [{ ageGroupMin: null }, { ageGroupMin: { lte: ageNum } }] },
            { OR: [{ ageGroupMax: null }, { ageGroupMax: { gte: ageNum } }] }
          ]
        }
      ];
    }

    const referenceRanges = await prisma.referenceRange.findMany({
      where,
      include: {
        indicator: {
          include: {
            studyType: true
          }
        },
        methodology: true
      },
      orderBy: [
        { indicator: { name: 'asc' } },
        { methodology: { name: 'asc' } }
      ]
    });

    return NextResponse.json(referenceRanges);
  } catch (error: any) {
    console.error('Error fetching reference ranges:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Создать новый нормативный диапазон (только для админов)
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
      indicatorId,
      methodologyId,
      ageGroupMin,
      ageGroupMax,
      gender,
      minValue,
      maxValue,
      optimalMin,
      optimalMax,
      criticalLow,
      criticalHigh,
      note,
      conditions,
      isActive = true
    } = body;

    if (!indicatorId || !methodologyId) {
      return NextResponse.json(
        { error: 'Indicator ID and Methodology ID are required' },
        { status: 400 }
      );
    }

    const referenceRange = await prisma.referenceRange.create({
      data: {
        indicatorId,
        methodologyId,
        ageGroupMin,
        ageGroupMax,
        gender,
        minValue,
        maxValue,
        optimalMin,
        optimalMax,
        criticalLow,
        criticalHigh,
        note,
        conditions,
        isActive
      },
      include: {
        indicator: true,
        methodology: true
      }
    });

    return NextResponse.json(referenceRange, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reference range:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
