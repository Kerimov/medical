'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Phone, Globe, Star, Heart, AlertCircle, TestTube, Pill, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface Recommendation {
  id: string
  type: 'ANALYSIS' | 'SUPPLEMENT' | 'SERVICE' | 'ARTICLE' | 'PRODUCT'
  title: string
  description: string
  reason: string
  priority: number
  status: 'ACTIVE' | 'VIEWED' | 'CLICKED' | 'PURCHASED' | 'DISMISSED'
  company?: {
    id: string
    name: string
    type: string
    address?: string
    city?: string
    phone?: string
    website?: string
    rating?: number
    isVerified: boolean
  }
  product?: {
    id: string
    name: string
    price?: number
    currency?: string
    category?: string
  }
  analysisId?: string
  metadata?: any
  expiresAt?: string
  createdAt: string
}

const recommendationTypes = {
  ANALYSIS: { label: 'Анализ', icon: TestTube, color: 'bg-medical-blue/10 text-medical-blue border-medical-blue/20' },
  SERVICE: { label: 'Услуга', icon: Heart, color: 'bg-medical-coral/10 text-medical-coral border-medical-coral/20' },
  SUPPLEMENT: { label: 'БАД', icon: Pill, color: 'bg-medical-emerald/10 text-medical-emerald border-medical-emerald/20' },
  ARTICLE: { label: 'Статья', icon: AlertCircle, color: 'bg-medical-amber/10 text-medical-amber border-medical-amber/20' },
  PRODUCT: { label: 'Товар', icon: ShoppingBag, color: 'bg-medical-green/10 text-medical-green border-medical-green/20' }
}

const getPriorityColor = (priority: number) => {
  if (priority >= 4) return 'bg-medical-red/10 text-medical-red border-medical-red/20'
  if (priority >= 3) return 'bg-medical-amber/10 text-medical-amber border-medical-amber/20'
  return 'bg-medical-emerald/10 text-medical-emerald border-medical-emerald/20'
}

