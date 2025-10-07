'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientEmail?: string
  scheduledAt: string
  status: string
  appointmentType?: string
}

export default function DoctorAppointmentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }
    if (user) fetchAppointments()
  }, [user, isLoading])

  const fetchAppointments = async () => {
    try {
      const lsToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch('/api/doctor/appointments', {
        headers: lsToken ? { Authorization: `Bearer ${lsToken}` } : undefined,
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const viewPatientAnalyses = (patientId: string) => {
    // Переходим на список анализов, отфильтрованный по пациенту
    router.push(`/doctor/analyses?patientId=${encodeURIComponent(patientId)}`)
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка приемов...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Приемы</h1>
          <p className="text-muted-foreground">Всего: {appointments.length}</p>
        </div>

        <div className="space-y-4">
          {appointments.map(appt => (
            <Card key={appt.id} className="glass-effect border-0 shadow-medical">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{new Date(appt.scheduledAt).toLocaleString('ru-RU')}</CardTitle>
                      <CardDescription>
                        <span className="inline-flex items-center gap-1"><User className="w-4 h-4" /> {appt.patientName}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={appt.status === 'confirmed' ? 'default' : 'secondary'}>
                    {appt.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Тип: {appt.appointmentType || '—'}</div>
                  <div className="flex gap-2">
                    <Link href={`/doctor/patients/${appt.patientId}`}>
                      <Button size="sm" className="gradient-primary text-white">
                        Открыть карточку <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {appointments.length === 0 && (
            <Card className="glass-effect border-0 shadow-medical">
              <CardContent className="py-12 text-center text-muted-foreground">Нет запланированных приемов</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


