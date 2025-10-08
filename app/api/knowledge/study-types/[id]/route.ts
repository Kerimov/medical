import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Получить конкретный тип исследования
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

    const studyType = await prisma.studyType.findUnique({
      where: { id: params.id },
      include: {
        indicators: {
          include: {
            referenceRanges: {
              include: {
                methodology: true
              }
            }
          }
        }
      }
    });

    if (!studyType) {
      return NextResponse.json({ error: 'Study type not found' }, { status: 404 });
    }

    return NextResponse.json(studyType);
  } catch (error: any) {
    console.error('Error fetching study type:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Обновить тип исследования (только для админов)
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
    const {
      name,
      nameEn,
      code,
      category,
      description,
      clinicalSignificance,
      preparation,
      biomaterial,
      isActive
    } = body;

    const studyType = await prisma.studyType.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(code !== undefined && { code }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(clinicalSignificance !== undefined && { clinicalSignificance }),
        ...(preparation !== undefined && { preparation }),
        ...(biomaterial !== undefined && { biomaterial }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(studyType);
  } catch (error: any) {
    console.error('Error updating study type:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Удалить тип исследования (только для админов)
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

    await prisma.studyType.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Study type deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting study type:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
