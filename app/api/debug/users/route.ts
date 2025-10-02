import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Отладочный эндпоинт (удалить в продакшене!)
export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  })
  
  return NextResponse.json({
    totalUsers: users.length,
    users: users
  })
}

