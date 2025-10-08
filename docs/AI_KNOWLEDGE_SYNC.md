# AI-система синхронизации медицинских знаний

## Обзор

Система автоматической синхронизации медицинских знаний использует AI (OpenAI GPT-4) для извлечения структурированных данных из внешних медицинских источников и обновления базы знаний.

## Архитектура

### Компоненты системы

1. **MedicalSourcesManager** - Основной менеджер источников
2. **MedicalKnowledgeExtractor** - AI-экстрактор знаний
3. **API Endpoints** - REST API для поиска и синхронизации
4. **Admin Interface** - Веб-интерфейс для управления

### Поток данных

```
Запрос → AI Поиск → Извлечение → Структурирование → Сохранение в БД
```

## Поддерживаемые источники

### 1. UpToDate
- **Тип**: Web
- **Описание**: Evidence-based clinical decision support
- **URL**: https://www.uptodate.com/
- **Статус**: Симуляция (требует веб-скрапинг)

### 2. PubMed
- **Тип**: API
- **Описание**: Medical research database
- **URL**: https://pubmed.ncbi.nlm.nih.gov/
- **API**: NCBI E-utilities
- **Статус**: Готов к интеграции

### 3. MSD Manuals
- **Тип**: Web
- **Описание**: Professional medical reference
- **URL**: https://www.msdmanuals.com/
- **Статус**: Симуляция

### 4. Medscape
- **Тип**: Web
- **Описание**: Medical reference and news
- **URL**: https://reference.medscape.com/
- **Статус**: Симуляция

### 5. RUCLM
- **Тип**: Web
- **Описание**: Russian clinical laboratory standards
- **URL**: https://rucml.ru/
- **Статус**: Симуляция

## AI-извлечение знаний

### Промпт-инжиниринг

Система использует специализированные промпты для извлечения структурированных медицинских данных:

```typescript
const prompt = `
Проанализируй следующий медицинский текст и извлеки структурированные данные:

ИСТОЧНИК: ${source.name} (${source.url})
ЗАПРОС: ${query}

ТЕКСТ:
${text}

Извлеки следующую информацию в формате JSON:
1. studyType - тип исследования
2. indicators - массив показателей
3. referenceRanges - массив нормативных диапазонов
`;
```

### Структура извлекаемых данных

```typescript
interface ExtractedKnowledge {
  studyType?: {
    name: string;
    nameEn?: string;
    code?: string;
    category: string;
    description?: string;
    clinicalSignificance?: string;
    preparation?: string;
    biomaterial?: string;
  };
  indicators?: Array<{
    name: string;
    nameEn?: string;
    code?: string;
    shortName?: string;
    unit: string;
    description?: string;
    clinicalSignificance?: string;
    increasedMeaning?: string;
    decreasedMeaning?: string;
    relatedConditions?: string[];
    synonyms?: string[];
  }>;
  referenceRanges?: Array<{
    methodology: string;
    ageGroupMin?: number;
    ageGroupMax?: number;
    gender?: string;
    minValue?: number;
    maxValue?: number;
    optimalMin?: number;
    optimalMax?: number;
    criticalLow?: number;
    criticalHigh?: number;
    note?: string;
  }>;
  sources: {
    primary: MedicalSource;
    references: MedicalSource[];
    lastChecked: string;
  };
}
```

## API Endpoints

### Поиск знаний

```http
POST /api/knowledge/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "общий анализ крови гемоглобин",
  "sources": ["uptodate", "pubmed"]
}
```

**Ответ:**
```json
{
  "success": true,
  "query": "общий анализ крови гемоглобин",
  "results": [
    {
      "studyType": {
        "name": "Общий анализ крови",
        "nameEn": "Complete Blood Count",
        "category": "Гематология"
      },
      "indicators": [
        {
          "name": "Гемоглобин",
          "unit": "г/л",
          "description": "Белок, переносящий кислород"
        }
      ],
      "sources": {
        "primary": {
          "name": "UpToDate",
          "url": "https://www.uptodate.com/"
        }
      }
    }
  ]
}
```

### Синхронизация базы знаний

```http
POST /api/knowledge/sync
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "queries": [
    "общий анализ крови",
    "биохимический анализ",
    "гемоглобин",
    "глюкоза"
  ],
  "sources": ["uptodate", "pubmed"]
}
```

**Ответ:**
```json
{
  "success": true,
  "totalQueries": 4,
  "totalUpdated": 12,
  "results": [
    {
      "query": "общий анализ крови",
      "found": 3,
      "saved": 8,
      "success": true
    }
  ]
}
```

