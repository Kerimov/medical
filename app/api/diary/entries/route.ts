import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = auth.replace('Bearer ', '')
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const tag = searchParams.get('tag')
  const order = (searchParams.get('order') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'

  const where: any = { userId: user.userId }
  if (from || to) where.entryDate = {
    gte: from ? new Date(from) : undefined,
    lte: to ? new Date(to) : undefined
  }
  if (tag) where.tags = { some: { tag: { name: tag } } }

  const entries = await prisma.healthDiaryEntry.findMany({
    where,
    include: { tags: { include: { tag: true } } },
    orderBy: { entryDate: order }
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = auth.replace('Bearer ', '')
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { entryDate, mood, painScore, sleepHours, steps, temperature, weight, systolic, diastolic, pulse, symptoms, notes, tags } = body

  const entry = await prisma.healthDiaryEntry.create({
    data: {
      userId: user.userId,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      mood, painScore, sleepHours, steps, temperature, weight, systolic, diastolic, pulse, symptoms, notes,
      tags: tags?.length ? {
        create: tags.map((name: string) => ({
          tag: {
            connectOrCreate: {
              where: { userId_name: { userId: user.userId, name } },
              create: { userId: user.userId, name }
            }
          }
        }))
      } : undefined
    },
    include: { tags: { include: { tag: true } } }
  })
  return NextResponse.json(entry, { status: 201 })
}

