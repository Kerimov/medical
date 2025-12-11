import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Использует headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic';

// GET - Получить конкретный показатель
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const indicator = await prisma.indicator.findUnique({
      where: { id: params.id },
      include: {
        studyType: true,
        referenceRanges: {
          include: {
            methodology: true
          }
        }
      }
    });

    if (!indicator) {
      return NextResponse.json({ error: 'Indicator not found' }, { status: 404 });
    }

    return NextResponse.json(indicator);
  } catch (error: any) {
    console.error('Error fetching indicator:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Обновить показатель (только для админов)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const indicator = await prisma.indicator.update({
      where: { id: params.id },
      data: body,
      include: {
        studyType: true
      }
    });

    return NextResponse.json(indicator);
  } catch (error: any) {
    console.error('Error updating indicator:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Удалить показатель (только для админов)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await prisma.indicator.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Indicator deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting indicator:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
