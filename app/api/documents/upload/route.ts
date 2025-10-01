import { NextRequest, NextResponse } from 'next/server'
import { documentsDb, DocumentCategory } from '@/lib/documents'
import { verifyToken } from '@/lib/auth'
import { parse as parseCookies } from 'cookie'

// Размер файла в байтах (10 MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Разрешенные типы файлов
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/dicom',
  'text/csv',
  'text/plain'
]

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const cookieHeader = request.headers.get('cookie')
    const cookies = cookieHeader ? parseCookies(cookieHeader) : {}
    const token = cookies.token

    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      )
    }

    // Получаем файл
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Проверка размера
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Размер файла превышает ${MAX_FILE_SIZE / 1024 / 1024} МБ` },
        { status: 400 }
      )
    }

    // Проверка типа
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Неподдерживаемый тип файла' },
        { status: 400 }
      )
    }

    // Конвертируем файл в base64 для хранения
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const fileUrl = `data:${file.type};base64,${base64}`

    // Определяем категорию по типу файла
    let category: DocumentCategory = DocumentCategory.OTHER
    if (file.type.includes('image') || file.type.includes('dicom')) {
      category = DocumentCategory.IMAGING
    }

    // Создаем документ
    const document = documentsDb.create({
      userId: payload.userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl,
      parsed: false,
      category
    })

    // Запускаем асинхронную обработку OCR (не блокируем ответ)
    processDocumentOCR(document.id).catch(err => {
      console.error('OCR processing error:', err)
    })

    return NextResponse.json({
      message: 'Файл успешно загружен',
      document: {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        uploadDate: document.uploadDate
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки файла' },
      { status: 500 }
    )
  }
}

// Асинхронная обработка OCR
async function processDocumentOCR(documentId: string) {
  console.log(`[OCR] Starting processing for document ${documentId}`)
  
  const document = documentsDb.findById(documentId)
  if (!document) return

  try {
    // Проверяем, является ли файл изображением или PDF
    const isImage = document.fileType.includes('image')
    const isPDF = document.fileType.includes('pdf')
    
    if (!isImage && !isPDF) {
      console.log(`[OCR] Skipping OCR for file type: ${document.fileType}`)
      return
    }

    // Для реального OCR раскомментируйте этот код:
    /*
    const { performOCR, parseMedicalData } = await import('@/lib/ocr')
    
    // Выполняем OCR
    const ocrResult = await performOCR(document.fileUrl)
    
    // Парсим медицинские данные
    const medicalData = parseMedicalData(ocrResult.text)
    
    // Обновляем документ
    documentsDb.update(documentId, {
      rawText: ocrResult.text,
      ocrConfidence: ocrResult.confidence,
      studyType: medicalData.studyType,
      studyDate: medicalData.studyDate,
      laboratory: medicalData.laboratory,
      doctor: medicalData.doctor,
      findings: medicalData.findings,
      indicators: medicalData.indicators,
      parsed: true
    })
    */
    
    // Временная имитация (удалить после раскомментирования выше)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockData = {
      rawText: 'Общий анализ крови\nДата: 15.10.2024\nЛаборатория: МедЛаб\nГемоглобин: 145 г/л\nЭритроциты: 4.5 млн/мкл\nЛейкоциты: 6.2 тыс/мкл\nСОЭ: 8 мм/ч\nЗаключение: Показатели в пределах нормы.',
      ocrConfidence: 0.95,
      studyType: 'Общий анализ крови',
      studyDate: new Date('2024-10-15'),
      laboratory: 'МедЛаб',
      doctor: 'Иванов И.И.',
      findings: 'Показатели в пределах нормы',
      parsed: true,
      indicators: [
        {
          name: 'Гемоглобин',
          value: 145,
          unit: 'г/л',
          referenceMin: 120,
          referenceMax: 160,
          isNormal: true
        },
        {
          name: 'Эритроциты',
          value: 4.5,
          unit: 'млн/мкл',
          referenceMin: 4.0,
          referenceMax: 5.5,
          isNormal: true
        },
        {
          name: 'Лейкоциты',
          value: 6.2,
          unit: 'тыс/мкл',
          referenceMin: 4.0,
          referenceMax: 9.0,
          isNormal: true
        },
        {
          name: 'СОЭ',
          value: 8,
          unit: 'мм/ч',
          referenceMin: 0,
          referenceMax: 15,
          isNormal: true
        }
      ]
    }

    documentsDb.update(documentId, mockData)
    console.log(`[OCR] Processing completed for document ${documentId}`)
    
  } catch (error) {
    console.error(`[OCR] Error processing document ${documentId}:`, error)
    documentsDb.update(documentId, {
      parsed: false,
      ocrConfidence: 0
    })
  }
}

