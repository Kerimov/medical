'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { AIChat } from '@/components/AIChat'
import { 
  Activity, 
  Bell, 
  Calendar, 
  FileText, 
  Heart, 
  LogOut,
  Pill,
  TrendingUp,
  User
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [adminDocs, setAdminDocs] = useState<any[]>([])
  const [adminLoading, setAdminLoading] = useState(true)
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!(user && adminEmails.includes(user.email.toLowerCase()))

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const run = async () => {
      if (!user || !isAdmin) return
      try {
        setAdminLoading(true)
        // Берем токен из localStorage, если сохранен после логина
        const token = localStorage.getItem('token')
        if (!token) {
          setAdminLoading(false)
          return
        }
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setAdminUsers(data.users)
          setAdminDocs(data.documents)
        }
      } finally {
        setAdminLoading(false)
      }
    }
    run()
  }, [user, isAdmin])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Main Content (глобальный Header уже в layout) */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Добро пожаловать, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Управляйте своим здоровьем легко и эффективно
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Сегодня</p>
                  <p className="text-2xl font-bold">3/5</p>
                  <p className="text-xs text-muted-foreground">Лекарства</p>
                </div>
                <Pill className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ближайший</p>
                  <p className="text-2xl font-bold">15:30</p>
                  <p className="text-xs text-muted-foreground">Прием</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Пульс</p>
                  <p className="text-2xl font-bold">72</p>
                  <p className="text-xs text-muted-foreground">уд/мин</p>
                </div>
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Записей</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">В дневнике</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/reminders" className="block">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Напоминания</CardTitle>
                <CardDescription>
                  Настройте напоминания о приеме лекарств
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Управлять</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analyses" className="block">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Анализы</CardTitle>
                <CardDescription>
                  Просматривайте результаты ваших анализов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Открыть</Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-3" />
              <CardTitle>Записи к врачам</CardTitle>
              <CardDescription>
                Планируйте визиты и отслеживайте приемы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Открыть</Button>
            </CardContent>
          </Card>

            <Link href="/documents" className="block">
              <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Документы</CardTitle>
                  <CardDescription>
                    Храните анализы и медицинские документы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Открыть</Button>
                </CardContent>
              </Card>
            </Link>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-3" />
              <CardTitle>Дневник здоровья</CardTitle>
              <CardDescription>
                Отслеживайте симптомы и самочувствие
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Записать</Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-3" />
              <CardTitle>Аналитика</CardTitle>
              <CardDescription>
                Просматривайте статистику и графики
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Анализ</Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <User className="h-10 w-10 text-primary mb-3" />
              <CardTitle>Профиль</CardTitle>
              <CardDescription>
                Управляйте личными данными и настройками
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Настройки</Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin (read-only) */}
        {isAdmin && (
          <>
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Админ: Пользователи (read-only)</CardTitle>
                  <CardDescription>Доступно только при авторизации</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminLoading ? (
                    <div className="text-sm text-muted-foreground">Загрузка...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Имя</TableHead>
                          <TableHead>Создан</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.map(u => (
                          <TableRow key={u.id}>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{new Date(u.createdAt).toLocaleString('ru-RU')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Админ: Документы (read-only)</CardTitle>
                </CardHeader>
                <CardContent>
                  {adminLoading ? (
                    <div className="text-sm text-muted-foreground">Загрузка...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Файл</TableHead>
                          <TableHead>Тип</TableHead>
                          <TableHead>Размер</TableHead>
                          <TableHead>Пользователь</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Статус</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminDocs.map(d => (
                          <TableRow key={d.id}>
                            <TableCell>{d.fileName}</TableCell>
                            <TableCell>{d.fileType}</TableCell>
                            <TableCell>{(d.fileSize/1024).toFixed(1)} KB</TableCell>
                            <TableCell>{d.userId}</TableCell>
                            <TableCell>{new Date(d.uploadDate).toLocaleString('ru-RU')}</TableCell>
                            <TableCell>{d.parsed ? 'Обработан' : 'Новый'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Последняя активность</CardTitle>
              <CardDescription>Ваши недавние действия</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Принято лекарство "Аспирин"</p>
                    <p className="text-xs text-muted-foreground">2 часа назад</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Добавлена запись в дневник</p>
                    <p className="text-xs text-muted-foreground">Вчера в 18:30</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Загружен анализ крови</p>
                    <p className="text-xs text-muted-foreground">3 дня назад</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* AI Chat Assistant */}
      <AIChat />
    </div>
  )
}

