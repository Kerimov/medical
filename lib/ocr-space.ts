// OCR.space API - бесплатный OCR сервис
// 25,000 запросов/месяц бесплатно

import { logger } from './logger'

export interface OCRSpaceResult {
  text: string
  confidence: number
}

export async function performOCRSpace(imageBase64: string): Promise<OCRSpaceResult> {
  try {
    logger.info('Starting text recognition', 'OCR.space')
    
    // Убираем префикс data:...;base64, если он есть (OCR.space ожидает чистый base64)
    let cleanBase64 = imageBase64
    if (imageBase64.includes(',')) {
      cleanBase64 = imageBase64.split(',')[1]
    }
    
    // Определяем тип файла по префиксу
    const isPDF = imageBase64.startsWith('data:application/pdf') || imageBase64.includes('application/pdf')
    
    const formData = new FormData()
    formData.append('base64Image', cleanBase64)
    formData.append('language', 'rus')
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('scale', 'true')
    formData.append('OCREngine', '2') // Engine 2 лучше для русского
    
    // Для PDF добавляем параметры для обработки всех страниц
    if (isPDF) {
      formData.append('filetype', 'PDF')
      // OCR.space по умолчанию обрабатывает все страницы PDF, но можно явно указать
      // Для бесплатного плана обычно обрабатываются все страницы
    }
    
    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld'
    logger.info('Using OCR.space API key', 'OCR.space', { hasKey: !!process.env.OCR_SPACE_API_KEY, isPDF })
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey
      },
      body: formData
    })
    
    const data = await response.json()
    
    // Логируем информацию о распознавании
    logger.info('OCR.space response', 'OCR.space', { 
      hasResults: !!data.ParsedResults,
      resultsCount: Array.isArray(data.ParsedResults) ? data.ParsedResults.length : 0,
      isErrored: data.IsErroredOnProcessing,
      errorMessage: data.ErrorMessage
    })
    
    // Собираем текст со всех страниц, если их несколько
    const results: any[] = Array.isArray(data.ParsedResults) ? data.ParsedResults : []
    
    if (results.length === 0 && data.IsErroredOnProcessing) {
      const errorMsg = data.ErrorMessage?.[0] || data.ErrorDetails || 'OCR processing failed'
      logger.error('OCR processing error', 'OCR.space', { error: errorMsg, fullResponse: data })
      throw new Error(errorMsg)
    }
    
    // Объединяем текст со всех страниц с разделителем
    const pageTexts = results.map((r, index) => {
      const pageText = r?.ParsedText || ''
      // Добавляем маркер страницы для отладки
      if (results.length > 1 && pageText) {
        return `\n--- Страница ${index + 1} ---\n${pageText}`
      }
      return pageText
    })
    const combinedText = pageTexts.join('\n\n')
    
    const exitCodes = results.map(r => r?.FileParseExitCode).filter((c: any) => typeof c !== 'undefined')
    const exitCode = exitCodes.length > 0 ? exitCodes.every((c: number) => c === 1) ? 1 : 0 : 0
    
    if (combinedText.length === 0) {
      throw new Error('No text extracted from document')
    }
    
    logger.info('Recognition completed', 'OCR.space', { 
      exitCode, 
      textLength: combinedText.length, 
      pages: results.length,
      pagesWithText: results.filter(r => r?.ParsedText?.trim()).length
    })
    
    if (data.IsErroredOnProcessing) {
      logger.warn('Partial OCR success', 'OCR.space', { warning: data.ErrorMessage?.[0] || 'Partial success' })
    }
    
    return {
      text: combinedText,
      confidence: exitCode === 1 ? 0.85 : 0.70 // Оценочная уверенность
    }
  } catch (error) {
    logger.error('OCR recognition error', 'OCR.space', error)
    throw new Error('Ошибка распознавания текста через OCR.space')
  }
}

