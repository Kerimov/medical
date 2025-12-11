import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Использует headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic';

// GET - Получить все методологии
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
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const methodologies = await prisma.methodology.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(methodologies);
  } catch (error: any) {
    console.error('Error fetching methodologies:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Создать новую методологию (только для админов)
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
      type,
      description,
      organization,
      country,
      version,
      effectiveFrom,
      source,
      isActive = true
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const methodology = await prisma.methodology.create({
      data: {
        name,
        type,
        description,
        organization,
        country,
        version,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : null,
        source,
        isActive
      }
    });

    return NextResponse.json(methodology, { status: 201 });
  } catch (error: any) {
    console.error('Error creating methodology:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
