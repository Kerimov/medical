# 📄 Модуль "Документы"

## Обзор

Полноценная система управления медицинскими документами с поддержкой загрузки, OCR распознавания и извлечения медицинских данных.

## 🎯 Возможности

### ✅ Текущий функционал (MVP)

1. **Загрузка файлов**
   - 📤 Drag & Drop интерфейс
   - 📁 Выбор через файловый менеджер
   - 📊 Поддержка форматов: PDF, JPG, PNG, DICOM, CSV, TXT
   - ⚖️ Ограничение размера: 10 МБ
   - 🔐 Авторизованный доступ

2. **Хранение документов**
   - 💾 Base64 кодирование в памяти
   - 👤 Документы привязаны к пользователю
   - 🏷️ Автоматическая категоризация
   - 📅 Метаданные (дата загрузки, размер, тип)

3. **Управление документами**
   - 📋 Список всех документов
   - 🔍 Поиск по названию и типу
   - 🏷️ Фильтрация по категориям
   - 🗑️ Удаление документов
   - 👁️ Просмотр (в разработке)

4. **Интерфейс**
   - 🎨 Современный UI с карточками
   - 📱 Адаптивный дизайн
   - ⚡ Индикаторы загрузки
   - ✅ Статус обработки OCR

### 🔜 В разработке

5. **OCR (Optical Character Recognition)**
   - 📝 Извлечение текста из изображений
   - 📄 Парсинг PDF документов
   - 🎯 Определение уверенности распознавания
   - 🔄 Асинхронная обработка

6. **Парсинг медицинских данных**
   - 🏥 Тип исследования
   - 📅 Дата исследования
   - 🏢 Лаборатория/Клиника
   - 👨‍⚕️ Врач
   - 📊 Медицинские показатели:
     - Название
     - Значение
     - Единицы измерения
     - Референсные значения
     - Норма/отклонение

7. **Расширенные функции**
   - 📈 Графики показателей в динамике
   - 🔗 Связь с дневником здоровья
   - 📤 Экспорт данных
   - 🏷️ Теги и метки
   - 📝 Заметки к документам

## 📁 Структура данных

### MedicalDocument

```typescript
interface MedicalDocument {
  // Основная информация
  id: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string  // Base64 encoded
  uploadDate: Date
  
  // Статус обработки
  parsed: boolean
  ocrConfidence?: number
  
  // Извлеченные данные
  studyDate?: Date
  studyType?: string
  laboratory?: string
  doctor?: string
  findings?: string
  
  // Показатели
  indicators?: MedicalIndicator[]
  
  // OCR результат
  rawText?: string
  
  // Метаданные
  tags?: string[]
  category?: DocumentCategory
  notes?: string
}
```

### MedicalIndicator

```typescript
interface MedicalIndicator {
  name: string                // Гемоглобин
  value: string | number      // 145
  unit?: string               // г/л
  referenceMin?: number       // 120
  referenceMax?: number       // 160
  isNormal?: boolean          // true
}
```

### DocumentCategory

```typescript
enum DocumentCategory {
  BLOOD_TEST = 'blood_test',      // Анализ крови
  URINE_TEST = 'urine_test',      // Анализ мочи
  IMAGING = 'imaging',             // Снимки (МРТ, КТ, Рентген)
  PRESCRIPTION = 'prescription',   // Рецепты
  MEDICAL_REPORT = 'medical_report', // Заключения врачей
  VACCINATION = 'vaccination',     // Прививки
  OTHER = 'other'                  // Прочее
}
```

## 🔌 API Endpoints

### GET `/api/documents`

Получить все документы текущего пользователя.

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response:**
```json
{
  "documents": [
    {
      "id": "doc_123",
      "fileName": "Анализ крови.pdf",
      "fileType": "application/pdf",
      "fileSize": 524288,
      "uploadDate": "2024-10-01T10:00:00Z",
      "parsed": true,
      "studyType": "Общий анализ крови",
      "studyDate": "2024-09-28T00:00:00Z",
      "ocrConfidence": 0.95,
      "category": "blood_test"
    }
  ]
}
```

### POST `/api/documents/upload`

Загрузить новый документ.

**Headers:**
```
Cookie: token=<jwt_token>
Content-Type: multipart/form-data
```

**Body:**
```
FormData:
  file: File
```

**Response:**
```json
{
  "message": "Файл успешно загружен",
  "document": {
    "id": "doc_124",
    "fileName": "Анализ крови.pdf",
    "fileType": "application/pdf",
    "fileSize": 524288,
    "uploadDate": "2024-10-01T12:00:00Z"
  }
}
```

### GET `/api/documents/:id`

Получить конкретный документ.

**Response:**
```json
{
  "document": {
    "id": "doc_123",
    "fileName": "Анализ крови.pdf",
    "fileUrl": "data:application/pdf;base64,...",
    "indicators": [
      {
        "name": "Гемоглобин",
        "value": 145,
        "unit": "г/л",
        "referenceMin": 120,
        "referenceMax": 160,
        "isNormal": true
      }
    ]
  }
}
```

### DELETE `/api/documents/:id`

Удалить документ.

**Response:**
```json
{
  "message": "Документ удален"
}
```

### PATCH `/api/documents/:id`

Обновить документ (метаданные, заметки, теги).

**Body:**
```json
{
  "notes": "Повторить анализ через месяц",
  "tags": ["важно", "контроль"]
}
```

## 🔧 Интеграция OCR

### Текущая реализация (Mock)

Сейчас используются тестовые данные для демонстрации:

