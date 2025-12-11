'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { CheckCircle2, PauseCircle, RotateCcw, ShieldAlert, CalendarClock, ClipboardList } from 'lucide-react'

type TaskStatus = 'ACTIVE' | 'SNOOZED' | 'COMPLETED'

type Task = {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  dueAt?: string | null
  snoozedUntil?: string | null
  analysis?: { id: string; title: string; date: string; status: string } | null
  document?: { id: string; fileName: string } | null
  checkIns?: Array<{ id: string; type: string; reason?: string | null; createdAt: string }>
  createdAt: string
}

function statusLabel(s: TaskStatus) {
  if (s === 'ACTIVE') return 'Активно'
  if (s === 'SNOOZED') return 'Отложено'
  return 'Выполнено'
}

function statusBadge(s: TaskStatus) {
  if (s === 'ACTIVE') return <Badge className="bg-blue-100 text-blue-800">Активно</Badge>
  if (s === 'SNOOZED') return <Badge className="bg-yellow-100 text-yellow-800">Отложено</Badge>
  return <Badge className="bg-green-100 text-green-800">Выполнено</Badge>
}

export default function CarePlanPage() {
  const { user, isLoading, token } = useAuth()
  const router = useRouter()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [reasonOpen, setReasonOpen] = useState<{ taskId: string; mode: 'snooze' | 'note' } | null>(null)
  const [reasonText, setReasonText] = useState('')
  const [snoozeUntil, setSnoozeUntil] = useState<string>('') // YYYY-MM-DD
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  async function fetchTasks() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/care-plan/tasks', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка')
      setTasks(Array.isArray(data?.tasks) ? data.tasks : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && token) fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token])

  const grouped = useMemo(() => {
    const by: Record<TaskStatus, Task[]> = { ACTIVE: [], SNOOZED: [], COMPLETED: [] }
    for (const t of tasks) by[t.status]?.push(t)
    return by
  }, [tasks])

  async function patchTask(taskId: string, body: any) {
    if (!token) return
    setBusyId(taskId)
    try {
      const res = await fetch(`/api/care-plan/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка')
      await fetchTasks()
    } finally {
      setBusyId(null)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  if (!user) return null

  const total = tasks.length
  const active = grouped.ACTIVE.length
  const snoozed = grouped.SNOOZED.length
  const done = grouped.COMPLETED.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">План действий</h1>
            <p className="text-muted-foreground">Доска задач: статус, дедлайны, чек‑ины (“почему не сделано”).</p>
          </div>
          <Link href="/analyses">
            <Button variant="outline" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Перейти к анализам
            </Button>
          </Link>
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Всего</div>
                  <div className="text-2xl font-semibold">{total}</div>
                </div>
                <ShieldAlert className="h-7 w-7 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Активно</div>
              <div className="text-2xl font-semibold">{active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Отложено</div>
              <div className="text-2xl font-semibold">{snoozed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Выполнено</div>
              <div className="text-2xl font-semibold">{done}</div>
            </CardContent>
          </Card>
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['ACTIVE', 'SNOOZED', 'COMPLETED'] as TaskStatus[]).map((st) => (
            <Card key={st} className="bg-white/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{statusLabel(st)}</span>
                  <Badge variant="secondary">{grouped[st].length}</Badge>
                </CardTitle>
                <CardDescription>
                  {st === 'ACTIVE' ? 'Сделать' : st === 'SNOOZED' ? 'Пауза/отложено' : 'Закрыто'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {grouped[st].length === 0 ? (
                  <div className="text-sm text-muted-foreground">Пусто</div>
                ) : (
                  grouped[st].map((t) => {
                    const last = Array.isArray(t.checkIns) && t.checkIns.length > 0 ? t.checkIns[0] : null
                    const due = t.snoozedUntil || t.dueAt
                    return (
                      <div key={t.id} className="p-4 border rounded-lg bg-background/60 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{t.title}</div>
                            {t.description ? (
                              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{t.description}</div>
                            ) : null}
                          </div>
                          {statusBadge(t.status)}
                        </div>

                        {due ? (
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <CalendarClock className="h-4 w-4" />
                            {t.snoozedUntil ? 'Отложено до' : 'Срок'}: {new Date(due).toLocaleDateString('ru-RU')}
                          </div>
                        ) : null}

                        {(t.analysis || t.document) && (
                          <div className="text-xs text-muted-foreground">
                            {t.analysis ? (
                              <Link href={`/analyses/${t.analysis.id}`} className="hover:underline text-primary">
                                Анализ: {t.analysis.title}
                              </Link>
                            ) : null}
                            {t.document ? (
                              <span>
                                {' '}
                                <Link href={`/documents/${t.document.id}`} className="hover:underline text-primary">
                                  Документ: {t.document.fileName}
                                </Link>
                              </span>
                            ) : null}
                          </div>
                        )}

                        {last?.reason ? (
                          <div className="text-xs text-muted-foreground">
                            Последний чек‑ин: <span className="text-foreground">{last.reason}</span>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-2 pt-1">
                          {t.status !== 'COMPLETED' && (
                            <Button
                              size="sm"
                              disabled={busyId === t.id}
                              onClick={() => patchTask(t.id, { action: 'complete', reason: 'Сделано' })}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Готово
                            </Button>
                          )}
                          {t.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === t.id}
                              onClick={() => {
                                setReasonOpen({ taskId: t.id, mode: 'snooze' })
                                setReasonText('')
                                setSnoozeUntil('')
                              }}
                              className="flex items-center gap-2"
                            >
                              <PauseCircle className="h-4 w-4" />
                              Отложить
                            </Button>
                          )}
                          {t.status !== 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === t.id}
                              onClick={() => patchTask(t.id, { action: 'reopen', reason: 'Возобновлено' })}
                              className="flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              В работу
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Snooze modal (simple inline card) */}
        {reasonOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center p-4 z-50">
            <Card className="w-full max-w-xl bg-white">
              <CardHeader>
                <CardTitle>Почему не сделано?</CardTitle>
                <CardDescription>Это нужно для истории и улучшения плана.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Причина *</div>
                  <Input value={reasonText} onChange={(e) => setReasonText(e.target.value)} placeholder="Напр. не успел, нет записи к врачу, жду результаты..." />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Отложить до (опционально)</div>
                  <Input type="date" value={snoozeUntil} onChange={(e) => setSnoozeUntil(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      await patchTask(reasonOpen.taskId, {
                        action: 'snooze',
                        reason: reasonText,
                        snoozedUntil: snoozeUntil ? new Date(snoozeUntil).toISOString() : null
                      })
                      setReasonOpen(null)
                    }}
                  >
                    Сохранить
                  </Button>
                  <Button variant="outline" onClick={() => setReasonOpen(null)}>
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}


