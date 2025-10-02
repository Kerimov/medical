'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Calendar, MapPin, User, FileText, Search, Filter, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'

interface AnalysisResult {
  [key: string]: {
    value: string | number
    unit?: string
    normal?: boolean
  }
}

interface Analysis {
  id: string
  title: string
  type: string
  date: string
  laboratory?: string
  doctor?: string
  results: string // JSON string from API
  normalRange?: string
  status: 'normal' | 'abnormal' | 'critical'
  notes?: string
  createdAt: string
  updatedAt: string
  documentId?: string
}

interface AnalysisCategory {
  name: string
  icon: React.ReactNode
  color: string
  analyses: Analysis[]
}

export default function AnalysesPage() {
  const { user, token } = useAuth()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (token) {
      fetchAnalyses()
    }
  }, [token])

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analyses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке анализов')
      }

      const data = await response.json()
      setAnalyses(data.analyses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  // Группировка анализов по категориям
  const categorizeAnalyses = (analyses: Analysis[]): AnalysisCategory[] => {
    const categories: { [key: string]: Analysis[] } = {}
    
    analyses.forEach(analysis => {
      const categoryName = getAnalysisCategory(analysis.type)
      if (!categories[categoryName]) {
        categories[categoryName] = []
      }
      categories[categoryName].push(analysis)
    })

    return Object.entries(categories).map(([name, analyses]) => ({
      name,
      icon: getCategoryIcon(name),
      color: getCategoryColor(name),
      analyses: analyses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }))
  }

  // Определение категории анализа по типу
  const getAnalysisCategory = (type: string): string => {
    const typeLower = type.toLowerCase()
    
    if (typeLower.includes('кров') || typeLower.includes('гемоглобин') || typeLower.includes('эритроцит') || typeLower.includes('лейкоцит')) {
      return 'Общий анализ крови'
    }
    if (typeLower.includes('биохим') || typeLower.includes('глюкоз') || typeLower.includes('холестерин') || typeLower.includes('белок')) {
      return 'Биохимический анализ'
    }
    if (typeLower.includes('моч') || typeLower.includes('урин')) {
      return 'Анализ мочи'
    }
    if (typeLower.includes('гормон') || typeLower.includes('тиреоид') || typeLower.includes('инсулин')) {
      return 'Гормональные исследования'
    }
    if (typeLower.includes('онко') || typeLower.includes('маркер') || typeLower.includes('опухол')) {
      return 'Онкомаркеры'
    }
    if (typeLower.includes('инфекц') || typeLower.includes('вирус') || typeLower.includes('бактери') || typeLower.includes('антител')) {
      return 'Инфекционные заболевания'
    }
    if (typeLower.includes('аллерг') || typeLower.includes('иммуноглобулин')) {
      return 'Аллергология'
    }
    if (typeLower.includes('коагул') || typeLower.includes('свертывани') || typeLower.includes('тромб')) {
      return 'Коагулограмма'
    }
    
    return 'Прочие анализы'
  }

  // Иконки для категорий
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Общий анализ крови':
        return <TrendingUp className="h-5 w-5" />
      case 'Биохимический анализ':
        return <TrendingDown className="h-5 w-5" />
      case 'Анализ мочи':
        return <Minus className="h-5 w-5" />
      case 'Гормональные исследования':
        return <TrendingUp className="h-5 w-5" />
      case 'Онкомаркеры':
        return <TrendingUp className="h-5 w-5" />
      case 'Инфекционные заболевания':
        return <TrendingDown className="h-5 w-5" />
      case 'Аллергология':
        return <Minus className="h-5 w-5" />
      case 'Коагулограмма':
        return <TrendingUp className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  // Цвета для категорий
  const getCategoryColor = (categoryName: string): string => {
    switch (categoryName) {
      case 'Общий анализ крови':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Биохимический анализ':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Анализ мочи':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Гормональные исследования':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Онкомаркеры':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'Инфекционные заболевания':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Аллергология':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Коагулограмма':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Фильтрация анализов
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.laboratory?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const categorizedAnalyses = categorizeAnalyses(filteredAnalyses)

  // Переключение развернутости категории
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800'
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Норма'
      case 'abnormal':
        return 'Отклонение'
      case 'critical':
        return 'Критично'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Парсинг результатов анализа
  const parseAnalysisResults = (resultsString: string): AnalysisResult => {
    try {
      const parsed = JSON.parse(resultsString)
      if (parsed.indicators && Array.isArray(parsed.indicators)) {
        const result: AnalysisResult = {}
        parsed.indicators.forEach((indicator: any) => {
          if (indicator.name && indicator.value !== undefined) {
            result[indicator.name] = {
              value: indicator.value,
              unit: indicator.unit || '',
              normal: indicator.isNormal
            }
          }
        })
        return result
      }
      return parsed
    } catch {
      return {}
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Необходима авторизация</h1>
          <p className="text-gray-600 mb-4">Для просмотра анализов необходимо войти в систему</p>
          <Link href="/login">
            <Button>Войти</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка анализов...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Ошибка</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalyses}>Попробовать снова</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Мои анализы</h1>
          <p className="text-gray-600 mt-2">Просмотр и управление результатами анализов по категориям</p>
        </div>
            <Link href="/documents">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Добавить анализ
              </Button>
            </Link>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по названию, типу или лаборатории..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Все статусы</option>
              <option value="normal">Норма</option>
              <option value="abnormal">Отклонение</option>
              <option value="critical">Критично</option>
            </select>
          </div>
        </div>
      </div>

      {analyses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Анализы не найдены</h3>
                <p className="text-gray-600 mb-4">Загрузите документ с анализом для автоматического распознавания</p>
                <Link href="/documents">
                  <Button>Загрузить документ</Button>
                </Link>
              </CardContent>
            </Card>
      ) : categorizedAnalyses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ничего не найдено</h3>
            <p className="text-gray-600 mb-4">Попробуйте изменить параметры поиска или загрузите новый документ</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => { setSearchTerm(''); setStatusFilter('all') }}>
                Сбросить фильтры
              </Button>
              <Link href="/documents">
                <Button variant="outline">Загрузить документ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categorizedAnalyses.map((category) => {
            const isExpanded = expandedCategories.has(category.name)
            const totalAnalyses = category.analyses.length
            const abnormalCount = category.analyses.filter(a => a.status !== 'normal').length
            
            return (
              <Card key={category.name} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <CardDescription>
                          {totalAnalyses} анализов
                          {abnormalCount > 0 && (
                            <span className="text-orange-600 ml-2">
                              ({abnormalCount} с отклонениями)
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={category.color}>
                      {totalAnalyses}
                    </Badge>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="grid gap-4">
                      {category.analyses.map((analysis) => {
                        const results = parseAnalysisResults(analysis.results)
                        return (
                          <Card key={analysis.id} className="border-l-4 border-l-primary/20 hover:shadow-md transition-shadow">
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-lg">{analysis.title}</h4>
                                  <p className="text-sm text-gray-600">{analysis.type}</p>
                                </div>
                                <Badge className={getStatusColor(analysis.status)}>
                                  {getStatusText(analysis.status)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(analysis.date)}</span>
                                </div>
                                {analysis.laboratory && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate">{analysis.laboratory}</span>
                                  </div>
                                )}
                                {analysis.doctor && (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="truncate">{analysis.doctor}</span>
                                  </div>
                                )}
                              </div>

                              {Object.keys(results).length > 0 && (
                                <div className="mb-4">
                                  <h5 className="font-medium mb-2 text-sm">Основные показатели:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(results).slice(0, 4).map(([key, value]) => (
                                      <div key={key} className="flex justify-between text-sm">
                                        <span className="font-medium">{key}:</span>
                                        <span className={value.normal === false ? 'text-red-600 font-medium' : ''}>
                                          {value.value} {value.unit}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  {Object.keys(results).length > 4 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      И еще {Object.keys(results).length - 4} показателей...
                                    </p>
                                  )}
                                </div>
                              )}

                              {analysis.notes && (
                                <div className="mb-4">
                                  <h5 className="font-medium mb-1 text-sm">Примечания:</h5>
                                  <p className="text-sm text-gray-600">{analysis.notes}</p>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Link href={`/analyses/${analysis.id}`}>
                                  <Button variant="outline" size="sm">
                                    Подробнее
                                  </Button>
                                </Link>
                                {analysis.documentId && (
                                  <Link href={`/documents/${analysis.documentId}`}>
                                    <Button variant="outline" size="sm">
                                      Исходный документ
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
