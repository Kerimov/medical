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
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-6 shadow-medical">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Добро пожаловать, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Управляйте своим здоровьем легко и эффективно
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Сегодня</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">3/5</p>
                  <p className="text-xs text-muted-foreground mt-1">Лекарства</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Pill className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ближайший</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">15:30</p>
                  <p className="text-xs text-muted-foreground mt-1">Прием</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Пульс</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">72</p>
                  <p className="text-xs text-muted-foreground mt-1">уд/мин</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Записей</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">12</p>
                  <p className="text-xs text-muted-foreground mt-1">В дневнике</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/reminders" className="block group">
            <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 cursor-pointer h-full group-hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                    <Bell className="h-8 w-8 text-primary" />
                  </div>
                  <div className="w-2 h-2 bg-medical-coral rounded-full animate-pulse"></div>
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">Напоминания</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Настройте напоминания о приеме лекарств
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full gradient-primary text-white hover:opacity-90 transition-opacity shadow-medical">
                  Управлять
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analyses" className="block group">
            <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 cursor-pointer h-full group-hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <div className="w-2 h-2 bg-medical-emerald rounded-full"></div>
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">Анализы</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Просматривайте результаты ваших анализов
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full gradient-primary text-white hover:opacity-90 transition-opacity shadow-medical">
                  Открыть
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 cursor-pointer group hover:scale-105">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <div className="w-2 h-2 bg-medical-amber rounded-full"></div>
              </div>
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">Записи к врачам</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Планируйте визиты и отслеживайте приемы
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full gradient-primary text-white hover:opacity-90 transition-opacity shadow-medical">
                Открыть
              </Button>
            </CardContent>
          </Card>

          <Link href="/documents" className="block group">
            <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 cursor-pointer h-full group-hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="w-2 h-2 bg-medical-blue rounded-full"></div>
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">Документы</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Храните анализы и медицинские документы
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full gradient-primary text-white hover:opacity-90 transition-opacity shadow-medical">
                  Открыть
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 cursor-pointer group hover:scale-105">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <div className="w-2 h-2 bg-medical-red rounded-full"></div>
              </div>
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">Дневник здоровья</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Отслеживайте симптомы и самочувствие
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full gradient-primary text-white hover:opacity-90 transition-opacity shadow-medical">
                Записать
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 cursor-pointer group hover:scale-105">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="w-2 h-2 bg-medical-green rounded-full"></div>
              </div>
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">Аналитика</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Просматривайте статистику и графики
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full gradient-primary text-white hover:opacity-90 transition-opacity shadow-medical">
                Анализ
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300 cursor-pointer group hover:scale-105">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="w-2 h-2 bg-medical-coral rounded-full"></div>
              </div>
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">Профиль</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Управляйте личными данными и настройками
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full gradient-primary text-white hover:opacity-90 transition-opacity shadow-medical">
                Настройки
              </Button>
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
          <Card className="glass-effect border-0 shadow-medical">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Последняя активность
              </CardTitle>
              <CardDescription className="text-base">Ваши недавние действия</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-green-50/50 border border-blue-100/50">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Принято лекарство "Аспирин"</p>
                    <p className="text-xs text-muted-foreground mt-1">2 часа назад</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-100/50">
                    <Pill className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-100/50">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Добавлена запись в дневник</p>
                    <p className="text-xs text-muted-foreground mt-1">Вчера в 18:30</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-100/50">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-100/50">
                  <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Загружен анализ крови</p>
                    <p className="text-xs text-muted-foreground mt-1">3 дня назад</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-100/50">
                    <FileText className="h-4 w-4 text-amber-600" />
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

