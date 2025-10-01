// OCR и парсинг медицинских документов
import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

// Выполнить OCR на изображении
export async function performOCR(imageData: string): Promise<OCRResult> {
  try {
    console.log('[OCR] Starting text recognition...')
    
    const { data } = await Tesseract.recognize(
      imageData,
      'rus+eng', // Поддержка русского и английского
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      }
    )
    
    console.log(`[OCR] Recognition completed with ${data.confidence}% confidence`)
    
    return {
      text: data.text,
      confidence: data.confidence / 100 // Конвертируем в 0-1
    }
  } catch (error) {
    console.error('[OCR] Recognition error:', error)
    throw new Error('Ошибка распознавания текста')
  }
}

// Парсер медицинских данных
export interface ParsedMedicalData {
  studyType?: string
  studyDate?: Date
  laboratory?: string
  doctor?: string
  findings?: string
  indicators: MedicalIndicator[]
}

export interface MedicalIndicator {
  name: string
  value: string | number
  unit?: string
  referenceMin?: number
  referenceMax?: number
  isNormal?: boolean
}

// Извлечение даты из текста
function extractDate(text: string): Date | undefined {
  // Паттерны дат: DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const datePatterns = [
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{1,2})-(\d{1,2})-(\d{4})/,
  ]
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      const day = parseInt(match[1])
      const month = parseInt(match[2]) - 1 // Месяцы с 0
      const year = parseInt(match[3])
      
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  
  return undefined
}

// Извлечение типа исследования
function extractStudyType(text: string): string | undefined {
  const lowerText = text.toLowerCase()
  
  const studyTypes = [
    { keywords: ['общий анализ крови', 'оак'], type: 'Общий анализ крови' },
    { keywords: ['биохимический анализ', 'биохимия'], type: 'Биохимический анализ крови' },
    { keywords: ['анализ мочи', 'оам'], type: 'Общий анализ мочи' },
    { keywords: ['мрт', 'магнитно-резонансная томография'], type: 'МРТ' },
    { keywords: ['кт', 'компьютерная томография'], type: 'КТ' },
    { keywords: ['узи', 'ультразвуковое исследование'], type: 'УЗИ' },
    { keywords: ['экг', 'электрокардиограмма'], type: 'ЭКГ' },
    { keywords: ['рентген', 'рентгенография'], type: 'Рентгенография' },
    { keywords: ['флюорография'], type: 'Флюорография' },
  ]
  
  for (const { keywords, type } of studyTypes) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return type
      }
    }
  }
  
  return undefined
}

// Извлечение лаборатории/клиники
function extractLaboratory(text: string): string | undefined {
  const labPatterns = [
    /(?:лаборатория|клиника|мед(?:ицинский)?\s*центр)[:\s]+([^\n]+)/i,
    /(?:выполнено в|место проведения)[:\s]+([^\n]+)/i,
  ]
  
  for (const pattern of labPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  return undefined
}

// Извлечение врача
function extractDoctor(text: string): string | undefined {
  const doctorPatterns = [
    /(?:врач|доктор|специалист)[:\s]+([А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.)/,
    /(?:подпись врача|заключение)[:\s]+([А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.)/,
  ]
  
  for (const pattern of doctorPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  return undefined
}

// Извлечение показателей (анализы крови)
function extractIndicators(text: string): MedicalIndicator[] {
  const indicators: MedicalIndicator[] = []
  
  // Распространенные показатели анализов
  const indicatorPatterns = [
    {
      name: 'Гемоглобин',
      pattern: /гемоглобин[:\s]+(\d+\.?\d*)\s*(г\/л)?/i,
      unit: 'г/л',
      refMin: 120,
      refMax: 160
    },
    {
      name: 'Эритроциты',
      pattern: /эритроциты[:\s]+(\d+\.?\d*)\s*(млн\/мкл|×10\^12\/л)?/i,
      unit: 'млн/мкл',
      refMin: 4.0,
      refMax: 5.5
    },
    {
      name: 'Лейкоциты',
      pattern: /лейкоциты[:\s]+(\d+\.?\d*)\s*(тыс\/мкл|×10\^9\/л)?/i,
      unit: 'тыс/мкл',
      refMin: 4.0,
      refMax: 9.0
    },
    {
      name: 'Тромбоциты',
      pattern: /тромбоциты[:\s]+(\d+\.?\d*)\s*(тыс\/мкл|×10\^9\/л)?/i,
      unit: 'тыс/мкл',
      refMin: 150,
      refMax: 400
    },
    {
      name: 'СОЭ',
      pattern: /соэ[:\s]+(\d+\.?\d*)\s*(мм\/ч)?/i,
      unit: 'мм/ч',
      refMin: 0,
      refMax: 15
    },
    {
      name: 'Глюкоза',
      pattern: /глюкоза[:\s]+(\d+\.?\d*)\s*(ммоль\/л)?/i,
      unit: 'ммоль/л',
      refMin: 3.3,
      refMax: 5.5
    },
    {
      name: 'Холестерин',
      pattern: /холестерин[:\s]+(\d+\.?\d*)\s*(ммоль\/л)?/i,
      unit: 'ммоль/л',
      refMin: 3.0,
      refMax: 5.2
    },
  ]
  
  for (const { name, pattern, unit, refMin, refMax } of indicatorPatterns) {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1])
      const isNormal = value >= refMin && value <= refMax
      
      indicators.push({
        name,
        value,
        unit,
        referenceMin: refMin,
        referenceMax: refMax,
        isNormal
      })
    }
  }
  
  return indicators
}

// Парсинг медицинских данных из текста
export function parseMedicalData(text: string): ParsedMedicalData {
  console.log('[PARSER] Starting medical data extraction...')
  
  const studyType = extractStudyType(text)
  const studyDate = extractDate(text)
  const laboratory = extractLaboratory(text)
  const doctor = extractDoctor(text)
  const indicators = extractIndicators(text)
  
  // Извлечение заключения/findings (последний абзац обычно)
  const lines = text.split('\n').filter(line => line.trim())
  const findings = lines.length > 5 ? lines.slice(-3).join(' ') : undefined
  
  console.log(`[PARSER] Extracted: type=${studyType}, indicators=${indicators.length}`)
  
  return {
    studyType,
    studyDate,
    laboratory,
    doctor,
    findings,
    indicators
  }
}

