'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Bell, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  TrendingUp,
  Trash2,
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface Reminder {
  id: string
  title: string
  description?: string
  dueAt: string
  recurrence: string
  channels: string
  analysis?: {
    id: string
    title: string
    type: string
  }
  document?: {
    id: string
    fileName: string
  }
  createdAt: string
}

export default function RemindersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchReminders()
    }
  }, [user])

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/reminders', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки напоминаний:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsCompleted = async (reminderId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Удаляем напоминание при выполнении (так как в схеме нет поля isCompleted)
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        fetchReminders() // Обновляем список
      }
    } catch (error) {
      console.error('Ошибка обновления напоминания:', error)
    }
  }

  const deleteReminder = async (reminderId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это напоминание?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        fetchReminders() // Обновляем список
      }
    } catch (error) {
      console.error('Ошибка удаления напоминания:', error)
    }
  }

  const getRecurrenceLabel = (recurrence: string) => {
    switch (recurrence) {
      case 'DAILY': return 'Ежедневно'
      case 'WEEKLY': return 'Еженедельно'
      case 'MONTHLY': return 'Ежемесячно'
      case 'YEARLY': return 'Ежегодно'
      case 'NONE': return 'Однократно'
      default: return recurrence
    }
  }

  const getRecurrenceColor = (recurrence: string) => {
    switch (recurrence) {
      case 'DAILY': return 'bg-blue-500'
      case 'WEEKLY': return 'bg-green-500'
      case 'MONTHLY': return 'bg-yellow-500'
      case 'YEARLY': return 'bg-purple-500'
      case 'NONE': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Загрузка напоминаний...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const upcomingReminders = reminders.filter(r => new Date(r.dueAt) > new Date())
  const overdueReminders = reminders.filter(r => new Date(r.dueAt) <= new Date())

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Напоминания</h1>
          <p className="text-muted-foreground">
            Управляйте своими медицинскими напоминаниями
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Добавить напоминание
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего</p>
                <p className="text-2xl font-bold">{reminders.length}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Предстоящие</p>
                <p className="text-2xl font-bold">{upcomingReminders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просроченные</p>
                <p className="text-2xl font-bold">{overdueReminders.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего активных</p>
                <p className="text-2xl font-bold">{reminders.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Просроченные напоминания */}
      {overdueReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Просроченные</h2>
          <div className="space-y-4">
            {overdueReminders.map((reminder) => (
              <Card key={reminder.id} className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(reminder.type)}
                        <h3 className="font-semibold">{reminder.title}</h3>
                        <Badge className={getPriorityColor(reminder.priority)}>
                          {getPriorityLabel(reminder.priority)}
                        </Badge>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {reminder.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Срок: {new Date(reminder.dueDate).toLocaleDateString('ru-RU')}</span>
                        <span>Тип: {getTypeLabel(reminder.type)}</span>
                        {reminder.analysis && (
                          <Link href={`/analyses/${reminder.analysis.id}`} className="text-primary hover:underline">
                            Связанный анализ
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => markAsCompleted(reminder.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Выполнено
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteReminder(reminder.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Предстоящие напоминания */}
      {upcomingReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Предстоящие</h2>
          <div className="space-y-4">
            {upcomingReminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(reminder.type)}
                        <h3 className="font-semibold">{reminder.title}</h3>
                        <Badge className={getPriorityColor(reminder.priority)}>
                          {getPriorityLabel(reminder.priority)}
                        </Badge>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {reminder.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Срок: {new Date(reminder.dueDate).toLocaleDateString('ru-RU')}</span>
                        <span>Тип: {getTypeLabel(reminder.type)}</span>
                        {reminder.analysis && (
                          <Link href={`/analyses/${reminder.analysis.id}`} className="text-primary hover:underline">
                            Связанный анализ
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => markAsCompleted(reminder.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Выполнено
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteReminder(reminder.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Выполненные напоминания */}
      {completedReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Выполненные</h2>
          <div className="space-y-4">
            {completedReminders.map((reminder) => (
              <Card key={reminder.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(reminder.type)}
                        <h3 className="font-semibold line-through">{reminder.title}</h3>
                        <Badge variant="secondary">Выполнено</Badge>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {reminder.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Срок: {new Date(reminder.dueDate).toLocaleDateString('ru-RU')}</span>
                        <span>Тип: {getTypeLabel(reminder.type)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => deleteReminder(reminder.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Пустое состояние */}
      {reminders.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет напоминаний</h3>
            <p className="text-muted-foreground mb-4">
              Создайте свое первое напоминание для отслеживания важных медицинских событий
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить напоминание
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
