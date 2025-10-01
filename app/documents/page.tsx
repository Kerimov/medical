'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AIChat } from '@/components/AIChat'
import { ParserStatusBadge } from '@/components/parser-status-badge'
import {
  Activity,
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface Document {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadDate: string
  parsed: boolean
  studyType?: string
  studyDate?: string
  category?: string
  ocrConfidence?: number
}

export default function DocumentsPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadDocuments()
    }
  }, [user, authLoading, router])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          await loadDocuments()
        } else {
          const error = await response.json()
          alert(`Ошибка загрузки ${file.name}: ${error.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert(`Ошибка загрузки ${file.name}`)
      }
    }

    setIsUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить документ?')) return

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadDocuments()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-5 w-5" />
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.studyType?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (authLoading || (isLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline">Персональный Медицинский Ассистент</span>
            <span className="font-bold text-xl sm:hidden">ПМА</span>
          </Link>
          <div className="flex items-center gap-4">
            <ParserStatusBadge />
            <Link href="/dashboard">
              <Button variant="ghost">← Назад</Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Мои документы</h1>
          <p className="text-muted-foreground">
            Храните все медицинские документы в одном месте
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Загрузить документы</CardTitle>
            <CardDescription>
              Поддерживаются: PDF, JPG, PNG, DICOM, CSV, TXT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Загрузка и обработка...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Перетащите файлы сюда или
                    </p>
                    <label htmlFor="file-upload">
                      <Button type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Выбрать файлы
                      </Button>
                    </label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.dcm,.csv,.txt"
                      onChange={handleFileInput}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Максимальный размер файла: 10 МБ
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию или типу..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory('all')}
                >
                  Все
                </Button>
                <Button
                  variant={filterCategory === 'blood_test' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory('blood_test')}
                >
                  Анализы
                </Button>
                <Button
                  variant={filterCategory === 'imaging' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory('imaging')}
                >
                  Снимки
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Нет документов</p>
              <p className="text-muted-foreground">
                Загрузите первый документ для начала работы
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.fileType)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.fileName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.fileSize)}
                        </p>
                      </div>
                    </div>
                    {doc.parsed && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  {doc.studyType && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-primary">{doc.studyType}</p>
                    </div>
                  )}

                  {doc.studyDate && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Дата: {new Date(doc.studyDate).toLocaleDateString('ru-RU')}
                    </p>
                  )}

                  {doc.ocrConfidence && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Распознано</span>
                        <span className="font-medium">{Math.round(doc.ocrConfidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${doc.ocrConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/documents/${doc.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        Открыть
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Загружено: {new Date(doc.uploadDate).toLocaleDateString('ru-RU')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AIChat />
    </div>
  )
}

