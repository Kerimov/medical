'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  AlertCircle, 
  Heart, 
  Pill, 
  BookOpen, 
  ShoppingBag,
  RefreshCw,
  Eye,
  MousePointer,
  CheckCircle,
  X
} from 'lucide-react'

interface Recommendation {
  id: string
  type: string
  title: string
  description?: string
  reason?: string
  priority: number
  status: string
  company?: Company
  product?: Product
  analysis?: {
    id: string
    title: string
    type: string
    date: string
  }
  metadata?: any
  expiresAt?: string
  createdAt: string
  _count: {
    interactions: number
  }
}

interface Company {
  id: string
  name: string
  type: string
  address?: string
  city?: string
  phone?: string
  website?: string
  rating?: number
}

interface Product {
  id: string
  name: string
  description?: string
  price?: number
  currency: string
}

const recommendationTypes = {
  ANALYSIS: { label: 'Анализ', icon: AlertCircle, color: 'bg-blue-100 text-blue-800' },
  SUPPLEMENT: { label: 'Добавка', icon: Pill, color: 'bg-green-100 text-green-800' },
  SERVICE: { label: 'Услуга', icon: Heart, color: 'bg-red-100 text-red-800' },
  ARTICLE: { label: 'Статья', icon: BookOpen, color: 'bg-purple-100 text-purple-800' },
  PRODUCT: { label: 'Товар', icon: ShoppingBag, color: 'bg-orange-100 text-orange-800' }
}

const statusLabels = {
  ACTIVE: 'Активная',
  VIEWED: 'Просмотрена',
  CLICKED: 'Открыта',
  PURCHASED: 'Куплена',
  DISMISSED: 'Отклонена'
}

export default function RecommendationsPage() {
  const { user, token } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE')

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedType) params.append('type', selectedType)
      if (selectedStatus) params.append('status', selectedStatus)

      const response = await fetch(`/api/marketplace/recommendations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = async () => {
    try {
      setGenerating(true)
      const response = await fetch('/api/marketplace/recommendations/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Generated recommendations:', data)
        // Обновляем список рекомендаций
        await fetchRecommendations()
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setGenerating(false)
    }
  }

  const recordInteraction = async (recommendationId: string, action: string) => {
    try {
      const response = await fetch(`/api/marketplace/recommendations/${recommendationId}/interact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        // Обновляем статус рекомендации локально
        setRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId 
              ? { ...rec, status: action === 'view' ? 'VIEWED' : action === 'click' ? 'CLICKED' : rec.status }
              : rec
          )
        )
      }
    } catch (error) {
      console.error('Error recording interaction:', error)
    }
  }

  useEffect(() => {
    if (token) {
      fetchRecommendations()
    }
  }, [token, selectedType, selectedStatus])

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'RUB' ? 'RUB' : 'USD'
    }).format(price)
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'bg-red-100 text-red-800'
    if (priority >= 4) return 'bg-orange-100 text-orange-800'
    if (priority >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Персонализированные рекомендации</h1>
          <p>Для доступа к рекомендациям необходимо войти в систему</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Персонализированные рекомендации</h1>
            <p className="text-gray-600">
              Рекомендации на основе ваших анализов и состояния здоровья
            </p>
          </div>
          <Button 
            onClick={generateRecommendations} 
            disabled={generating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Генерация...' : 'Обновить рекомендации'}
          </Button>
        </div>

        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Тип рекомендации" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все типы</SelectItem>
              {Object.entries(recommendationTypes).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Рекомендации */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Загрузка рекомендаций...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет рекомендаций</h3>
            <p className="text-gray-600 mb-4">
              У вас пока нет персонализированных рекомендаций. 
              Загрузите анализы или нажмите "Обновить рекомендации"
            </p>
            <Button onClick={generateRecommendations} disabled={generating}>
              <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              Сгенерировать рекомендации
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((recommendation) => {
            const typeInfo = recommendationTypes[recommendation.type as keyof typeof recommendationTypes]
            const TypeIcon = typeInfo.icon

            return (
              <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            Приоритет {recommendation.priority}
                          </Badge>
                          <Badge variant="outline">
                            {statusLabels[recommendation.status as keyof typeof statusLabels]}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {recommendation.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => recordInteraction(recommendation.id, 'dismiss')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {recommendation.description && (
                    <p className="text-gray-700 mb-4">{recommendation.description}</p>
                  )}
                  
                  {recommendation.reason && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Причина рекомендации:</p>
                          <p className="text-sm text-yellow-700">{recommendation.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {recommendation.analysis && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-blue-800 mb-1">Связанный анализ:</p>
                      <p className="text-sm text-blue-700">
                        {recommendation.analysis.title} ({recommendation.analysis.type})
                      </p>
                      <p className="text-xs text-blue-600">
                        {new Date(recommendation.analysis.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  )}

                  {recommendation.company && (
                    <div className="border rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-2">Рекомендуемая компания:</h4>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{recommendation.company.name}</p>
                          {recommendation.company.address && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{recommendation.company.address}, {recommendation.company.city}</span>
                            </div>
                          )}
                          {recommendation.company.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <Phone className="w-4 h-4" />
                              <span>{recommendation.company.phone}</span>
                            </div>
                          )}
                        </div>
                        {recommendation.company.website && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              window.open(recommendation.company!.website, '_blank')
                              recordInteraction(recommendation.id, 'click')
                            }}
                          >
                            <Globe className="w-4 h-4 mr-1" />
                            Сайт
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {recommendation.product && (
                    <div className="border rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-2">Рекомендуемый товар:</h4>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{recommendation.product.name}</p>
                          {recommendation.product.description && (
                            <p className="text-sm text-gray-600 mt-1">{recommendation.product.description}</p>
                          )}
                        </div>
                        {recommendation.product.price && (
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {formatPrice(recommendation.product.price, recommendation.product.currency)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Создано: {new Date(recommendation.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      {recommendation.expiresAt && (
                        <span>
                          Действует до: {new Date(recommendation.expiresAt).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                      <span>
                        Взаимодействий: {recommendation._count.interactions}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {recommendation.status === 'ACTIVE' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => recordInteraction(recommendation.id, 'view')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Просмотрено
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => recordInteraction(recommendation.id, 'click')}
                          >
                            <MousePointer className="w-4 h-4 mr-1" />
                            Открыть
                          </Button>
                        </>
                      )}
                      {recommendation.status === 'VIEWED' && (
                        <Button
                          size="sm"
                          onClick={() => recordInteraction(recommendation.id, 'click')}
                        >
                          <MousePointer className="w-4 h-4 mr-1" />
                          Открыть
                        </Button>
                      )}
                      {recommendation.status === 'CLICKED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => recordInteraction(recommendation.id, 'purchase')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Отметить как куплено
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
