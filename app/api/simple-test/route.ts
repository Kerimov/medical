import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'GET works' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      message: 'POST works',
      receivedData: body
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'POST failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
