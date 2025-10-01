// Референсные значения медицинских показателей
// Основано на стандартах ВОЗ и российских клинических рекомендациях

export interface ReferenceRange {
  min: number
  max: number
  unit: string
  description?: string
}

export interface GenderAgeRanges {
  male?: ReferenceRange
  female?: ReferenceRange
  common?: ReferenceRange
  children?: ReferenceRange
}

// Общий анализ крови (ОАК)
export const BLOOD_TEST_GENERAL = {
  hemoglobin: {
    male: { min: 130, max: 160, unit: 'г/л', description: 'Гемоглобин (мужчины)' },
    female: { min: 120, max: 150, unit: 'г/л', description: 'Гемоглобин (женщины)' },
    children: { min: 110, max: 140, unit: 'г/л', description: 'Гемоглобин (дети)' }
  },
  erythrocytes: {
    male: { min: 4.0, max: 5.5, unit: 'млн/мкл', description: 'Эритроциты (мужчины)' },
    female: { min: 3.7, max: 4.7, unit: 'млн/мкл', description: 'Эритроциты (женщины)' }
  },
  hematocrit: {
    male: { min: 40, max: 48, unit: '%', description: 'Гематокрит (мужчины)' },
    female: { min: 36, max: 42, unit: '%', description: 'Гематокрит (женщины)' }
  },
  mcv: {
    common: { min: 80, max: 100, unit: 'фл', description: 'Средний объем эритроцита' }
  },
  mch: {
    common: { min: 27, max: 34, unit: 'пг', description: 'Среднее содержание гемоглобина' }
  },
  leukocytes: {
    common: { min: 4.0, max: 9.0, unit: 'тыс/мкл', description: 'Лейкоциты' }
  },
  neutrophils: {
    common: { min: 47, max: 72, unit: '%', description: 'Нейтрофилы' }
  },
  lymphocytes: {
    common: { min: 19, max: 37, unit: '%', description: 'Лимфоциты' }
  },
  monocytes: {
    common: { min: 3, max: 11, unit: '%', description: 'Моноциты' }
  },
  eosinophils: {
    common: { min: 0.5, max: 5, unit: '%', description: 'Эозинофилы' }
  },
  basophils: {
    common: { min: 0, max: 1, unit: '%', description: 'Базофилы' }
  },
  platelets: {
    common: { min: 150, max: 400, unit: 'тыс/мкл', description: 'Тромбоциты' }
  },
  esr: {
    male: { min: 0, max: 10, unit: 'мм/ч', description: 'СОЭ (мужчины)' },
    female: { min: 0, max: 15, unit: 'мм/ч', description: 'СОЭ (женщины)' }
  }
}

// Биохимический анализ крови
export const BLOOD_TEST_BIOCHEMISTRY = {
  glucose: {
    common: { min: 3.3, max: 5.5, unit: 'ммоль/л', description: 'Глюкоза' }
  },
  total_protein: {
    common: { min: 64, max: 83, unit: 'г/л', description: 'Общий белок' }
  },
  alt: {
    male: { min: 0, max: 45, unit: 'Ед/л', description: 'АЛТ (мужчины)' },
    female: { min: 0, max: 34, unit: 'Ед/л', description: 'АЛТ (женщины)' }
  },
  ast: {
    male: { min: 0, max: 40, unit: 'Ед/л', description: 'АСТ (мужчины)' },
    female: { min: 0, max: 32, unit: 'Ед/л', description: 'АСТ (женщины)' }
  },
  creatinine: {
    male: { min: 74, max: 110, unit: 'мкмоль/л', description: 'Креатинин (мужчины)' },
    female: { min: 62, max: 106, unit: 'мкмоль/л', description: 'Креатинин (женщины)' }
  },
  cholesterol: {
    common: { min: 3.0, max: 5.2, unit: 'ммоль/л', description: 'Холестерин' }
  }
}

// Определение степени отклонения
export enum DeviationSeverity {
  NORMAL = 'normal',
  BORDERLINE = 'borderline',
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe'
}

export interface DeviationInfo {
  severity: DeviationSeverity
  percentage: number
  direction: 'low' | 'high' | 'normal'
  risk: string
  recommendation: string
}

// Анализ отклонения показателя от нормы
export function analyzeDeviation(
  value: number,
  min: number,
  max: number,
  indicatorName: string
): DeviationInfo {
  const range = max - min
  
  // Норма
  if (value >= min && value <= max) {
    return {
      severity: DeviationSeverity.NORMAL,
      percentage: 0,
      direction: 'normal',
      risk: 'Нет риска',
      recommendation: 'Показатель в норме. Продолжайте поддерживать здоровый образ жизни.'
    }
  }
  
  // Пониженное значение
  if (value < min) {
    const deviation = ((min - value) / range) * 100
    
    if (deviation <= 10) {
      return {
        severity: DeviationSeverity.BORDERLINE,
        percentage: deviation,
        direction: 'low',
        risk: 'Низкий риск',
        recommendation: `${indicatorName} незначительно понижен (на ${deviation.toFixed(1)}%). Рекомендуется контроль через месяц.`
      }
    } else if (deviation <= 25) {
      return {
        severity: DeviationSeverity.MILD,
        percentage: deviation,
        direction: 'low',
        risk: 'Умеренный риск',
        recommendation: `${indicatorName} понижен (на ${deviation.toFixed(1)}%). Рекомендуется консультация врача.`
      }
    } else if (deviation <= 50) {
      return {
        severity: DeviationSeverity.MODERATE,
        percentage: deviation,
        direction: 'low',
        risk: 'Повышенный риск',
        recommendation: `${indicatorName} значительно понижен (на ${deviation.toFixed(1)}%). Необходима консультация врача.`
      }
    } else {
      return {
        severity: DeviationSeverity.SEVERE,
        percentage: deviation,
        direction: 'low',
        risk: 'Высокий риск',
        recommendation: `${indicatorName} критически понижен (на ${deviation.toFixed(1)}%). Требуется срочная консультация врача!`
      }
    }
  }
  
  // Повышенное значение
  const deviation = ((value - max) / range) * 100
  
  if (deviation <= 10) {
    return {
      severity: DeviationSeverity.BORDERLINE,
      percentage: deviation,
      direction: 'high',
      risk: 'Низкий риск',
      recommendation: `${indicatorName} незначительно повышен (на ${deviation.toFixed(1)}%). Рекомендуется контроль через месяц.`
    }
  } else if (deviation <= 25) {
    return {
      severity: DeviationSeverity.MILD,
      percentage: deviation,
      direction: 'high',
      risk: 'Умеренный риск',
      recommendation: `${indicatorName} повышен (на ${deviation.toFixed(1)}%). Рекомендуется консультация врача.`
    }
  } else if (deviation <= 50) {
    return {
      severity: DeviationSeverity.MODERATE,
      percentage: deviation,
      direction: 'high',
      risk: 'Повышенный риск',
      recommendation: `${indicatorName} значительно повышен (на ${deviation.toFixed(1)}%). Необходима консультация врача.`
    }
  } else {
    return {
      severity: DeviationSeverity.SEVERE,
      percentage: deviation,
      direction: 'high',
      risk: 'Высокий риск',
      recommendation: `${indicatorName} критически повышен (на ${deviation.toFixed(1)}%). Требуется срочная консультация врача!`
    }
  }
}
