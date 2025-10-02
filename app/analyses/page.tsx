'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, MapPin, User, FileText } from 'lucide-react'
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
  results: AnalysisResult
  normalRange?: string
  status: 'normal' | 'abnormal' | 'critical'
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function AnalysesPage() {
  const { user, token } = useAuth()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          <p className="text-gray-600 mt-2">Просмотр и управление результатами анализов</p>
        </div>
        <Link href="/analyses/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Добавить анализ
          </Button>
        </Link>
      </div>

      {analyses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Анализы не найдены</h3>
            <p className="text-gray-600 mb-4">У вас пока нет сохраненных анализов</p>
            <Link href="/analyses/new">
              <Button>Добавить первый анализ</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{analysis.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {analysis.type}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(analysis.status)}>
                    {getStatusText(analysis.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(analysis.date)}</span>
                  </div>
                  {analysis.laboratory && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{analysis.laboratory}</span>
                    </div>
                  )}
                  {analysis.doctor && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{analysis.doctor}</span>
                    </div>
                  )}
                </div>

                {analysis.results && Object.keys(analysis.results).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Основные показатели:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(analysis.results).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium">{key}:</span>
                          <span className={value.normal === false ? 'text-red-600 font-medium' : ''}>
                            {value.value} {value.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                    {Object.keys(analysis.results).length > 4 && (
                      <p className="text-sm text-gray-500 mt-2">
                        И еще {Object.keys(analysis.results).length - 4} показателей...
                      </p>
                    )}
                  </div>
                )}

                {analysis.notes && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-1">Примечания:</h4>
                    <p className="text-sm text-gray-600">{analysis.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/analyses/${analysis.id}`}>
                    <Button variant="outline" size="sm">
                      Подробнее
                    </Button>
                  </Link>
                  <Link href={`/analyses/${analysis.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Редактировать
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
