'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Heart, 
  AlertCircle, 
  TestTube, 
  Pill, 
  ShoppingBag, 
  Building2,
  ArrowLeft,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Info,
  BookOpen,
  Stethoscope
} from 'lucide-react'
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
    email?: string
    website?: string
    rating?: number
    reviewCount?: number
    isVerified: boolean
    coordinates?: { lat: number; lng: number }
  }
  product?: {
    id: string
    name: string
    price?: number
    currency?: string
    category?: string
    description?: string
  }
  analysis?: {
    id: string
    title: string
    type: string
    date: string
  }
  metadata?: {
    aiExplanation?: string
    testType?: string
    currentValue?: number
    normalRange?: string
    unit?: string
    supplementType?: string
    recommendedDosage?: string
    duration?: string
    serviceType?: string
    specialization?: string
    articleUrl?: string
    readingTime?: string
    distance?: number
    [key: string]: any
  }
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

export default function RecommendationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchRecommendation()
    }
  }, [user, params.id])

  const fetchRecommendation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/marketplace/recommendations/${params.id}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Рекомендация не найдена')
      }

      const data = await response.json()
      setRecommendation(data.recommendation)
      
      // Отмечаем как просмотренную
      if (data.recommendation.status === 'ACTIVE') {
        await handleAction('view')
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error)
      setError(error instanceof Error ? error.message : 'Ошибка загрузки рекомендации')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'view' | 'click' | 'purchase' | 'dismiss') => {
    if (!recommendation) return

    try {
      await fetch(`/api/marketplace/recommendations/${recommendation.id}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ action })
      })

      // Обновляем статус локально
      setRecommendation(prev => prev ? { ...prev, status: action.toUpperCase() as any } : null)
    } catch (error) {
      console.error('Error updating recommendation:', error)
    }
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

  const formatPrice = (price: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка рекомендации...</p>
        </div>
      </div>
    )
  }

  if (error || !recommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ошибка</h2>
              <p className="text-gray-600 mb-4">{error || 'Рекомендация не найдена'}</p>
              <Button onClick={() => router.push('/marketplace')}>
                Вернуться к рекомендациям
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const typeInfo = recommendationTypes[recommendation.type]
  const IconComponent = typeInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl ${typeInfo.color} shadow-sm`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{recommendation.title}</h1>
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
                {recommendation.status === 'ACTIVE' && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Активна
                  </Badge>
                )}
                {recommendation.status === 'VIEWED' && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Просмотрена
                  </Badge>
                )}
                {recommendation.status === 'DISMISSED' && (
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Отклонена
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="glass-effect border-0 shadow-medical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Описание
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {recommendation.description}
                </p>
              </CardContent>
            </Card>

            {/* Reason */}
            <Card className="glass-effect border-0 shadow-medical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Причина рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-blue-800 font-medium text-lg">
                    {recommendation.reason}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Explanation */}
            {recommendation.metadata?.aiExplanation && (
              <Card className="glass-effect border-0 shadow-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Объяснение
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/70 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {recommendation.metadata.aiExplanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Information by Type */}
            {recommendation.type === 'ANALYSIS' && recommendation.metadata && (
              <Card className="glass-effect border-0 shadow-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Информация об анализе
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendation.metadata.testType && (
                    <div>
                      <span className="text-sm text-muted-foreground">Тип анализа:</span>
                      <p className="font-medium">{recommendation.metadata.testType}</p>
                    </div>
                  )}
                  {recommendation.metadata.currentValue !== undefined && (
                    <div>
                      <span className="text-sm text-muted-foreground">Текущее значение:</span>
                      <p className="font-medium">
                        {recommendation.metadata.currentValue} {recommendation.metadata.unit || ''}
                      </p>
                    </div>
                  )}
                  {recommendation.metadata.normalRange && (
                    <div>
                      <span className="text-sm text-muted-foreground">Нормальный диапазон:</span>
                      <p className="font-medium">{recommendation.metadata.normalRange}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {recommendation.type === 'SUPPLEMENT' && recommendation.metadata && (
              <Card className="glass-effect border-0 shadow-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Информация о добавке
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendation.metadata.supplementType && (
                    <div>
                      <span className="text-sm text-muted-foreground">Тип добавки:</span>
                      <p className="font-medium">{recommendation.metadata.supplementType}</p>
                    </div>
                  )}
                  {recommendation.metadata.recommendedDosage && (
                    <div>
                      <span className="text-sm text-muted-foreground">Рекомендуемая дозировка:</span>
                      <p className="font-medium">{recommendation.metadata.recommendedDosage}</p>
                    </div>
                  )}
                  {recommendation.metadata.duration && (
                    <div>
                      <span className="text-sm text-muted-foreground">Длительность приема:</span>
                      <p className="font-medium">{recommendation.metadata.duration}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {recommendation.type === 'SERVICE' && recommendation.metadata && (
              <Card className="glass-effect border-0 shadow-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Информация об услуге
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendation.metadata.serviceType && (
                    <div>
                      <span className="text-sm text-muted-foreground">Тип услуги:</span>
                      <p className="font-medium">{recommendation.metadata.serviceType}</p>
                    </div>
                  )}
                  {recommendation.metadata.specialization && (
                    <div>
                      <span className="text-sm text-muted-foreground">Специализация:</span>
                      <p className="font-medium">{recommendation.metadata.specialization}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {recommendation.type === 'ARTICLE' && recommendation.metadata?.articleUrl && (
              <Card className="glass-effect border-0 shadow-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Статья
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={recommendation.metadata.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleAction('click')}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Открыть статью
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {recommendation.metadata.readingTime && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Время чтения: {recommendation.metadata.readingTime}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Related Analysis */}
            {recommendation.analysis && (
              <Card className="glass-effect border-0 shadow-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Связанный анализ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/analyses/${recommendation.analysis.id}`}>
                    <div className="p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                      <p className="font-medium">{recommendation.analysis.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recommendation.analysis.type} • {new Date(recommendation.analysis.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            {recommendation.company && (
              <Card className="glass-effect border-0 shadow-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Организация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{recommendation.company.name}</h3>
                    {recommendation.company.isVerified && (
                      <Badge className="bg-medical-emerald text-white border-0 mb-2">
                        ✓ Проверено
                      </Badge>
                    )}
                    {recommendation.company.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(recommendation.company.rating)}
                        <span className="text-sm text-muted-foreground ml-1">
                          {recommendation.company.rating.toFixed(1)}
                          {recommendation.company.reviewCount && ` (${recommendation.company.reviewCount} отзывов)`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {recommendation.company.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <span>{recommendation.company.address}, {recommendation.company.city}</span>
                      </div>
                    )}
                    {recommendation.company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${recommendation.company.phone}`} className="text-blue-600 hover:underline">
                          {recommendation.company.phone}
                        </a>
                      </div>
                    )}
                    {recommendation.company.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">@</span>
                        <a href={`mailto:${recommendation.company.email}`} className="text-blue-600 hover:underline">
                          {recommendation.company.email}
                        </a>
                      </div>
                    )}
                    {recommendation.company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={recommendation.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleAction('click')}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Сайт
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {recommendation.metadata?.distance && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Расстояние: {recommendation.metadata.distance.toFixed(1)} км</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/marketplace/companies/${recommendation.company.id}`}>
                    <Button className="w-full" onClick={() => handleAction('click')}>
                      Подробнее об организации
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Product Info */}
            {recommendation.product && (
              <Card className="glass-effect border-0 shadow-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Товар
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{recommendation.product.name}</h3>
                    {recommendation.product.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {recommendation.product.description}
                      </p>
                    )}
                    {recommendation.product.price && (
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(recommendation.product.price, recommendation.product.currency)}
                      </p>
                    )}
                    {recommendation.product.category && (
                      <Badge variant="outline" className="mt-2">
                        {recommendation.product.category}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="glass-effect border-0 shadow-medical">
              <CardHeader>
                <CardTitle>Действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendation.status === 'ACTIVE' && (
                  <>
                    <Button 
                      className="w-full gradient-primary text-white"
                      onClick={() => handleAction('click')}
                    >
                      Отметить как просмотренную
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-medical-red text-medical-red hover:bg-medical-red hover:text-white"
                      onClick={() => handleAction('dismiss')}
                    >
                      Отклонить рекомендацию
                    </Button>
                  </>
                )}
                {recommendation.status === 'VIEWED' && (
                  <Button 
                    variant="outline"
                    className="w-full border-medical-red text-medical-red hover:bg-medical-red hover:text-white"
                    onClick={() => handleAction('dismiss')}
                  >
                    Отклонить рекомендацию
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="glass-effect border-0 shadow-medical">
              <CardHeader>
                <CardTitle className="text-sm">Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Создана: {new Date(recommendation.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
                {recommendation.expiresAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Действует до: {new Date(recommendation.expiresAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

