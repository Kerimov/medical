import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Использует headers, помечаем маршрут как динамический
export const dynamic = 'force-dynamic';

// GET - Получить конкретную методологию
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

    const methodology = await prisma.methodology.findUnique({
      where: { id: params.id },
      include: {
        referenceRanges: {
          include: {
            indicator: {
              include: {
                studyType: true
              }
            }
          }
        }
      }
    });

    if (!methodology) {
      return NextResponse.json({ error: 'Methodology not found' }, { status: 404 });
    }

    return NextResponse.json(methodology);
  } catch (error: any) {
    console.error('Error fetching methodology:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Обновить методологию (только для админов)
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
    const { effectiveFrom, ...rest } = body;

    const methodology = await prisma.methodology.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(effectiveFrom && { effectiveFrom: new Date(effectiveFrom) })
      }
    });

    return NextResponse.json(methodology);
  } catch (error: any) {
    console.error('Error updating methodology:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Удалить методологию (только для админов)
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

    await prisma.methodology.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Methodology deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting methodology:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
