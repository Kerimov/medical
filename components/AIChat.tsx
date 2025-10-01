'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, X, Bot, User, Loader2, Paperclip, FileText, XCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachedDocuments?: AttachedDocument[]
}

interface AttachedDocument {
  id: string
  fileName: string
  studyType?: string
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Здравствуйте! Я ваш персональный медицинский ассистент. Можете задавать вопросы или прикрепить медицинские документы для анализа.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [availableDocuments, setAvailableDocuments] = useState<AttachedDocument[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [showDocumentSelector, setShowDocumentSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Загрузка доступных документов при открытии чата
  useEffect(() => {
    if (isOpen && availableDocuments.length === 0) {
      fetchDocuments()
    }
  }, [isOpen])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setAvailableDocuments(data.documents.map((doc: any) => ({
          id: doc.id,
          fileName: doc.fileName,
          studyType: doc.studyType
        })))
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const removeSelectedDocument = (documentId: string) => {
    setSelectedDocuments(prev => prev.filter(id => id !== documentId))
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const attachedDocs = selectedDocuments.map(id => 
      availableDocuments.find(doc => doc.id === id)!
    )

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachedDocuments: attachedDocs.length > 0 ? attachedDocs : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSelectedDocuments([])
    setShowDocumentSelector(false)
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
          documentIds: selectedDocuments // Отправляем ID документов
        })
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Ошибка получения ответа')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Ассистент</CardTitle>
            <CardDescription className="text-xs">Персональный медицинский помощник</CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex flex-col gap-2 max-w-[80%]">
              {message.attachedDocuments && message.attachedDocuments.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {message.attachedDocuments.map(doc => (
                    <Badge key={doc.id} variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {doc.studyType || doc.fileName}
                    </Badge>
                  ))}
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t space-y-2">
        {/* Прикрепленные документы */}
        {selectedDocuments.length > 0 && (
          <div className="flex flex-wrap gap-1 pb-2 border-b">
            {selectedDocuments.map(docId => {
              const doc = availableDocuments.find(d => d.id === docId)
              return doc ? (
                <Badge key={docId} variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {doc.studyType || doc.fileName}
                  <button
                    onClick={() => removeSelectedDocument(docId)}
                    className="ml-1 hover:text-destructive"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null
            })}
          </div>
        )}

        {/* Селектор документов */}
        {showDocumentSelector && (
          <div className="mb-2 p-2 border rounded-lg bg-muted/50 max-h-32 overflow-y-auto">
            {availableDocuments.length > 0 ? (
              <div className="space-y-1">
                {availableDocuments.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => toggleDocumentSelection(doc.id)}
                    className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-background transition-colors ${
                      selectedDocuments.includes(doc.id) ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {doc.studyType || doc.fileName}
                      </span>
                      {selectedDocuments.includes(doc.id) && (
                        <span className="text-primary">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Нет загруженных документов
              </p>
            )}
          </div>
        )}

        {/* Ввод сообщения */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDocumentSelector(!showDocumentSelector)}
            disabled={isLoading}
            title="Прикрепить документ"
          >
            <Paperclip className={`h-4 w-4 ${selectedDocuments.length > 0 ? 'text-primary' : ''}`} />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите ваш вопрос..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          AI может ошибаться. Проверяйте важную информацию.
        </p>
      </div>
    </Card>
  )
}

