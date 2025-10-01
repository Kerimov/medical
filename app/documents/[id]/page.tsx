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
                  {document.indicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {indicator.isNormal ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <div>
                          <p className="font-medium">{indicator.name}</p>
                          {indicator.referenceMin !== undefined && (
                            <p className="text-xs text-muted-foreground">
                              Норма: {indicator.referenceMin}-{indicator.referenceMax} {indicator.unit}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {indicator.value} {indicator.unit}
                        </p>
                        <Badge variant={indicator.isNormal ? "default" : "destructive"} className="text-xs">
                          {indicator.isNormal ? 'Норма' : 'Отклонение'}
                        </Badge>
                      </div>
                    </div>
                  ))}
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

