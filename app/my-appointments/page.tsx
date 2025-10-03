'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface Doctor {
  id: string
  name: string
  email: string
  specialization: string
  experience: number
  education: string
  phone?: string
  clinic?: string
  consultationFee?: number
}

interface Appointment {
  id: string
  doctorId: string
  patientId: string
  patientName: string
  patientPhone?: string
  patientEmail?: string
  appointmentType: string
  scheduledAt: string
  duration: number
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  doctor: {
    id: string
    specialization: string
    experience: number
    education: string
    phone?: string
    clinic?: string
    consultationFee?: number
    user: {
      name: string
      email: string
    }
  }
}

export default function MyAppointmentsPage() {
  const { user: currentUser, isLoading, token } = useAuth()
  const router = useRouter()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const isPatient = !!(currentUser && currentUser.role === 'PATIENT')

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login')
    } else if (!isLoading && currentUser && !isPatient) {
      router.push('/dashboard')
    }
  }, [currentUser, isLoading, router, isPatient])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token || !isPatient) return
      
      try {
        const response = await fetch('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments)
        } else {
          const error = await response.json()
          setMessage({ type: 'error', text: error.error || 'Ошибка при загрузке записей' })
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Ошибка при загрузке записей' })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [token, isPatient])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Запланировано</Badge>
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Подтверждено</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">Завершено</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Отменено</Badge>
      case 'no_show':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Не явился</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Консультация'
      case 'follow_up':
        return 'Повторный прием'
      case 'routine':
        return 'Плановый осмотр'
      case 'emergency':
        return 'Срочный прием'
      default:
        return type
    }
  }

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date()
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка записей...</p>
        </div>
      </div>
    )
  }

  if (!isPatient) {
    return null
  }

  const upcomingAppointments = appointments.filter(app => isUpcoming(app.scheduledAt))
  const pastAppointments = appointments.filter(app => !isUpcoming(app.scheduledAt))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full gradient-primary shadow-medical">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Мои записи
              </h1>
              <p className="text-muted-foreground">
                Управление записями на прием к врачу
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Link href="/appointments">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Записаться на прием
              </Button>
            </Link>
          </div>
        </div>

        {/* Message */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Предстоящие записи</h2>
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="glass-effect border-0 shadow-medical">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.doctor.user.name}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.doctor.specialization}</p>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(appointment.scheduledAt).toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(appointment.scheduledAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getAppointmentTypeLabel(appointment.appointmentType)}</span>
                      </div>
                    </div>

                    {appointment.doctor.clinic && (
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{appointment.doctor.clinic}</span>
                      </div>
                    )}

                    {appointment.doctor.phone && (
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{appointment.doctor.phone}</span>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Примечание:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-700">История записей</h2>
            <div className="grid gap-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="glass-effect border-0 shadow-medical opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.doctor.user.name}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.doctor.specialization}</p>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(appointment.scheduledAt).toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(appointment.scheduledAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getAppointmentTypeLabel(appointment.appointmentType)}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Примечание:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Appointments */}
        {appointments.length === 0 && (
          <Card className="glass-effect border-0 shadow-medical">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">У вас пока нет записей</h3>
              <p className="text-muted-foreground mb-6">
                Запишитесь на прием к врачу, чтобы увидеть их здесь
              </p>
              <Link href="/appointments">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  Записаться на прием
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
