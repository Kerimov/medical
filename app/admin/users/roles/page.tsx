'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Shield, 
  Stethoscope, 
  User, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  createdAt: string
  doctorProfile?: {
    specialization: string
    isVerified: boolean
  }
}

export default function UserRolesPage() {
  const { user: currentUser, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login')
      return
    }

    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    if (currentUser && currentUser.role === 'ADMIN') {
      fetchUsers()
    }
  }, [currentUser, isLoading, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/roles')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        setMessage({ type: 'error', text: 'Ошибка при загрузке пользователей' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при загрузке пользователей' })
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/users/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(u => u.id === userId ? updatedUser : u))
        setMessage({ type: 'success', text: 'Роль пользователя успешно обновлена' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Ошибка при обновлении роли' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при обновлении роли' })
    } finally {
      setUpdating(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'DOCTOR':
        return <Stethoscope className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'DOCTOR':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Администратор'
      case 'DOCTOR':
        return 'Врач'
      default:
        return 'Пациент'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Управление ролями пользователей</h1>
        <p className="text-muted-foreground">
          Назначайте роли пользователям системы: пациент, врач или администратор
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Список пользователей
          </CardTitle>
          <CardDescription>
            Всего пользователей: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                  {user.doctorProfile && (
                    <p className="text-xs text-blue-600 mt-1">
                      Специализация: {user.doctorProfile.specialization}
                      {user.doctorProfile.isVerified && ' ✓'}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value) => updateUserRole(user.id, value)}
                    disabled={updating === user.id || (currentUser && currentUser.id === user.id)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PATIENT">Пациент</SelectItem>
                      <SelectItem value="DOCTOR">Врач</SelectItem>
                      <SelectItem value="ADMIN">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {updating === user.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
