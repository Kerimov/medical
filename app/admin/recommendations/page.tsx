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
  Heart, 
  Search, 
  Eye, 
  Edit,
  Trash2,
  User,
  Calendar,
  ArrowLeft,
  Building2,
  TrendingUp,
  TestTube,
  Pill,
  AlertCircle,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'

interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  reason: string
  priority: number
  status: string
  createdAt: string
  userId: string
  user: {
    name: string
    email: string
  }
  company?: {
    id: string
    name: string
    type: string
  }
  product?: {
    id: string
    name: string
    price: number
    currency: string
  }
}

const recommendationTypes = {
  ANALYSIS: { label: 'Анализ', icon: TestTube, color: 'bg-blue-100 text-blue-800' },
  SERVICE: { label: 'Услуга', icon: Heart, color: 'bg-red-100 text-red-800' },
  SUPPLEMENT: { label: 'БАД', icon: Pill, color: 'bg-green-100 text-green-800' },
  ARTICLE: { label: 'Статья', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800' },
  PRODUCT: { label: 'Товар', icon: ShoppingBag, color: 'bg-purple-100 text-purple-800' }
}

const getPriorityColor = (priority: number) => {
  if (priority >= 4) return 'bg-red-100 text-red-800'
  if (priority >= 3) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getPriorityLabel = (priority: number) => {
  if (priority >= 4) return 'Высокий'
  if (priority >= 3) return 'Средний'
  return 'Низкий'
}

export default function AdminRecommendationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  
  const isAdmin = !!(user && user.role === 'ADMIN')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (!isLoading && user && !isAdmin) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router, isAdmin])

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || !isAdmin) return
      
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/admin/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setRecommendations(data.recommendations)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user, isAdmin])

  const filteredRecommendations = recommendations.filter(rec => 
    rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteRecommendation = async (recommendationId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту рекомендацию?')) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/recommendations/${recommendationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        setRecommendations(recommendations.filter(rec => rec.id !== recommendationId))
      }
    } catch (error) {
      console.error('Error deleting recommendation:', error)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка рекомендаций...</p>
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
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Управление рекомендациями
              </h1>
              <p className="text-muted-foreground">
                Просмотр и управление рекомендациями и компаниями
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск рекомендаций..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredRecommendations.length} рекомендаций
            </Badge>
          </div>
        </div>

        {/* Recommendations Table */}
        <Card className="glass-effect border-0 shadow-medical">
          <CardHeader>
            <CardTitle className="text-xl">Список рекомендаций</CardTitle>
            <CardDescription>
              Все сгенерированные рекомендации для пользователей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Рекомендация</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecommendations.map((rec) => {
                    const typeInfo = recommendationTypes[rec.type as keyof typeof recommendationTypes]
                    const IconComponent = typeInfo?.icon || Heart
                    
                    return (
                      <TableRow key={rec.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${typeInfo?.color || 'bg-gray-100'}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold">{rec.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{rec.user.name}</p>
                              <p className="text-xs text-muted-foreground">{rec.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeInfo?.color}>
                            {typeInfo?.label || rec.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                            {getPriorityLabel(rec.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={rec.status === 'ACTIVE' ? "default" : "secondary"}
                            className={rec.status === 'ACTIVE' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {rec.status === 'ACTIVE' ? 'Активна' : rec.status === 'INACTIVE' ? 'Неактивна' : rec.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(rec.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRecommendation(rec)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // TODO: Редактирование рекомендации
                                alert('Функция редактирования будет добавлена')
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteRecommendation(rec.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Details Modal */}
        {selectedRecommendation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl glass-effect border-0 shadow-medical-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Детали рекомендации</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRecommendation(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${recommendationTypes[selectedRecommendation.type as keyof typeof recommendationTypes]?.color || 'bg-gray-100'}`}>
                      {(() => {
                        const typeInfo = recommendationTypes[selectedRecommendation.type as keyof typeof recommendationTypes]
                        const IconComponent = typeInfo?.icon || Heart
                        return <IconComponent className="h-8 w-8" />
                      })()}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedRecommendation.title}</h3>
                      <p className="text-muted-foreground">
                        {recommendationTypes[selectedRecommendation.type as keyof typeof recommendationTypes]?.label || selectedRecommendation.type}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Информация о рекомендации</h4>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Описание:</strong> {selectedRecommendation.description}
                        </p>
                        <p className="text-sm">
                          <strong>Причина:</strong> {selectedRecommendation.reason}
                        </p>
                        <p className="text-sm">
                          <strong>Приоритет:</strong> 
                          <Badge variant="outline" className={`ml-2 ${getPriorityColor(selectedRecommendation.priority)}`}>
                            {getPriorityLabel(selectedRecommendation.priority)}
                          </Badge>
                        </p>
                        <p className="text-sm">
                          <strong>Статус:</strong> 
                          <Badge 
                            variant={selectedRecommendation.status === 'ACTIVE' ? "default" : "secondary"}
                            className={`ml-2 ${selectedRecommendation.status === 'ACTIVE' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {selectedRecommendation.status === 'ACTIVE' ? 'Активна' : selectedRecommendation.status === 'INACTIVE' ? 'Неактивна' : selectedRecommendation.status}
                          </Badge>
                        </p>
                        <p className="text-sm">
                          <strong>Дата создания:</strong> {new Date(selectedRecommendation.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Пользователь</h4>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50/50 to-green-50/50 border border-blue-100/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {selectedRecommendation.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{selectedRecommendation.user.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedRecommendation.user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedRecommendation.company && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Рекомендуемая компания</h4>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-100/50">
                        <div className="p-2 rounded-lg bg-green-100/50">
                          <Building2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{selectedRecommendation.company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Тип: {selectedRecommendation.company.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRecommendation.product && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Рекомендуемый продукт</h4>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-100/50">
                        <div className="p-2 rounded-lg bg-purple-100/50">
                          <ShoppingBag className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{selectedRecommendation.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Цена: {selectedRecommendation.product.price} {selectedRecommendation.product.currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
