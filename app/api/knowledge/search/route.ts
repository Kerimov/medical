import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { MedicalSourcesManager } from '@/lib/medical-sources';

const sourcesManager = new MedicalSourcesManager();

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { query, sources } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log(`🔍 Searching knowledge for: "${query}"`);
    console.log(`📚 Sources: ${sources ? sources.join(', ') : 'all'}`);

    // Поиск знаний в источниках
    const results = await sourcesManager.searchKnowledge(query, sources);

    console.log(`✅ Found ${results.length} knowledge sources`);

    return NextResponse.json({
      success: true,
      query,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in knowledge search:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Получение доступных источников
    const sources = sourcesManager.getAvailableSources();

    return NextResponse.json({
      success: true,
      sources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting sources:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
