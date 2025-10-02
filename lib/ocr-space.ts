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
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': process.env.OCR_SPACE_API_KEY || 'helloworld' // Заглушка для разработки
      },
      body: formData
    })
    
    const data = await response.json()
    
    // Даже если есть ошибка, проверяем, был ли распознан хоть какой-то текст
    const text = data.ParsedResults?.[0]?.ParsedText || ''
    const exitCode = data.ParsedResults?.[0]?.FileParseExitCode || 0
    
    if (data.IsErroredOnProcessing && text.length === 0) {
      const errorMsg = data.ErrorMessage?.[0] || data.ErrorDetails || 'OCR processing failed'
      logger.error('OCR processing error', 'OCR.space', { error: errorMsg })
      throw new Error(errorMsg)
    }
    
    // Если есть текст, считаем это успехом (даже если были warnings)
    if (text.length > 0) {
      logger.info('Recognition completed', 'OCR.space', { exitCode, textLength: text.length })
      
      if (data.IsErroredOnProcessing) {
        logger.warn('Partial OCR success', 'OCR.space', { warning: data.ErrorMessage?.[0] || 'Partial success' })
      }
      
      return {
        text: text,
        confidence: exitCode === 1 ? 0.85 : 0.70 // Оценочная уверенность
      }
    }
    
    throw new Error('No text extracted from document')
  } catch (error) {
    logger.error('OCR recognition error', 'OCR.space', error)
    throw new Error('Ошибка распознавания текста через OCR.space')
  }
}

