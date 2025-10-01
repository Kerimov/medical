import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Эндпоинт для очистки базы данных (только для разработки!)
export async function POST() {
  const usersBefore = db.users.getAll().length
  db.users.clear()
  
  return NextResponse.json({
    message: 'Database cleared successfully',
    usersBefore,
    usersAfter: 0
  })
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST request to clear database',
    currentUsers: db.users.getAll().length
  })
}

