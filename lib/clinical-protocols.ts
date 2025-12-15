import type { ReminderRecurrence } from '@prisma/client'

export type ClinicalProtocolKey = 'hypertension' | 'anemia' | 'lipids' | 'thyroid'

export type ClinicalProtocolItem = {
  key: string
  title: string
  description?: string
  /** Через сколько дней от стартовой даты поставить ближайший дедлайн */
  dueInDays: number
  /** Повторяемость (если интервал 3/6 месяцев — оставляем NONE и пишем интервал в description) */
  recurrence: ReminderRecurrence
}

export type ClinicalProtocolTemplate = {
  key: ClinicalProtocolKey
  name: string
  summary: string
  items: ClinicalProtocolItem[]
}

export const CLINICAL_PROTOCOLS: ClinicalProtocolTemplate[] = [
  {
    key: 'hypertension',
    name: 'Гипертония (контроль давления)',
    summary: 'Мониторинг АД + базовые анализы/оценка органов‑мишеней. Интервалы упрощены для MVP.',
    items: [
      { key: 'bp-diary', title: 'Дневник давления (утро/вечер) 7 дней', description: 'Измерять и записывать АД/пульс ежедневно 7 дней.', dueInDays: 0, recurrence: 'NONE' },
      { key: 'bmp', title: 'Креатинин, калий, натрий (биохимия)', description: 'Контроль функции почек/электролитов. Повторять каждые 6 месяцев.', dueInDays: 7, recurrence: 'NONE' },
      { key: 'ua', title: 'Общий анализ мочи', description: 'Скрининг почек. Повторять каждые 6–12 месяцев.', dueInDays: 7, recurrence: 'NONE' },
      { key: 'ecg', title: 'ЭКГ', description: 'Базовая оценка сердца. Повторять 1 раз в год (или по показаниям).', dueInDays: 14, recurrence: 'YEARLY' },
      { key: 'lipids', title: 'Липидограмма', description: 'Оценка сердечно‑сосудистого риска. Повторять 1 раз в год.', dueInDays: 14, recurrence: 'YEARLY' },
    ],
  },
  {
    key: 'anemia',
    name: 'Анемия (дообследование)',
    summary: 'Подтверждение + поиск причины (железо/В12/фолаты/воспаление).',
    items: [
      { key: 'cbc', title: 'ОАК + ретикулоциты', description: 'Повторить/уточнить показатели крови.', dueInDays: 0, recurrence: 'NONE' },
      { key: 'ferritin', title: 'Ферритин', description: 'Оценка запасов железа.', dueInDays: 0, recurrence: 'NONE' },
      { key: 'iron-panel', title: 'Железо, ОЖСС/трансферрин, % насыщения', description: 'Панель железа для дифференциации дефицита.', dueInDays: 0, recurrence: 'NONE' },
      { key: 'b12-folate', title: 'Витамин B12 и фолаты', description: 'Исключить дефицит B12/фолатов.', dueInDays: 0, recurrence: 'NONE' },
      { key: 'crp', title: 'CRP (воспаление)', description: 'Если есть подозрение на воспаление/хронику.', dueInDays: 0, recurrence: 'NONE' },
    ],
  },
  {
    key: 'lipids',
    name: 'Липиды (дислипидемия)',
    summary: 'Контроль липидограммы + сахар/печень как минимум.',
    items: [
      { key: 'lipid-panel', title: 'Липидограмма (ОХС/ЛПНП/ЛПВП/ТГ)', description: 'Базовый контроль. Повторять каждые 3–6 месяцев при коррекции, затем 1 раз в год.', dueInDays: 0, recurrence: 'NONE' },
      { key: 'alt-ast', title: 'АЛТ/АСТ', description: 'Контроль печени (особенно на терапии). Повторять каждые 6–12 месяцев.', dueInDays: 7, recurrence: 'NONE' },
      { key: 'glucose-hba1c', title: 'Глюкоза натощак и/или HbA1c', description: 'Оценка метаболического риска. Повторять 1 раз в год.', dueInDays: 7, recurrence: 'YEARLY' },
      { key: 'tsh', title: 'ТТГ', description: 'Исключить гипотиреоз как фактор дислипидемии (по показаниям).', dueInDays: 14, recurrence: 'NONE' },
    ],
  },
  {
    key: 'thyroid',
    name: 'Щитовидка (ТТГ/Т4)',
    summary: 'Первичная оценка и контроль по интервалам (упрощено).',
    items: [
      { key: 'tsh-ft4', title: 'ТТГ + свободный Т4', description: 'Базовая проверка функции щитовидной железы.', dueInDays: 0, recurrence: 'NONE' },
      { key: 'tpo', title: 'АТ‑ТПО (по показаниям)', description: 'Если есть подозрение на аутоиммунный тиреоидит.', dueInDays: 0, recurrence: 'NONE' },
      { key: 'repeat-6w', title: 'Повтор ТТГ/св.Т4 через 6–8 недель', description: 'Если меняли терапию или есть отклонения. Интервал 6–8 недель.', dueInDays: 45, recurrence: 'NONE' },
      { key: 'repeat-year', title: 'Ежегодный контроль ТТГ', description: 'Если стабильное состояние/на терапии.', dueInDays: 365, recurrence: 'YEARLY' },
    ],
  },
]

export function getClinicalProtocol(key: string | null | undefined): ClinicalProtocolTemplate | null {
  const k = String(key || '').trim() as ClinicalProtocolKey
  return CLINICAL_PROTOCOLS.find((p) => p.key === k) || null
}


