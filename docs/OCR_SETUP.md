# 🔍 Настройка OCR

## Текущий статус

OCR с Tesseract.js настроен, но может возникать проблема с Web Workers в серверной среде Next.js.

## Решение проблемы

### Вариант 1: Перезапуск сервера (РЕКОМЕНДУЕТСЯ)

```bash
# Остановите текущий сервер (Ctrl+C)
# Очистите кеш
Remove-Item -Path .next -Recurse -Force

# Запустите заново
npm run dev
```

### Вариант 2: Временно использовать Mock данные

Если OCR не работает, вернитесь к mock данным в `app/api/documents/upload/route.ts`:
- Закомментируйте строки 134-157 (реальный OCR)
- Раскомментируйте строки 159-163 (mock данные)

### Вариант 3: Использовать внешний OCR API

Для продакшена рекомендуется использовать облачные сервисы:

#### Google Cloud Vision API
```typescript
import vision from '@google-cloud/vision'

const client = new vision.ImageAnnotatorClient()
const [result] = await client.textDetection(imageData)
const text = result.fullTextAnnotation?.text
```

**Преимущества:**
- ✅ Очень высокая точность (95-99%)
- ✅ Отличная поддержка русского языка
- ✅ Быстрая обработка
- ⚠️ Платный (первые 1000 запросов/месяц бесплатно)

#### AWS Textract
```typescript
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract"

const client = new TextractClient({ region: "us-east-1" })
const command = new AnalyzeDocumentCommand({
  Document: { Bytes: imageBuffer },
  FeatureTypes: ["TABLES", "FORMS"]
})
const response = await client.send(command)
```

**Преимущества:**
- ✅ Специализация на медицинских документах
- ✅ Извлечение таблиц и форм
- ✅ Высокая точность
- ⚠️ Платный

#### Azure Computer Vision
```typescript
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision"

const client = new ComputerVisionClient(credentials, endpoint)
const result = await client.readInStream(imageStream)
```

**Преимущества:**
- ✅ Хорошая поддержка русского
- ✅ Медицинская специализация
- ⚠️ Платный

## Текущая конфигурация

### next.config.mjs
Добавлена конфигурация webpack для работы с Tesseract.js:
- Fallback для node modules
- Настройки для серверной среды

### lib/ocr.ts
Использует `createWorker` для Node.js окружения с правильным управлением lifecycle.

## Проверка работы

После перезапуска сервера загрузите документ и проверьте терминал:

### Успешная обработка:
```
[OCR] Starting text recognition...
[OCR] Progress: 0%
[OCR] Progress: 25%
[OCR] Progress: 50%
[OCR] Progress: 75%
[OCR] Progress: 100%
[OCR] Recognition completed with 87% confidence
[PARSER] Starting medical data extraction...
[PARSER] Extracted: type=Общий анализ крови, indicators=4
[OCR] Real OCR completed for document xxx
```

### Ошибка:
```
Error: Cannot find module '.next/worker-script/node/index.js'
[OCR] Recognition error: ...
```

Если видите ошибку - используйте Вариант 2 (mock данные) или Вариант 3 (облачный API).

## Рекомендации для продакшена

1. **Используйте облачный OCR API** (Google Vision, AWS Textract)
2. **Настройте очередь обработки** (Bull, BullMQ)
3. **Добавьте retry логику** для failed jobs
4. **Кешируйте результаты** OCR
5. **Мониторинг** стоимости API вызовов

## Альтернатива: OCR.space API

Бесплатный API для простых случаев:

```typescript
const formData = new FormData()
formData.append('base64Image', imageData)
formData.append('language', 'rus')

const response = await fetch('https://api.ocr.space/parse/image', {
  method: 'POST',
  headers: { 'apikey': process.env.OCR_SPACE_API_KEY },
  body: formData
})
```

**Ограничения:**
- 25,000 запросов/месяц бесплатно
- Средняя точность
- Подходит для прототипирования

## Troubleshooting

### Проблема: Module not found
**Решение:** Очистите `.next` и перезапустите

### Проблема: Out of memory
**Решение:** Обрабатывайте документы асинхронно в фоне

### Проблема: Низкая точность
**Решение:** 
- Улучшите качество изображений
- Используйте облачный API
- Предобработка изображений (контраст, яркость)

## Контакты

Если проблемы с OCR не решаются:
1. Проверьте версию Tesseract.js
2. Попробуйте облачный API
3. Используйте mock данные для разработки других функций

