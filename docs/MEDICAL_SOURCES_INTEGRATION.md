# Интеграция медицинских источников в базу знаний

## Обзор

База знаний медицинских показателей теперь интегрирована с авторитетными медицинскими источниками для обеспечения достоверности и актуальности данных.

## Поддерживаемые источники

### 1. UpToDate
- **URL**: https://www.uptodate.com/
- **Описание**: Evidence-based clinical decision support resource
- **Тип**: Американские стандарты
- **Использование**: Основной источник для клинических рекомендаций

### 2. Российское общество клинических лабораторных диагностов (RUCLM)
- **URL**: https://rucml.ru/
- **Описание**: Российские стандарты лабораторной диагностики
- **Тип**: Минздрав РФ
- **Использование**: Российские стандарты и рекомендации

### 3. MSD Manuals
- **URL**: https://www.msdmanuals.com/ru-ru/professional
- **Описание**: Профессиональные медицинские руководства
- **Тип**: Американские стандарты
- **Использование**: Справочная информация

### 4. Medscape
- **URL**: https://reference.medscape.com/
- **Описание**: Медицинский справочник и новости
- **Тип**: Международные стандарты
- **Использование**: Дополнительные справочные материалы

### 5. NCBI
- **URL**: https://www.ncbi.nlm.nih.gov/
- **Описание**: Национальный центр биотехнологической информации
- **Тип**: Научные исследования
- **Использование**: Научные публикации и исследования

### 6. PubMed
- **URL**: https://pubmed.ncbi.nlm.nih.gov/
- **Описание**: База данных медицинских исследований
- **Тип**: Научные исследования
- **Использование**: Медицинская литература и исследования

## Структура данных источников

### Поля в базе данных

#### StudyType (Типы исследований)
```json
{
  "sources": {
    "primary": {
      "name": "UpToDate",
      "url": "https://www.uptodate.com/",
      "description": "Evidence-based clinical decision support resource"
    },
    "references": [
      {
        "name": "MSD Manuals",
        "url": "https://www.msdmanuals.com/ru-ru/professional",
        "description": "Профессиональные медицинские руководства"
      }
    ],
    "lastChecked": "2025-10-08T07:42:58.595Z"
  },
  "lastUpdated": "2025-10-08T07:42:58.595Z"
}
```

#### Indicator (Показатели)
```json
{
  "sources": {
    "primary": {
      "name": "UpToDate",
      "url": "https://www.uptodate.com/",
      "description": "Evidence-based clinical decision support resource"
    },
    "references": [
      {
        "name": "PubMed",
        "url": "https://pubmed.ncbi.nlm.nih.gov/",
        "description": "База данных медицинских исследований"
      }
    ],
    "lastChecked": "2025-10-08T07:42:58.595Z"
  },
  "lastUpdated": "2025-10-08T07:42:58.595Z"
}
```

#### Methodology (Методологии)
```json
{
  "sources": {
    "primary": {
      "name": "Минздрав РФ",
      "url": "https://cr.minzdrav.gov.ru/",
      "description": "Официальные клинические рекомендации"
    },
    "references": [
      {
        "name": "UpToDate",
        "url": "https://www.uptodate.com/",
        "description": "Evidence-based clinical decision support resource"
      }
    ]
  },
  "lastUpdated": "2025-10-08T07:42:58.595Z"
}
```

## Методологии и стандарты

### 1. Минздрав РФ - Клинические рекомендации
- **Организация**: Минздрав РФ
- **Страна**: Россия
- **Версия**: 2024
- **Источник**: https://cr.minzdrav.gov.ru/

### 2. UpToDate Clinical Guidelines
- **Организация**: Wolters Kluwer
- **Страна**: США
- **Версия**: 2024
- **Источник**: https://www.uptodate.com/

### 3. MSD Professional Manuals
- **Организация**: Merck & Co.
- **Страна**: США
- **Версия**: 2024
- **Источник**: https://www.msdmanuals.com/ru-ru/professional

