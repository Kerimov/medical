import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received data:', body)
    
    return NextResponse.json({
      message: 'Simple registration test successful',
      receivedData: body
    })
  } catch (error) {
    console.error('Simple registration error:', error)
    return NextResponse.json(
      { 
        error: 'Simple registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
