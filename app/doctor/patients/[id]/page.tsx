'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, FileText, Stethoscope, Pill, NotebookPen } from 'lucide-react'

interface PatientCardData {
  patient: { id: string; name: string; email: string; createdAt: string }
  patientRecord: any
  analyses: any[]
  recommendations: any[]
  appointments: any[]
  prescriptions: any[]
  notes: any[]
}

export default function PatientCardPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [data, setData] = useState<PatientCardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/doctor/patients/${params.id}`, { credentials: 'include' })
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка карточки пациента...</div>
      </div>
    )
  }

  if (!data) return null

  const { patient, patientRecord, analyses, recommendations, appointments, prescriptions, notes } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {patient.name}
          </h1>
          <p className="text-muted-foreground">{patient.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-effect border-0 shadow-medical lg:col-span-2">
            <CardHeader>
              <CardTitle>История анализов</CardTitle>
              <CardDescription>Последние результаты</CardDescription>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 ? (
                <div className="text-muted-foreground">Анализы не найдены</div>
              ) : (
                <div className="space-y-3">
                  {analyses.slice(0, 6).map((a) => (
                    <div key={a.id} className="p-3 rounded-lg bg-white/70 border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{a.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.document?.laboratory || 'Лаборатория —'} · {new Date(a.date).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/documents/${a.documentId || ''}`)}>Открыть</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical">
            <CardHeader>
              <CardTitle>Карточка пациента</CardTitle>
              <CardDescription>Сводная информация</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span>Тип записи</span><Badge>{patientRecord.recordType}</Badge></div>
                {patientRecord.diagnosis && (<div className="flex items-center justify-between"><span>Диагноз</span><span className="font-medium">{patientRecord.diagnosis}</span></div>)}
                {patientRecord.nextVisit && (<div className="flex items-center justify-between"><span>Следующий визит</span><span>{new Date(patientRecord.nextVisit).toLocaleString('ru-RU')}</span></div>)}
                <div className="flex items-center justify-between"><span>Статус</span><Badge variant="secondary">{patientRecord.status}</Badge></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="glass-effect border-0 shadow-medical lg:col-span-2">
            <CardHeader>
              <CardTitle>Рекомендации</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-muted-foreground">Нет рекомендаций</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {recommendations.slice(0, 6).map((r) => (
                    <div key={r.id} className="p-3 rounded-lg bg-white/70 border">
                      <div className="font-medium mb-1">{r.title}</div>
                      <div className="text-sm text-muted-foreground mb-2">{r.description}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">приоритет {r.priority}</Badge>
                        <Badge variant="secondary">{r.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical">
            <CardHeader>
              <CardTitle>Визиты и назначения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-2">Ближайшие визиты</div>
                  {appointments.slice(0, 3).map((v) => (
                    <div key={v.id} className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" /> {new Date(v.scheduledAt).toLocaleString('ru-RU')} · {v.status}
                    </div>
                  ))}
                  {appointments.length === 0 && <div className="text-sm text-muted-foreground">Нет визитов</div>}
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Рецепты</div>
                  {prescriptions.slice(0, 3).map((p) => (
                    <div key={p.id} className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                      <Pill className="w-4 h-4" /> {p.medication}, {p.dosage} · {p.frequency}
                    </div>
                  ))}
                  {prescriptions.length === 0 && <div className="text-sm text-muted-foreground">Нет активных рецептов</div>}
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Заметки</div>
                  {notes.slice(0, 3).map((n) => (
                    <div key={n.id} className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                      <NotebookPen className="w-4 h-4" /> {n.title}
                    </div>
                  ))}
                  {notes.length === 0 && <div className="text-sm text-muted-foreground">Нет заметок</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


