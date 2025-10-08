import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Получить конкретный нормативный диапазон
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

    const referenceRange = await prisma.referenceRange.findUnique({
      where: { id: params.id },
      include: {
        indicator: {
          include: {
            studyType: true
          }
        },
        methodology: true
      }
    });

    if (!referenceRange) {
      return NextResponse.json({ error: 'Reference range not found' }, { status: 404 });
    }

    return NextResponse.json(referenceRange);
  } catch (error: any) {
    console.error('Error fetching reference range:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Обновить нормативный диапазон (только для админов)
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

    const referenceRange = await prisma.referenceRange.update({
      where: { id: params.id },
      data: body,
      include: {
        indicator: true,
        methodology: true
      }
    });

    return NextResponse.json(referenceRange);
  } catch (error: any) {
    console.error('Error updating reference range:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Удалить нормативный диапазон (только для админов)
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

    await prisma.referenceRange.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Reference range deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting reference range:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
