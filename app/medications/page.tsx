'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

type Medication = {
  id: string
  name: string
  dosage?: string | null
  frequencyPerDay?: number | null
  times?: any
  notes?: string | null
  isSupplement: boolean
  createdAt: string
}

export default function MedicationsPage() {
  const { user, isLoading, token } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [meds, setMeds] = useState<Medication[]>([])
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<any>({
    name: '',
    dosage: '',
    frequencyPerDay: 1,
    times: '',
    notes: '',
    isSupplement: false
  })

  const [planBusy, setPlanBusy] = useState(false)
  const [plan, setPlan] = useState<any | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  async function fetchMeds() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/medications', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка')
      setMeds(Array.isArray(data?.medications) ? data.medications : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && token) fetchMeds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token])

  async function createMedication() {
    if (!token) return
    if (!form.name?.trim()) return alert('Введите название')
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          dosage: form.dosage || null,
          frequencyPerDay: Number(form.frequencyPerDay) || 1,
          times: form.times || undefined,
          notes: form.notes || null,
          isSupplement: !!form.isSupplement
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка создания')
      setForm({ name: '', dosage: '', frequencyPerDay: 1, times: '', notes: '', isSupplement: false })
      await fetchMeds()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  async function deleteMedication(id: string) {
    if (!token) return
    if (!confirm('Удалить препарат?')) return
    try {
      const res = await fetch(`/api/medications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка удаления')
      setMeds((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  async function generatePlanAndReminders() {
    if (!token) return
    try {
      setPlanBusy(true)
      setPlanError(null)
      setPlan(null)
      const res = await fetch('/api/ai/medications/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          createReminders: true,
          channels: ['PUSH']
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка плана')
      setPlan(data?.result || null)
      await fetchMeds()
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setPlanBusy(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Загрузка...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Лекарства</h1>
          <p className="text-muted-foreground">Список препаратов/БАДов + проверка взаимодействий + расписание → напоминания.</p>
        </div>
        <Link href="/reminders">
          <Button variant="outline">Открыть напоминания</Button>
        </Link>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Добавить</CardTitle>
          <CardDescription>Введите как на упаковке (желательно международное наименование в скобках).</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label>Название *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Напр. Метформин (metformin)" />
          </div>
          <div>
            <Label>Дозировка</Label>
            <Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="500 мг" />
          </div>
          <div>
            <Label>Кратность в день</Label>
            <Input type="number" min={1} max={6} value={form.frequencyPerDay} onChange={(e) => setForm({ ...form, frequencyPerDay: Number(e.target.value) })} />
          </div>
          <div className="md:col-span-2">
            <Label>Время (опционально)</Label>
            <Input value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })} placeholder="08:00, 20:00" />
          </div>
          <div>
            <Label>БАД</Label>
            <div className="flex items-center gap-2 h-9">
              <input type="checkbox" checked={!!form.isSupplement} onChange={(e) => setForm({ ...form, isSupplement: e.target.checked })} />
              <span className="text-sm text-muted-foreground">Да</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <Label>Заметки</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="После еды / натощак / курс..." />
          </div>
          <div className="md:col-span-3 flex gap-2">
            <Button onClick={createMedication}>Добавить</Button>
            <Button variant="outline" onClick={() => setForm({ name: '', dosage: '', frequencyPerDay: 1, times: '', notes: '', isSupplement: false })}>
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Список</CardTitle>
              <CardDescription>Для расписания и напоминаний используем кратность/время.</CardDescription>
            </div>
            <Button onClick={generatePlanAndReminders} disabled={planBusy || meds.length === 0}>
              {planBusy ? 'Проверяю...' : 'Проверить + создать напоминания'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {meds.length === 0 ? (
            <div className="text-sm text-muted-foreground">Пока пусто</div>
          ) : (
            <div className="space-y-2">
              {meds.map((m) => {
                const times = Array.isArray(m.times) ? m.times : []
                return (
                  <div key={m.id} className="p-3 border rounded-md flex flex-col md:flex-row md:items-center gap-2 justify-between">
                    <div>
                      <div className="font-medium">
                        {m.name} {m.isSupplement ? <span className="text-xs text-muted-foreground">(БАД)</span> : null}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {[m.dosage, m.frequencyPerDay ? `${m.frequencyPerDay}×/день` : null, times.length ? `время: ${times.join(', ')}` : null]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                      {m.notes ? <div className="text-sm mt-1">{m.notes}</div> : null}
                    </div>
                    <div>
                      <Button variant="outline" onClick={() => deleteMedication(m.id)}>Удалить</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {planError && <div className="text-sm text-destructive mt-4">{planError}</div>}
          {plan && (
            <div className="mt-4 space-y-3">
              <div className="text-sm">
                <div className="font-medium">Результат</div>
                <div className="whitespace-pre-wrap">{plan.tldr}</div>
              </div>
              {Array.isArray(plan.warnings) && plan.warnings.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Предупреждения</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {plan.warnings.slice(0, 12).map((w: any, idx: number) => (
                      <li key={idx}>{w.text || String(w)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(plan.schedule) && plan.schedule.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Расписание</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {plan.schedule.slice(0, 20).map((s: any, idx: number) => (
                      <li key={idx}>
                        {s.name}: {(Array.isArray(s.times) ? s.times : []).join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(plan.createdReminders) && plan.createdReminders.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Создано напоминаний: {plan.createdReminders.length}. Проверьте в разделе “Напоминания”.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


