'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  FileText, 
  Calendar, 
  Stethoscope, 
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus,
  FilePlus,
  CalendarPlus
} from 'lucide-react'
import Link from 'next/link'

interface DoctorStats {
  totalPatients: number
  activePatients: number
  todayAppointments: number
  pendingAppointments: number
  totalPrescriptions: number
  activePrescriptions: number
  recentPatients: any[]
  upcomingAppointments: any[]
  urgentNotes: any[]
}

export default function DoctorDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DoctorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [doctorAppointments, setDoctorAppointments] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      checkDoctorProfile()
    }
  }, [user, isLoading, router])

  const checkDoctorProfile = async () => {
    try {
      // Если у пользователя роль не DOCTOR — сразу направляем в онбординг
      if (user?.role !== 'DOCTOR') {
        router.push('/doctor/setup')
        return
      }

      // Передаём токен, чтобы не зависеть от cookie
      const lsToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const token = lsToken || undefined

      const response = await fetch('/api/doctor/profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchDoctorStats()
      } else {
        router.push('/doctor/setup')
      }
    } catch (error) {
      console.error('Error checking doctor profile:', error)
      router.push('/doctor/setup')
    }
  }

  const fetchDoctorStats = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      const response = await fetch('/api/doctor/stats', { headers, credentials: 'include' })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
      // Параллельно подтягиваем все будущие приемы врача из отдельного эндпоинта
      try {
        const apptsRes = await fetch('/api/doctor/appointments', { headers, credentials: 'include' })
        if (apptsRes.ok) {
          const { appointments } = await apptsRes.json()
          const all = Array.isArray(appointments) ? appointments.slice() : []
          all.sort((a: any, b: any) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
          setDoctorAppointments(all)
        }
      } catch (e) {
        console.warn('Failed to load doctor appointments', e)
      }
    } catch (error) {
      console.error('Error fetching doctor stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Личный кабинет врача
              </h1>
              <p className="text-gray-600 mt-2">
                Добро пожаловать, доктор {user.name}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/doctor/patients/new">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Новый пациент
                </Button>
              </Link>
              <Link href="/doctor/appointments/new">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Запись на прием
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Всего пациентов</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stats?.totalPatients || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Активных: {stats?.activePatients || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Приемы сегодня</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats?.todayAppointments || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ожидают: {stats?.pendingAppointments || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Рецепты</CardTitle>
              <Stethoscope className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats?.totalPrescriptions || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Активных: {stats?.activePrescriptions || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Срочные заметки</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {stats?.urgentNotes?.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Требуют внимания
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Patients */}
          <Card className="glass-effect border-0 shadow-medical">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Последние пациенты
              </CardTitle>
              <CardDescription>
                Недавно добавленные или обновленные записи
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentPatients?.length ? (
                <div className="space-y-4">
                  {stats.recentPatients.map((patient: any) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">{patient.recordType}</p>
                        </div>
                      </div>
                      <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                        {patient.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Пока нет пациентов</p>
                </div>
              )}
              <div className="mt-4">
                <Link href="/doctor/patients">
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Все пациенты
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card className="glass-effect border-0 shadow-medical">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Расписание приемов
              </CardTitle>
              <CardDescription>Все визиты пациентов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-green-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Время</TableHead>
                      <TableHead>Пациент</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorAppointments.length ? (
                      doctorAppointments.map((a: any) => (
                        <TableRow key={a.id}>
                          <TableCell>{new Date(a.scheduledAt).toLocaleDateString('ru-RU')}</TableCell>
                          <TableCell>{new Date(a.scheduledAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                          <TableCell>{a.patientName || '—'}</TableCell>
                          <TableCell>{a.appointmentType || '—'}</TableCell>
                          <TableCell>
                            {a.status === 'cancelled' ? (
                              <Badge className="bg-red-100 text-red-800 border border-red-200">cancelled</Badge>
                            ) : a.status === 'rescheduled' ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">rescheduled</Badge>
                            ) : a.status === 'confirmed' ? (
                              <Badge className="bg-green-600 text-white">confirmed</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 border border-green-200">{a.status || 'scheduled'}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/doctor/patients/${a.patientId}`} className="text-primary hover:underline">Карточка</Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">Нет запланированных приемов</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Link href="/doctor/appointments">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Все приемы
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="glass-effect border-0 shadow-medical">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Быстрые действия
              </CardTitle>
              <CardDescription>
                Часто используемые функции
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/doctor/patients">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                    <Users className="w-6 h-6 text-blue-600" />
                    <span>Пациенты</span>
                  </Button>
                </Link>
                <Link href="/doctor/analyses">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-all duration-300">
                    <FileText className="w-6 h-6 text-green-600" />
                    <span>Анализы</span>
                  </Button>
                </Link>
                <Link href="/doctor/prescriptions">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300">
                    <Stethoscope className="w-6 h-6 text-purple-600" />
                    <span>Рецепты</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
