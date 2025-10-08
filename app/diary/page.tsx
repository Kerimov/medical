'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Entry = {
  id: string
  entryDate: string
  mood?: number
  painScore?: number
  sleepHours?: number
  steps?: number
  temperature?: number
  weight?: number
  systolic?: number
  diastolic?: number
  pulse?: number
  symptoms?: string
  notes?: string
  tags: { tag: { id: string; name: string; color?: string } }[]
}

export default function DiaryPage() {
  const { token, user } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({ entryDate: new Date().toISOString().slice(0,16), mood: 3, painScore: 0, sleepHours: 8 })
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [tag, setTag] = useState('')

  const uniqueTags = useMemo(() => Array.from(new Set(entries.flatMap(e => e.tags.map(t => t.tag.name)))), [entries])

  async function fetchEntries() {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (tag) params.set('tag', tag)
    const res = await fetch(`/api/diary/entries?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setEntries(data)
    setLoading(false)
  }

  useEffect(() => { fetchEntries() }, [token])

  async function createEntry() {
    if (!token) return
    const payload = { ...form, tags: form.tags?.split(',').map((s: string) => s.trim()).filter(Boolean) }
    const res = await fetch('/api/diary/entries', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    if (res.ok) {
      setForm({ entryDate: new Date().toISOString().slice(0,16), mood: 3, painScore: 0, sleepHours: 8 })
      fetchEntries()
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Дневник здоровья</h1>
        <Button variant="outline" onClick={() => router.back()}>Назад</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новая запись</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Дата и время</Label>
            <Input type="datetime-local" value={form.entryDate} onChange={e => setForm({ ...form, entryDate: e.target.value })} />
          </div>
          <div>
            <Label>Настроение (1-5)</Label>
            <Input type="number" min={1} max={5} value={form.mood ?? ''} onChange={e => setForm({ ...form, mood: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Боль (0-10)</Label>
            <Input type="number" min={0} max={10} value={form.painScore ?? ''} onChange={e => setForm({ ...form, painScore: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Сон (часов)</Label>
            <Input type="number" step="0.1" value={form.sleepHours ?? ''} onChange={e => setForm({ ...form, sleepHours: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Шаги</Label>
            <Input type="number" value={form.steps ?? ''} onChange={e => setForm({ ...form, steps: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Температура</Label>
            <Input type="number" step="0.1" value={form.temperature ?? ''} onChange={e => setForm({ ...form, temperature: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Вес</Label>
            <Input type="number" step="0.1" value={form.weight ?? ''} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} />
          </div>
          <div>
            <Label>АД (систолическое/диастолическое)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Сист." value={form.systolic ?? ''} onChange={e => setForm({ ...form, systolic: Number(e.target.value) })} />
              <Input type="number" placeholder="Диаст." value={form.diastolic ?? ''} onChange={e => setForm({ ...form, diastolic: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Пульс</Label>
            <Input type="number" value={form.pulse ?? ''} onChange={e => setForm({ ...form, pulse: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <Label>Симптомы</Label>
            <Input value={form.symptoms ?? ''} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Заметки</Label>
            <Input value={form.notes ?? ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Теги (через запятую)</Label>
            <Input value={form.tags ?? ''} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="col-span-2 md:col-span-4">
            <Button onClick={createEntry}>Записать</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Записи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <Label>С</Label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <Label>По</Label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <div>
              <Label>Тег</Label>
              <Input list="tags" value={tag} onChange={e => setTag(e.target.value)} />
              <datalist id="tags">
                {uniqueTags.map(t => (<option key={t} value={t} />))}
              </datalist>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchEntries}>Фильтровать</Button>
            </div>
          </div>

          <div className="space-y-3">
            {entries.map(e => (
              <div key={e.id} className="p-3 border rounded-lg flex flex-wrap items-center justify-between">
                <div className="font-medium">{new Date(e.entryDate).toLocaleString()}</div>
                <div className="text-sm text-gray-600 flex gap-4">
                  {e.mood != null && <span>Настроение: {e.mood}</span>}
                  {e.painScore != null && <span>Боль: {e.painScore}</span>}
                  {e.sleepHours != null && <span>Сон: {e.sleepHours}ч</span>}
                  {e.steps != null && <span>Шаги: {e.steps}</span>}
                  {e.temperature != null && <span>t°: {e.temperature}°C</span>}
                  {e.weight != null && <span>Вес: {e.weight} кг</span>}
                  {(e.systolic != null || e.diastolic != null) && <span>АД: {e.systolic}/{e.diastolic}</span>}
                  {e.pulse != null && <span>Пульс: {e.pulse}</span>}
                </div>
                {(e.symptoms || e.notes) && <div className="w-full text-sm text-gray-700 mt-2">{e.symptoms || e.notes}</div>}
                {e.tags?.length > 0 && (
                  <div className="w-full mt-2 flex gap-2 flex-wrap">
                    {e.tags.map(t => (
                      <span key={t.tag.id} className="px-2 py-0.5 rounded text-xs border" style={{ borderColor: t.tag.color || '#CBD5E1' }}>{t.tag.name}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!loading && entries.length === 0 && (
              <div className="text-center text-gray-500">Записей пока нет</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