```typescript
const mockData = {
  rawText: 'Общий анализ крови...',
  ocrConfidence: 0.95,
  studyType: 'Общий анализ крови',
  studyDate: new Date('2024-10-15'),
  indicators: [...]
}
```

### Будущая реализация (Tesseract.js)

```typescript
import Tesseract from 'tesseract.js'

async function performOCR(imageData: string) {
  const { data: { text, confidence } } = await Tesseract.recognize(
    imageData,
    'rus+eng',
    {
      logger: m => console.log(m)
    }
  )
  
  return {
    rawText: text,
    ocrConfidence: confidence / 100
  }
}
```

### Альтернативы

1. **Google Cloud Vision API** - платный, очень точный
2. **AWS Textract** - медицинская специализация
3. **Azure Computer Vision** - хорошая поддержка русского
4. **OpenAI Vision API** - можно использовать для извлечения структурированных данных

## 📊 Парсинг медицинских данных

### Подход 1: Регулярные выражения

```typescript
function parseBloodTest(text: string) {
  const patterns = {
    hemoglobin: /гемоглобин.*?(\d+\.?\d*)\s*(г\/л)?/i,
    date: /дата.*?(\d{2}\.\d{2}\.\d{4})/i
  }
  
  // Извлечение данных...
}
```

### Подход 2: OpenAI GPT-4

```typescript
const prompt = `
Извлеки из текста медицинского анализа:
- Тип исследования
- Дату
- Показатели (название, значение, норма)

Текст:
${rawText}

Ответь в формате JSON.
`

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  response_format: { type: "json_object" }
})
```

### Подход 3: Специализированная ML модель

Обучить модель на датасете медицинских анализов (требует большой объем данных).

## 🎨 UI Компоненты

### Drag & Drop Zone

```tsx
<div
  onDragEnter={handleDrag}
  onDragLeave={handleDrag}
  onDragOver={handleDrag}
  onDrop={handleDrop}
>
  <Upload icon />
  Перетащите файлы сюда
</div>
```

### Document Card

- Иконка типа файла
- Название и размер
- Статус обработки (✓ распознано)
- Тип исследования
- Прогресс-бар OCR
- Кнопки действий (просмотр, удалить)

### Filters

- Поиск по тексту
- Фильтр по категориям
- Сортировка по дате

## 🔐 Безопасность

### Текущая реализация

✅ **Что защищено:**
- Авторизация через JWT
- Проверка владельца документа
- Ограничение типов файлов
- Ограничение размера файлов

⚠️ **Ограничения:**
- Хранение в памяти (не persistent)
- Base64 хранение (не оптимально)
- Нет шифрования файлов

### Для продакшена

1. **Хранилище файлов**
   - AWS S3 / Azure Blob / Google Cloud Storage
   - Шифрование at rest
   - Подписанные URLs для доступа

2. **Дополнительная защита**
   - Сканирование на вирусы
   - Проверка подлинности файлов
   - Watermarking
   - Audit log всех действий

3. **Compliance**
   - HIPAA (США)
   - GDPR (ЕС)
   - 152-ФЗ (РФ)

## 📱 Мобильная поддержка

### PWA
- Загрузка через камеру
- Offline доступ к документам
- Push уведомления о готовности OCR

### React Native
- Нативная камера
- Биометрия для доступа
- Локальное хранилище

## 🚀 Деплой

### Текущие зависимости

```json
{
  "tesseract.js": "^5.0.4",
  "cookie": "^0.6.0"
}
```

### Environment Variables

```env
# Для продакшена
AWS_S3_BUCKET=medical-documents
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# OpenAI для парсинга
OPENAI_API_KEY=sk-...

# OCR API (optional)
GOOGLE_VISION_API_KEY=...
```

## 📈 Метрики

- Время загрузки файла
- Время OCR обработки
- Точность распознавания
- Успешность парсинга
- Использование хранилища

## 🔬 Тестирование

### Unit тесты

```typescript
describe('Document Upload', () => {
  it('should reject files > 10MB', async () => {
    const largeFile = new File([...], { size: 11 * 1024 * 1024 })
    const result = await uploadDocument(largeFile)
    expect(result.error).toBe('Размер файла превышает 10 МБ')
  })
})
```

### E2E тесты

1. Загрузка PDF анализа
2. Ожидание OCR
3. Проверка извлеченных данных
4. Просмотр документа
5. Удаление документа

## 📚 Примеры использования

### Загрузка анализа крови

```typescript
const file = new File([pdfBlob], 'Анализ.pdf', { type: 'application/pdf' })
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData
})

const { document } = await response.json()
console.log('Загружен документ:', document.id)
```

### Получение показателей

```typescript
const doc = await fetch(`/api/documents/${docId}`).then(r => r.json())

doc.indicators.forEach(indicator => {
  console.log(`${indicator.name}: ${indicator.value} ${indicator.unit}`)
  if (!indicator.isNormal) {
    console.warn('Отклонение от нормы!')
  }
})
```

## 🎯 Roadmap

### Q1 2025
- ✅ Базовая загрузка файлов
- ✅ UI интерфейс
- ✅ API endpoints
- 🔄 Интеграция Tesseract.js
- 🔄 Базовый парсинг

### Q2 2025
- 📦 Интеграция с S3
- 🤖 ML парсинг через OpenAI
- 📊 Графики показателей
- 🔗 Связь с дневником здоровья

### Q3 2025
- 📱 Мобильное приложение
- 🎤 Голосовые заметки
- 🔔 Уведомления
- 🌐 API для сторонних интеграций

---

**Создано для ПМА - Персональный Медицинский Ассистент** 🏥

