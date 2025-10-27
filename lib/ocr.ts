// OCR и парсинг медицинских документов
import { createWorker, PSM } from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

// Выполнить OCR на изображении с Tesseract.js
export async function performTesseractOCR(imageData: string): Promise<OCRResult> {
  console.log('[Tesseract] Starting text recognition...')
  
  const worker = await createWorker('rus+eng')
  
  try {
    // Настройки для лучшего распознавания медицинских документов
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO_OSD, // Автоматическая сегментация с OSD
      preserve_interword_spaces: '1',
    })
    
    console.log('[Tesseract] Languages loaded, starting recognition...')
    
    // Выполняем распознавание
    const { data } = await worker.recognize(imageData)
    
    console.log(`[Tesseract] Recognition completed!`)
    console.log(`[Tesseract] Confidence: ${data.confidence}%`)
    console.log(`[Tesseract] Text length: ${data.text.length} characters`)
    
    await worker.terminate()
    
    return {
      text: data.text,
      confidence: data.confidence / 100
    }
  } catch (error) {
    console.error('[Tesseract] Recognition error:', error)
    await worker.terminate()
    throw new Error('Ошибка распознавания текста через Tesseract')
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

// Парсинг табличного формата (ДНКОМ и подобные)
function parseTableFormat(text: string): MedicalIndicator[] {
  const indicators: MedicalIndicator[] = []
  
  // Для формата ДНКОМ ищем "Эритроцитарные параметры" и извлекаем все значения
  const sections = [
    { header: 'Эритроцитарные параметры', indicators: [
      { name: 'Гемоглобин (Hb)', unit: 'г/л', min: 120, max: 160 },
      { name: 'Эритроциты (RBC)', unit: 'млн/мкл', min: 4.0, max: 5.5 },
      { name: 'Гематокрит (HCT)', unit: '%', min: 36, max: 48 },
      { name: 'MCV', unit: 'фл', min: 80, max: 100 },
      { name: 'MCH', unit: 'пг', min: 27, max: 34 },
      { name: 'MCHC', unit: 'г/дл', min: 320, max: 360 },
      { name: 'RDW', unit: '%', min: 11.5, max: 14.5 },
      { name: 'RDW-SD', unit: 'фл', min: 35, max: 56 },
      { name: 'Нормобласты (NRBC)', unit: '%', min: 0, max: 0 },
      { name: 'Нормобласты (абс)', unit: 'тыс/мкл', min: 0, max: 0 },
      { name: 'Макроциты (MacroR)', unit: '%', min: 0, max: 5 },
      { name: 'Микроциты (MicroR)', unit: '%', min: 0, max: 5 },
    ]},
    { header: 'Тромбоцитарные параметры', indicators: [
      { name: 'Тромбоциты (PLT)', unit: 'тыс/мкл', min: 150, max: 400 },
      { name: 'Тромбокрит (PCT)', unit: '%', min: 0.15, max: 0.40 },
      { name: 'MPV', unit: 'фл', min: 7, max: 11 },
      { name: 'PDW', unit: '%', min: 9, max: 17 },
      { name: 'P-LCR', unit: '%', min: 13, max: 43 },
    ]},
    { header: 'Лейкоцитарные параметры', indicators: [
      { name: 'Лейкоциты (WBC)', unit: 'тыс/мкл', min: 4.0, max: 9.0 },
      { name: 'Нейтрофилы абс (NEU)', unit: 'тыс/мкл', min: 2.0, max: 7.0 },
      { name: 'Эозинофилы абс (EOS)', unit: 'тыс/мкл', min: 0.02, max: 0.5 },
      { name: 'Базофилы абс (BAS)', unit: 'тыс/мкл', min: 0, max: 0.08 },
      { name: 'Моноциты абс (MON)', unit: 'тыс/мкл', min: 0.2, max: 0.8 },
      { name: 'Лимфоциты абс (LYM)', unit: 'тыс/мкл', min: 1.0, max: 4.5 },
      { name: 'Незрелые гранулоциты (IG)', unit: 'тыс/мкл', min: 0, max: 0.05 },
      { name: 'Реактивные лимфоциты', unit: 'тыс/мкл', min: 0, max: 0 },
      { name: 'Плазматические клетки', unit: 'тыс/мкл', min: 0, max: 0 },
      { name: 'Нейтрофилы % (NEU%)', unit: '%', min: 47, max: 72 },
      { name: 'Эозинофилы % (EOS%)', unit: '%', min: 0.5, max: 5 },
      { name: 'Базофилы % (BAS%)', unit: '%', min: 0, max: 1 },
      { name: 'Моноциты % (MON%)', unit: '%', min: 3, max: 11 },
      { name: 'Лимфоциты % (LYM%)', unit: '%', min: 19, max: 37 },
    ]}
  ]
  
  sections.forEach((section, sectionIdx) => {
    // Ищем секцию и извлекаем значения до следующей секции
    const nextSection = sections[sectionIdx + 1]
    const sectionRegex = new RegExp(
      `${section.header}[\\s\\S]*?(?:Результат)?[\\s\\S]*?([\\d,\\.\\s]+?)(?:${nextSection?.header || 'Единицы измерения|Референсные значения|$'})`, 
      'i'
    )
    const match = text.match(sectionRegex)
    
    if (match) {
      // Извлекаем все числа из захваченной группы
      const values = match[1].match(/\d+[,.]?\d*/g) || []
      console.log(`[PARSER] Section "${section.header}": found ${values.length} values`)
      
      // Сопоставляем значения с показателями
      section.indicators.forEach((ind, idx) => {
        if (idx < values.length) {
          const valueStr = values[idx].replace(',', '.')
          const value = parseFloat(valueStr)
          
          // Фильтруем нулевые значения для показателей, которые должны быть > 0
          if (!isNaN(value) && (value > 0 || ind.min === 0)) {
            const isNormal = value >= ind.min && value <= ind.max
            indicators.push({
              name: ind.name,
              value,
              unit: ind.unit,
              referenceMin: ind.min,
              referenceMax: ind.max,
              isNormal
            })
            
            console.log(`[PARSER] ${ind.name} = ${value} ${ind.unit} (${isNormal ? 'NORM' : 'DEVIATION'})`)
          }
        }
      })
    } else {
      console.log(`[PARSER] Section "${section.header}": NOT FOUND`)
    }
  })
  
  return indicators
}

// Извлечение показателей (анализы крови) - расширенный список
function extractIndicators(text: string): MedicalIndicator[] {
  // Сначала пробуем табличный формат
  const tableIndicators = parseTableFormat(text)
  if (tableIndicators.length > 0) {
    console.log(`[PARSER] Using table format parser, found ${tableIndicators.length} indicators`)
    return tableIndicators
  }
  
  console.log('[PARSER] Table format not detected, trying standard format')
  
  const indicators: MedicalIndicator[] = []
  
  // Полный список показателей для развернутого анализа крови
  // Улучшенные паттерны - более гибкие для разных форматов документов
  const indicatorPatterns = [
    // Общие показатели
    {
      name: 'Гемоглобин (HGB)',
      pattern: /(?:гемоглобин|hemoglobin|hgb|hb)[\s:,\-\.]*\s*(\d+[.,]?\d*)\s*(?:г\/л|g\/l|г\/дл)?/i,
      unit: 'г/л',
      refMin: 120,
      refMax: 160
    },
    {
      name: 'Эритроциты (RBC)',
      pattern: /(?:эритроциты|erythrocytes|rbc)[\s:,\-\.]*\s*(\d+[.,]?\d*)\s*(?:млн\/мкл|×10\^12\/л|10\^12\/l|×10\s*12)?/i,
      unit: 'млн/мкл',
      refMin: 4.0,
      refMax: 5.5
    },
    {
      name: 'Гематокрит (HCT)',
      pattern: /(?:гематокрит|hct)[:\s]+(\d+\.?\d*)\s*(%)?/i,
      unit: '%',
      refMin: 36,
      refMax: 48
    },
    {
      name: 'Средний объем эритроцита (MCV)',
      pattern: /(?:средний объем эритроцита|mcv)[:\s]+(\d+\.?\d*)\s*(фл)?/i,
      unit: 'фл',
      refMin: 80,
      refMax: 100
    },
    {
      name: 'Среднее содержание Hb (MCH)',
      pattern: /(?:среднее содержание|mch)[:\s]+(\d+\.?\d*)\s*(пг)?/i,
      unit: 'пг',
      refMin: 27,
      refMax: 34
    },
    // Лейкоцитарная формула
    {
      name: 'Лейкоциты (WBC)',
      pattern: /(?:лейкоциты|leukocytes|wbc)[\s:,\-\.]*\s*(\d+[.,]?\d*)\s*(?:тыс\/мкл|×10\^9\/л|10\^9\/l|×10\s*9)?/i,
      unit: 'тыс/мкл',
      refMin: 4.0,
      refMax: 9.0
    },
    {
      name: 'Нейтрофилы сегментоядерные',
      pattern: /(?:нейтрофилы.*сегментоядерные|neutrophils)[:\s]+(\d+\.?\d*)\s*(%)?/i,
      unit: '%',
      refMin: 47,
      refMax: 72
    },
    {
      name: 'Лимфоциты',
      pattern: /лимфоциты[:\s]+(\d+\.?\d*)\s*(%)?/i,
      unit: '%',
      refMin: 19,
      refMax: 37
    },
    {
      name: 'Моноциты',
      pattern: /моноциты[:\s]+(\d+\.?\d*)\s*(%)?/i,
      unit: '%',
      refMin: 3,
      refMax: 11
    },
    {
      name: 'Эозинофилы',
      pattern: /эозинофилы[:\s]+(\d+\.?\d*)\s*(%)?/i,
      unit: '%',
      refMin: 0.5,
      refMax: 5
    },
    {
      name: 'Базофилы',
      pattern: /базофилы[:\s]+(\d+\.?\d*)\s*(%)?/i,
      unit: '%',
      refMin: 0,
      refMax: 1
    },
    // Тромбоциты и свертывание
    {
      name: 'Тромбоциты (PLT)',
      pattern: /(?:тромбоциты|plt)[:\s]+(\d+\.?\d*)\s*(тыс\/мкл|×10\^9\/л)?/i,
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
    // Биохимия
    {
      name: 'Глюкоза',
      pattern: /глюкоза[:\s]+(\d+\.?\d*)\s*(ммоль\/л)?/i,
      unit: 'ммоль/л',
      refMin: 3.3,
      refMax: 5.5
    },
    {
      name: 'Общий белок',
      pattern: /общий белок[:\s]+(\d+\.?\d*)\s*(г\/л)?/i,
      unit: 'г/л',
      refMin: 64,
      refMax: 83
    },
    // Дополнительные показатели
    {
      name: 'Холестерин',
      pattern: /холестерин[:\s]+(\d+\.?\d*)\s*(ммоль\/л)?/i,
      unit: 'ммоль/л',
      refMin: 3.0,
      refMax: 5.2
    },
    {
      name: 'Билирубин общий',
      pattern: /билирубин общий[:\s]+(\d+\.?\d*)\s*(мкмоль\/л)?/i,
      unit: 'мкмоль/л',
      refMin: 3.4,
      refMax: 20.5
    },
    {
      name: 'АЛТ',
      pattern: /(?:алт|alt)[:\s]+(\d+\.?\d*)\s*(ед\/л|u\/l)?/i,
      unit: 'Ед/л',
      refMin: 0,
      refMax: 41
    },
    {
      name: 'АСТ',
      pattern: /(?:аст|ast)[:\s]+(\d+\.?\d*)\s*(ед\/л|u\/l)?/i,
      unit: 'Ед/л',
      refMin: 0,
      refMax: 40
    },
    {
      name: 'Креатинин',
      pattern: /креатинин[:\s]+(\d+\.?\d*)\s*(мкмоль\/л)?/i,
      unit: 'мкмоль/л',
      refMin: 62,
      refMax: 106
    },
  ]
  
  for (const { name, pattern, unit, refMin, refMax } of indicatorPatterns) {
    const match = text.match(pattern)
    if (match) {
      // Заменяем запятую на точку для корректного парсинга
      const valueStr = match[1].replace(',', '.')
      const value = parseFloat(valueStr)
      
      if (!isNaN(value)) {
        const isNormal = value >= refMin && value <= refMax
        
        indicators.push({
          name,
          value,
          unit,
          referenceMin: refMin,
          referenceMax: refMax,
          isNormal
        })
        
        console.log(`[PARSER] Found: ${name} = ${value} ${unit} (${isNormal ? 'NORM' : 'DEVIATION'})`)
      }
    }
  }
  
  console.log(`[PARSER] Total indicators found: ${indicators.length}`)
  return indicators
}

// Парсинг медицинских данных из текста
export function parseMedicalData(text: string): ParsedMedicalData {
  console.log('[PARSER] Starting medical data extraction...')
  console.log(`[PARSER] Text length: ${text.length} characters`)
  
  // Выводим первые 1500 символов для отладки (больше контекста)
  console.log('[PARSER] ==== BEGIN TEXT ====')
  console.log(text.substring(0, 1500))
  console.log('[PARSER] ==== END SAMPLE ====')
  
  const studyType = extractStudyType(text)
  const studyDate = extractDate(text)
  const laboratory = extractLaboratory(text)
  const doctor = extractDoctor(text)
  const indicators = extractIndicators(text)
  
  // Извлечение заключения/findings (последний абзац обычно)
  const lines = text.split('\n').filter(line => line.trim())
  const findings = lines.length > 5 ? lines.slice(-3).join(' ') : undefined
  
  console.log(`[PARSER] Extracted: type=${studyType}, date=${studyDate?.toLocaleDateString()}, indicators=${indicators.length}`)
  
  return {
    studyType,
    studyDate,
    laboratory,
    doctor,
    findings,
    indicators
  }
}