### Получение статистики

```http
GET /api/knowledge/sync
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "success": true,
  "stats": {
    "studyTypes": 15,
    "indicators": 45,
    "lastStudyTypeUpdate": "2025-10-08T10:30:00Z",
    "lastIndicatorUpdate": "2025-10-08T10:30:00Z"
  }
}
```

## Веб-интерфейс

### Админ-панель синхронизации

**URL**: `/admin/knowledge/sync`

**Функции:**
- Поиск знаний в источниках
- Массовая синхронизация по запросам
- Выбор источников для поиска
- Просмотр результатов синхронизации
- Статистика базы знаний

### Интерфейс поиска

1. **Поле запроса** - ввод медицинского термина
2. **Выбор источников** - чекбоксы для выбора источников
3. **Кнопка поиска** - запуск поиска
4. **Результаты** - отображение найденных данных

### Интерфейс синхронизации

1. **Поле запросов** - список запросов (по одному на строку)
2. **Кнопка синхронизации** - запуск массового обновления
3. **Прогресс** - отображение статуса синхронизации
4. **Результаты** - детали по каждому запросу

## Настройка

### Переменные окружения

```env
# OpenAI API Key (обязательно)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# JWT Secret для аутентификации
JWT_SECRET=your-super-secret-jwt-key

# База данных
DATABASE_URL="file:./prisma/dev.db"
```

### Установка зависимостей

```bash
npm install openai
```

## Использование

### 1. Поиск знаний

```typescript
import { MedicalSourcesManager } from '@/lib/medical-sources';

const manager = new MedicalSourcesManager();

// Поиск в конкретных источниках
const results = await manager.searchKnowledge(
  'общий анализ крови гемоглобин',
  ['uptodate', 'pubmed']
);

// Поиск во всех источниках
const allResults = await manager.searchKnowledge('глюкоза');
```

### 2. Синхронизация базы

```typescript
// Обновление базы знаний
await manager.updateKnowledgeBase('общий анализ крови');

// Массовое обновление
const queries = [
  'общий анализ крови',
  'биохимический анализ',
  'гемоглобин',
  'глюкоза',
  'холестерин'
];

for (const query of queries) {
  await manager.updateKnowledgeBase(query);
}
```

### 3. Получение источников

```typescript
const sources = manager.getAvailableSources();
console.log('Доступные источники:', sources);
```

## Безопасность

### Аутентификация
- Все API endpoints требуют JWT токен
- Синхронизация доступна только админам
- Проверка ролей на уровне API

### Валидация данных
- Проверка входных параметров
- Валидация JSON ответов от AI
- Обработка ошибок и исключений

### Ограничения
- Rate limiting для API запросов
- Таймауты для внешних источников
- Логирование всех операций

## Мониторинг

### Логирование
- Все операции логируются
- Отслеживание ошибок
- Метрики производительности

### Статистика
- Количество обновленных записей
- Время последней синхронизации
- Статус источников

## Развитие

### Планы на будущее

1. **Реальная интеграция с API**
   - PubMed E-utilities
   - UpToDate API (если доступен)
   - MSD Manuals API

2. **Веб-скрапинг**
   - Парсинг веб-страниц
   - Обработка динамического контента
   - Обход защиты от ботов

3. **Улучшение AI**
   - Специализированные модели
   - Fine-tuning для медицинских данных
   - Валидация извлеченных данных

4. **Автоматизация**
   - Планировщик синхронизации
   - Уведомления об обновлениях
   - Мониторинг источников

5. **Расширение источников**
   - WHO Guidelines
   - ESC Guidelines
   - Российские стандарты

## Troubleshooting

### Частые проблемы

1. **OpenAI API ошибки**
   - Проверить API ключ
   - Проверить лимиты запросов
   - Проверить баланс аккаунта

2. **Ошибки парсинга**
   - Проверить формат ответа AI
   - Улучшить промпты
   - Добавить валидацию

3. **Проблемы с источниками**
   - Проверить доступность URL
   - Обновить endpoints
   - Добавить fallback

### Отладка

```typescript
// Включение детального логирования
process.env.DEBUG = 'medical-sources:*';

// Тестирование отдельных компонентов
const extractor = new MedicalKnowledgeExtractor();
const result = await extractor.extractKnowledgeFromText(text, source, query);
console.log('Extracted:', result);
```

## Заключение

AI-система синхронизации медицинских знаний обеспечивает автоматическое обновление базы данных из авторитетных источников, используя возможности современного AI для извлечения и структурирования медицинской информации.