### 4. ESC Clinical Practice Guidelines
- **Организация**: ESC (European Society of Cardiology)
- **Страна**: Европа
- **Версия**: 2023
- **Источник**: https://www.escardio.org/Guidelines

### 5. WHO Laboratory Standards
- **Организация**: WHO (World Health Organization)
- **Страна**: Международные
- **Версия**: 2023
- **Источник**: https://www.who.int/

## Примеры данных

### Общий анализ крови
- **Основной источник**: UpToDate
- **Дополнительные источники**: MSD Manuals, RUCLM, Medscape
- **Показатели**: Гемоглобин, Эритроциты, Лейкоциты

### Биохимический анализ крови
- **Основной источник**: MSD Manuals
- **Дополнительные источники**: UpToDate, RUCLM, PubMed
- **Показатели**: Глюкоза, Общий холестерин

### Референсные диапазоны
- **Минздрав РФ**: Нормы для российских пациентов
- **UpToDate**: Международные стандарты
- **Возрастные группы**: 18-60 лет
- **Пол**: Мужчины, Женщины, Все

## Обновление данных

### Автоматическое обновление
- Поле `lastChecked` отслеживает последнюю проверку источника
- Поле `lastUpdated` показывает дату последнего обновления данных
- Рекомендуется регулярное обновление из источников

### Ручное обновление
```javascript
// Пример обновления источника
const updatedStudyType = await prisma.studyType.update({
  where: { id: studyTypeId },
  data: {
    sources: {
      primary: newPrimarySource,
      references: newReferences,
      lastChecked: new Date().toISOString()
    },
    lastUpdated: new Date()
  }
});
```

## Интерфейс пользователя

### Отображение источников
- **Основной источник**: Выделен как primary
- **Дополнительные источники**: Список ссылок
- **Дата обновления**: Показывается с иконкой календаря
- **Ссылки**: Открываются в новой вкладке

### Компонент Sources
```jsx
const renderSources = (sources) => {
  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <ExternalLink className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Источники данных</span>
      </div>
      
      {sources.primary && (
        <div className="mb-2">
          <span className="text-xs text-gray-600">Основной источник:</span>
          <a href={sources.primary.url} target="_blank" rel="noopener noreferrer">
            {sources.primary.name}
          </a>
        </div>
      )}
      
      {sources.references && (
        <div>
          <span className="text-xs text-gray-600">Дополнительные источники:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {sources.references.map((ref, index) => (
              <a key={index} href={ref.url} target="_blank" rel="noopener noreferrer">
                {ref.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## API Endpoints

### Получение данных с источниками
```http
GET /api/knowledge/study-types
GET /api/knowledge/indicators
GET /api/knowledge/methodologies
GET /api/knowledge/reference-ranges
```

### Обновление источников
```http
PUT /api/knowledge/study-types/[id]
PUT /api/knowledge/indicators/[id]
PUT /api/knowledge/methodologies/[id]
```

## Безопасность и достоверность

### Проверка источников
- Все ссылки проверяются на доступность
- Источники должны быть авторитетными медицинскими ресурсами
- Регулярная валидация данных

### Цитирование
- Каждый показатель имеет ссылку на источник
- Возможность отследить происхождение данных
- Прозрачность источников для пользователей

## Развитие системы

### Планы на будущее
1. **Автоматическое обновление** из источников
2. **API интеграция** с внешними источниками
3. **Версионирование** данных
4. **Уведомления** об обновлениях
5. **Аналитика** использования источников

### Добавление новых источников
1. Обновить константу `MEDICAL_SOURCES`
2. Добавить в скрипт заполнения
3. Обновить документацию
4. Протестировать интеграцию

## Заключение

Интеграция медицинских источников значительно повышает достоверность и актуальность базы знаний, обеспечивая пользователей проверенной информацией из авторитетных источников.
