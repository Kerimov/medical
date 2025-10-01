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

// Глобальное хранилище документов
const globalForDocs = globalThis as unknown as {
  documents: MedicalDocument[] | undefined
}

const documents = globalForDocs.documents ?? []
globalForDocs.documents = documents

console.log(`[DOCS] Initialized with ${documents.length} documents`)

export const documentsDb = {
  findByUserId: (userId: string): MedicalDocument[] => {
    return documents.filter(doc => doc.userId === userId)
  },
  
  findById: (id: string): MedicalDocument | undefined => {
    return documents.find(doc => doc.id === id)
  },
  
  create: (document: Omit<MedicalDocument, 'id' | 'uploadDate'>): MedicalDocument => {
    const newDoc: MedicalDocument = {
      id: Math.random().toString(36).substring(2, 15),
      uploadDate: new Date(),
      ...document
    }
    documents.push(newDoc)
    globalForDocs.documents = documents
    console.log(`[DOCS] Document created: ${newDoc.fileName}. Total: ${documents.length}`)
    return newDoc
  },
  
  update: (id: string, updates: Partial<MedicalDocument>): MedicalDocument | null => {
    const index = documents.findIndex(doc => doc.id === id)
    if (index === -1) return null
    
    documents[index] = { ...documents[index], ...updates }
    globalForDocs.documents = documents
    return documents[index]
  },
  
  delete: (id: string): boolean => {
    const index = documents.findIndex(doc => doc.id === id)
    if (index === -1) return false
    
    documents.splice(index, 1)
    globalForDocs.documents = documents
    console.log(`[DOCS] Document deleted. Total: ${documents.length}`)
    return true
  },
  
  getAll: (): MedicalDocument[] => {
    return documents
  }
}

