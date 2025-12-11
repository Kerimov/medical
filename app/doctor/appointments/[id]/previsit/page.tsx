'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ClipboardList } from 'lucide-react'

export default function DoctorAppointmentPrevisitPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const { user, isLoading, token } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState<any | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const lsToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const auth = token || lsToken
        const res = await fetch(`/api/appointments/${params.id}/previsit`, {
          headers: auth ? { Authorization: `Bearer ${auth}` } : undefined,
          credentials: 'include'
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Ошибка')
        setQ(data?.questionnaire || null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка')
      } finally {
        setLoading(false)
      }
    })()
  }, [user, token, params.id])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка анкеты…</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Анкета перед визитом</h1>
            <p className="text-muted-foreground">Просмотр (read-only).</p>
          </div>
          <div className="flex gap-2">
            <Link href="/doctor">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
            </Link>
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <Card className="glass-effect border-0 shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Ответы
            </CardTitle>
            <CardDescription>
              {q?.submittedAt ? `Отправлено: ${new Date(q.submittedAt).toLocaleString('ru-RU')}` : 'Анкета не отправлена'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!q?.answers ? (
              <div className="text-sm text-muted-foreground">Нет данных анкеты.</div>
            ) : (
              Object.entries(q.answers).map(([k, v]) => (
                <div key={k} className="p-3 rounded border bg-white/70">
                  <div className="text-xs text-muted-foreground">{k}</div>
                  <div className="text-sm whitespace-pre-wrap">{typeof v === 'string' ? v : JSON.stringify(v, null, 2)}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