const getPriorityLabel = (priority: number) => {
  if (priority >= 4) return 'Высокий'
  if (priority >= 3) return 'Средний'
  return 'Низкий'
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [limit, setLimit] = useState(10)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (selectedType && selectedType !== 'all') params.append('type', selectedType)
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus)
      params.append('limit', limit.toString())

      const response = await fetch(`/api/marketplace/recommendations?${params}`, {
        credentials: 'include' // Включаем cookies для аутентификации
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки рекомендаций')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError('Ошибка загрузки рекомендаций')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRecommendations()
    }
  }, [user, selectedType, selectedStatus])

  const handleRecommendationAction = async (recommendationId: string, action: 'view' | 'click' | 'purchase' | 'dismiss') => {
    try {
      await fetch(`/api/marketplace/recommendations/${recommendationId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Включаем cookies для аутентификации
        body: JSON.stringify({ action })
      })

      // Обновляем статус локально
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: action.toUpperCase() as any }
            : rec
        )
      )
    } catch (error) {
      console.error('Error updating recommendation:', error)
    }
  }

  const generateRecommendations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/marketplace/recommendations/generate', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Ошибка генерации рекомендаций')
      }

      const data = await response.json()
      console.log('Generated recommendations:', data)
      
      // Обновляем список рекомендаций
      await fetchRecommendations()
    } catch (error) {
      console.error('Error generating recommendations:', error)
      setError('Ошибка генерации рекомендаций')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Персональные рекомендации</h1>
          <p className="text-gray-600">Войдите в систему для получения персональных рекомендаций</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-6 shadow-medical">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Персональные рекомендации
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Умные рекомендации на основе ваших анализов и состояния здоровья, 
            подобранные специально для вас
          </p>
        </div>

        {/* Фильтры и действия */}
        <div className="mb-8">
          <div className="glass-effect rounded-2xl p-6 shadow-medical">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48 border-0 bg-white/50">
                  <SelectValue placeholder="Тип рекомендации" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="ANALYSIS">Анализы</SelectItem>
                  <SelectItem value="SERVICE">Услуги</SelectItem>
                  <SelectItem value="SUPPLEMENT">БАД</SelectItem>
                  <SelectItem value="ARTICLE">Статьи</SelectItem>
                  <SelectItem value="PRODUCT">Товары</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48 border-0 bg-white/50">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="ACTIVE">Активные</SelectItem>
                  <SelectItem value="VIEWED">Просмотренные</SelectItem>
                  <SelectItem value="CLICKED">Открытые</SelectItem>
                  <SelectItem value="PURCHASED">Купленные</SelectItem>
                  <SelectItem value="DISMISSED">Отклоненные</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={generateRecommendations}
                disabled={loading}
                className="w-full sm:w-auto gradient-primary text-white hover:opacity-90 transition-opacity"
              >
                {loading ? 'Генерация...' : 'Сгенерировать рекомендации'}
              </Button>
            </div>
          </div>
        </div>

      {/* Рекомендации */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка рекомендаций...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchRecommendations} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <TestTube className="w-16 h-16 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Нет рекомендаций</h3>
          <p className="text-gray-600 mb-4">
            Рекомендации появятся после загрузки и анализа ваших медицинских документов
          </p>
          <Link href="/analyses/new">
            <Button>Загрузить анализ</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((recommendation) => {
            const typeInfo = recommendationTypes[recommendation.type]
            const IconComponent = typeInfo.icon
            
            return (
              <Card key={recommendation.id} className="group hover:shadow-medical-lg transition-all duration-300 border-0 shadow-medical glass-effect animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${typeInfo.color} shadow-sm`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {recommendation.company?.rating && (
                      <div className="flex items-center gap-1">
                        {renderStars(recommendation.company.rating)}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({recommendation.company.rating.toFixed(1)})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">
                    {recommendation.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={`${typeInfo.color} border`}>
                      {typeInfo.label}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(recommendation.priority)} border`}
                    >
                      {getPriorityLabel(recommendation.priority)} приоритет
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <p className="text-muted-foreground mb-4 leading-relaxed">{recommendation.description}</p>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm text-blue-800 font-medium">
                        <strong>Причина рекомендации:</strong> {recommendation.reason}
                      </p>
                    </div>
                  </div>

                  {recommendation.company && (
                    <div className="space-y-3 mb-6">
                      <h4 className="text-sm font-semibold text-foreground">Рекомендуемая организация:</h4>
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-lg">{recommendation.company.name}</h5>
                          {recommendation.company.isVerified && (
                            <Badge className="bg-medical-emerald text-white border-0">
                              ✓ Проверено
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          {recommendation.company.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{recommendation.company.address}, {recommendation.company.city}</span>
                            </div>
                          )}
                          
                          {recommendation.company.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{recommendation.company.phone}</span>
                            </div>
                          )}
                          
                          {recommendation.company.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <a 
                                href={recommendation.company.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                                onClick={() => handleRecommendationAction(recommendation.id, 'click')}
                              >
                                Сайт
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {recommendation.product && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Рекомендуемый товар:</h4>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{recommendation.product.name}</span>
                          {recommendation.product.price && (
                            <span className="font-bold text-green-600">
                              {formatPrice(recommendation.product.price, recommendation.product.currency)}
                            </span>
                          )}
                        </div>
                        {recommendation.product.category && (
                          <p className="text-sm text-gray-600 mt-1">
                            Категория: {recommendation.product.category}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-xs text-muted-foreground">
                      {new Date(recommendation.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                    <div className="flex gap-2">
                      {recommendation.status === 'ACTIVE' && (
                        <>
                          <Button 
                            size="sm" 
                            className="gradient-primary text-white hover:opacity-90"
                            onClick={() => handleRecommendationAction(recommendation.id, 'view')}
                          >
                            Подробнее
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-medical-red text-medical-red hover:bg-medical-red hover:text-white"
                            onClick={() => handleRecommendationAction(recommendation.id, 'dismiss')}
                          >
                            Отклонить
                          </Button>
                        </>
                      )}
                      {recommendation.status === 'VIEWED' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-medical-red text-medical-red hover:bg-medical-red hover:text-white"
                          onClick={() => handleRecommendationAction(recommendation.id, 'dismiss')}
                        >
                          Отклонить
                        </Button>
                      )}
                      {recommendation.status === 'DISMISSED' && (
                        <span className="text-sm text-muted-foreground px-3 py-1 bg-gray-100 rounded-full">
                          Отклонено
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

        {/* Кнопка "Показать больше" */}
        {recommendations.length >= limit && (
          <div className="flex justify-center mt-12">
            <Button 
              onClick={() => setLimit(prev => prev + 10)}
              className="px-8 py-3 gradient-secondary text-white hover:opacity-90 transition-opacity shadow-medical"
            >
              Показать больше рекомендаций
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}