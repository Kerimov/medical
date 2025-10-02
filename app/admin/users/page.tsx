'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  Calendar,
  Mail,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
  documentsCount: number
  analysesCount: number
  remindersCount: number
  recommendationsCount: number
}

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!(user && adminEmails.includes(user.email.toLowerCase()))

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (!isLoading && user && !isAdmin) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router, isAdmin])

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !isAdmin) return
      
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user, isAdmin])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка пользователей...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full gradient-primary shadow-medical">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Управление пользователями
              </h1>
              <p className="text-muted-foreground">
                Просмотр и управление пользователями системы
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск пользователей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredUsers.length} пользователей
            </Badge>
          </div>
        </div>

        {/* Users Table */}
        <Card className="glass-effect border-0 shadow-medical">
          <CardHeader>
            <CardTitle className="text-xl">Список пользователей</CardTitle>
            <CardDescription>
              Все зарегистрированные пользователи системы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Активность</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Документы:</span>
                            <Badge variant="outline" className="text-xs">
                              {user.documentsCount}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Анализы:</span>
                            <Badge variant="outline" className="text-xs">
                              {user.analysesCount}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Напоминания:</span>
                            <Badge variant="outline" className="text-xs">
                              {user.remindersCount}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // TODO: Редактирование пользователя
                              alert('Функция редактирования будет добавлена')
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl glass-effect border-0 shadow-medical-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Детали пользователя</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                      <p className="text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
                      <p className="text-2xl font-bold text-primary">{selectedUser.documentsCount}</p>
                      <p className="text-sm text-muted-foreground">Документы</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
                      <p className="text-2xl font-bold text-primary">{selectedUser.analysesCount}</p>
                      <p className="text-sm text-muted-foreground">Анализы</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
                      <p className="text-2xl font-bold text-primary">{selectedUser.remindersCount}</p>
                      <p className="text-sm text-muted-foreground">Напоминания</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
                      <p className="text-2xl font-bold text-primary">{selectedUser.recommendationsCount}</p>
                      <p className="text-sm text-muted-foreground">Рекомендации</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>ID:</strong> {selectedUser.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Дата регистрации:</strong> {new Date(selectedUser.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
