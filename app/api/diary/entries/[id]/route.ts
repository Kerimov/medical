import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = auth.replace('Bearer ', '')
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { entryDate, mood, painScore, sleepHours, steps, temperature, weight, systolic, diastolic, pulse, symptoms, notes, tags } = body

  const updated = await prisma.healthDiaryEntry.update({
    where: { id: params.id },
    data: {
      entryDate: entryDate ? new Date(entryDate) : undefined,
      mood, painScore, sleepHours, steps, temperature, weight, systolic, diastolic, pulse, symptoms, notes,
      ...(tags ? { tags: {
        deleteMany: {},
        create: tags.map((name: string) => ({
          tag: {
            connectOrCreate: {
              where: { userId_name: { userId: user.userId, name } },
              create: { userId: user.userId, name }
            }
          }
        }))
      } } : {})
    },
    include: { tags: { include: { tag: true } } }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = auth.replace('Bearer ', '')
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.healthDiaryEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}

