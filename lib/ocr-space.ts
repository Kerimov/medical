// OCR.space API - бесплатный OCR сервис
// 25,000 запросов/месяц бесплатно

export interface OCRSpaceResult {
  text: string
  confidence: number
}

export async function performOCRSpace(imageBase64: string): Promise<OCRSpaceResult> {
  try {
    console.log('[OCR.space] Starting text recognition...')
    
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
        'apikey': process.env.OCR_SPACE_API_KEY || 'K87899142388957' // Бесплатный тестовый ключ
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage?.[0] || 'OCR processing failed')
    }
    
    const text = data.ParsedResults?.[0]?.ParsedText || ''
    const exitCode = data.ParsedResults?.[0]?.FileParseExitCode || 0
    
    console.log(`[OCR.space] Recognition completed. Exit code: ${exitCode}`)
    console.log(`[OCR.space] Extracted ${text.length} characters`)
    
    return {
      text: text,
      confidence: exitCode === 1 ? 0.85 : 0.60 // Оценочная уверенность
    }
  } catch (error) {
    console.error('[OCR.space] Recognition error:', error)
    throw new Error('Ошибка распознавания текста через OCR.space')
  }
}

