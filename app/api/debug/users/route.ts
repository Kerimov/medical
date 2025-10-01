import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Отладочный эндпоинт (удалить в продакшене!)
export async function GET() {
  const users = db.users.getAll()
  
  return NextResponse.json({
    totalUsers: users.length,
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt
    }))
  })
}

