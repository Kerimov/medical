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
    
    const formData = new FormData()
    formData.append('base64Image', imageBase64)
    formData.append('language', 'rus')
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('scale', 'true')
    formData.append('OCREngine', '2') // Engine 2 лучше для русского
    
    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld'
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey
      },
      body: formData
    })
    
    const data = await response.json()
    
    // Собираем текст со всех страниц, если их несколько
    const results: any[] = Array.isArray(data.ParsedResults) ? data.ParsedResults : []
    
    // Логируем информацию о распознавании для отладки
    logger.info('OCR.space response', 'OCR.space', { 
      hasResults: !!data.ParsedResults,
      resultsCount: results.length,
      isErrored: data.IsErroredOnProcessing,
      errorMessage: data.ErrorMessage
    })
    
    // Объединяем текст со всех страниц
    const pageTexts = results.map((r, index) => {
      const pageText = r?.ParsedText || ''
      // Добавляем маркер страницы только если страниц больше одной
      if (results.length > 1 && pageText.trim()) {
        return `\n--- Страница ${index + 1} ---\n${pageText}`
      }
      return pageText
    })
    const combinedText = pageTexts.join('\n\n')
    
    const exitCodes = results.map(r => r?.FileParseExitCode).filter((c: any) => typeof c !== 'undefined')
    const exitCode = exitCodes.length > 0 ? exitCodes.every((c: number) => c === 1) ? 1 : 0 : 0
    
    if (data.IsErroredOnProcessing && combinedText.length === 0) {
      const errorMsg = data.ErrorMessage?.[0] || data.ErrorDetails || 'OCR processing failed'
      logger.error('OCR processing error', 'OCR.space', { error: errorMsg })
      throw new Error(errorMsg)
    }
    
    // Если есть текст, считаем это успехом (даже если были warnings)
    if (combinedText.length > 0) {
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
    }
    
    throw new Error('No text extracted from document')
  } catch (error) {
    logger.error('OCR recognition error', 'OCR.space', error)
    throw new Error('Ошибка распознавания текста через OCR.space')
  }
}

