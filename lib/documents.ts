// Типы документов и данных
export interface MedicalDocument {
  id: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadDate: Date
  
  // Извлеченные данные
  parsed: boolean
  studyDate?: Date
  studyType?: string
  laboratory?: string
  doctor?: string
  findings?: string
  
  // Извлеченные показатели
  indicators?: MedicalIndicator[]
  
  // OCR результат
  rawText?: string
  ocrConfidence?: number
  
  // Метаданные
  tags?: string[]
  category?: DocumentCategory
  notes?: string
}

export interface MedicalIndicator {
  name: string
  value: string | number
  unit?: string
  referenceMin?: number
  referenceMax?: number
  isNormal?: boolean
}

export enum DocumentCategory {
  BLOOD_TEST = 'blood_test',
  URINE_TEST = 'urine_test',
  IMAGING = 'imaging',
  PRESCRIPTION = 'prescription',
  MEDICAL_REPORT = 'medical_report',
  VACCINATION = 'vaccination',
  OTHER = 'other'
}


