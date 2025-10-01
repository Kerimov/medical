'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Download
} from 'lucide-react'
import Link from 'next/link'

interface Document {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadDate: string
  parsed: boolean
  studyType?: string
  studyDate?: string
  laboratory?: string
  doctor?: string
  findings?: string
  ocrConfidence?: number
  rawText?: string
  indicators?: Array<{
    name: string
    value: string | number
    unit?: string
    referenceMin?: number
    referenceMax?: number
    isNormal?: boolean
  }>
}

export default function DocumentViewPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && params.id) {
      loadDocument()
    }
  }, [user, authLoading, params.id])

  const loadDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setDocument(data.document)
      } else {
        router.push('/documents')
      }
    } catch (error) {
      console.error('Error loading document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!document) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/documents" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline">Документы</span>
          </Link>
          <Link href="/documents">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Health Summary */}
          {document.indicators && document.indicators.length > 0 && (
            <Card className={`border-2 ${
              document.indicators.some(i => !i.isNormal)
                ? 'border-destructive/50 bg-destructive/5'
                : 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {document.indicators.some(i => !i.isNormal) ? (
                    <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      {document.indicators.some(i => !i.isNormal) 
                        ? '⚠️ Обнаружены отклонения от нормы'
                        : '✅ Все показатели в норме'
                      }
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {document.indicators.filter(i => i.isNormal).length}
                        </p>
                        <p className="text-xs text-muted-foreground">В норме</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-destructive">
                          {document.indicators.filter(i => !i.isNormal).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Отклонения</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {document.indicators.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Всего показателей</p>
                      </div>
                    </div>
                    {document.indicators.some(i => !i.isNormal) && (
                      <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <p className="text-sm font-medium text-destructive mb-1">
                          🏥 Рекомендуется консультация врача
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Обнаруженные отклонения требуют внимания специалиста для интерпретации и назначения лечения при необходимости.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">{document.fileName}</CardTitle>
                    <CardDescription>
                      Загружено: {new Date(document.uploadDate).toLocaleString('ru-RU')}
                    </CardDescription>
                  </div>
                </div>
                {document.parsed && (
                  <Badge variant="default" className="ml-2">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Распознано
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.ocrConfidence && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Уверенность распознавания</span>
                    <span className="font-medium">{Math.round(document.ocrConfidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${document.ocrConfidence * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                {document.studyType && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Тип исследования</p>
                      <p className="font-medium">{document.studyType}</p>
                    </div>
                  </div>
                )}
                
                {document.studyDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Дата исследования</p>
                      <p className="font-medium">
                        {new Date(document.studyDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                )}
                
                {document.laboratory && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Лаборатория</p>
                      <p className="font-medium">{document.laboratory}</p>
                    </div>
                  </div>
                )}
                
                {document.doctor && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Врач</p>
                      <p className="font-medium">{document.doctor}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Indicators */}
          {document.indicators && document.indicators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Показатели</CardTitle>
                <CardDescription>Извлеченные значения анализов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {document.indicators.map((indicator, index) => {
                    const value = typeof indicator.value === 'number' ? indicator.value : parseFloat(indicator.value)
                    const min = indicator.referenceMin || 0
                    const max = indicator.referenceMax || 100
                    
                    // Определяем степень отклонения
                    let deviationPercent = 0
                    let deviationText = ''
                    
                    if (!indicator.isNormal) {
                      if (value < min) {
                        deviationPercent = ((min - value) / (max - min)) * 100
                        deviationText = `↓ ${deviationPercent.toFixed(1)}%`
                      } else {
                        deviationPercent = ((value - max) / (max - min)) * 100
                        deviationText = `↑ ${deviationPercent.toFixed(1)}%`
                      }
                    }
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                          indicator.isNormal 
                            ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' 
                            : 'border-red-200 bg-red-50/50 dark:bg-red-950/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {indicator.isNormal ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">{indicator.name}</p>
                            {indicator.referenceMin !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Норма: {indicator.referenceMin}-{indicator.referenceMax} {indicator.unit}
                              </p>
                            )}
                            {!indicator.isNormal && deviationText && (
                              <p className="text-xs font-semibold text-destructive mt-1">
                                Отклонение: {deviationText}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${!indicator.isNormal ? 'text-destructive' : ''}`}>
                            {indicator.value} {indicator.unit}
                          </p>
                          <Badge variant={indicator.isNormal ? "default" : "destructive"} className="text-xs">
                            {indicator.isNormal ? 'Норма' : 'Отклонение'}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Findings */}
          {document.findings && (
            <Card>
              <CardHeader>
                <CardTitle>Заключение</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{document.findings}</p>
              </CardContent>
            </Card>
          )}

          {/* Raw Text */}
          {document.rawText && (
            <Card>
              <CardHeader>
                <CardTitle>Распознанный текст</CardTitle>
                <CardDescription>Оригинальный текст документа</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                  {document.rawText}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Document Preview */}
          {document.fileType.includes('image') && (
            <Card>
              <CardHeader>
                <CardTitle>Просмотр документа</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={document.fileUrl}
                  alt={document.fileName}
                  className="w-full rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <a href={document.fileUrl} download={document.fileName}>
                <Download className="mr-2 h-4 w-4" />
                Скачать
              </a>
            </Button>
            <Link href="/documents" className="flex-1">
              <Button variant="outline" className="w-full">
                Закрыть
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

