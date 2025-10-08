const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Медицинские источники
const MEDICAL_SOURCES = {
  uptodate: {
    name: 'UpToDate',
    url: 'https://www.uptodate.com/',
    description: 'Evidence-based clinical decision support resource'
  },
  rucml: {
    name: 'Российское общество клинических лабораторных диагностов',
    url: 'https://rucml.ru/',
    description: 'Российские стандарты лабораторной диагностики'
  },
  msd: {
    name: 'MSD Manuals',
    url: 'https://www.msdmanuals.com/ru-ru/professional',
    description: 'Профессиональные медицинские руководства'
  },
  medscape: {
    name: 'Medscape',
    url: 'https://reference.medscape.com/',
    description: 'Медицинский справочник и новости'
  },
  ncbi: {
    name: 'NCBI',
    url: 'https://www.ncbi.nlm.nih.gov/',
    description: 'Национальный центр биотехнологической информации'
  },
  pubmed: {
    name: 'PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    description: 'База данных медицинских исследований'
  }
};

async function main() {
  console.log('🌱 Заполнение базы знаний с медицинскими источниками...');

  // Создаем методологии с источниками
  const methodologies = [
    {
      name: 'Минздрав РФ - Клинические рекомендации',
      type: 'MINZDRAV_RF',
      description: 'Официальные клинические рекомендации Министерства здравоохранения Российской Федерации',
      organization: 'Минздрав РФ',
      country: 'Россия',
      version: '2024',
      effectiveFrom: new Date('2024-01-01'),
      source: 'https://cr.minzdrav.gov.ru/',
      sources: {
        primary: MEDICAL_SOURCES.rucml,
        references: [MEDICAL_SOURCES.uptodate, MEDICAL_SOURCES.msd]
      },
      lastUpdated: new Date()
    },
    {
      name: 'UpToDate Clinical Guidelines',
      type: 'US_STANDARDS',
      description: 'Evidence-based clinical decision support from UpToDate',
      organization: 'Wolters Kluwer',
      country: 'США',
      version: '2024',
      effectiveFrom: new Date('2024-01-01'),
      source: 'https://www.uptodate.com/',
      sources: {
        primary: MEDICAL_SOURCES.uptodate,
        references: [MEDICAL_SOURCES.pubmed, MEDICAL_SOURCES.ncbi]
      },
      lastUpdated: new Date()
    },
    {
      name: 'MSD Professional Manuals',
      type: 'US_STANDARDS',
      description: 'Professional medical reference from MSD Manuals',
      organization: 'Merck & Co.',
      country: 'США',
      version: '2024',
      effectiveFrom: new Date('2024-01-01'),
      source: 'https://www.msdmanuals.com/ru-ru/professional',
      sources: {
        primary: MEDICAL_SOURCES.msd,
        references: [MEDICAL_SOURCES.medscape, MEDICAL_SOURCES.pubmed]
      },
      lastUpdated: new Date()
    },
    {
      name: 'ESC Clinical Practice Guidelines',
      type: 'EU_STANDARDS',
      description: 'European Society of Cardiology clinical practice guidelines',
      organization: 'ESC',
      country: 'Европа',
      version: '2023',
      effectiveFrom: new Date('2023-01-01'),
      source: 'https://www.escardio.org/Guidelines',
      sources: {
        primary: MEDICAL_SOURCES.uptodate,
        references: [MEDICAL_SOURCES.pubmed, MEDICAL_SOURCES.ncbi]
      },
      lastUpdated: new Date()
    },
    {
      name: 'WHO Laboratory Standards',
      type: 'WHO',
      description: 'World Health Organization laboratory standards and guidelines',
      organization: 'WHO',
      country: 'Международные',
      version: '2023',
      effectiveFrom: new Date('2023-01-01'),
      source: 'https://www.who.int/',
      sources: {
        primary: MEDICAL_SOURCES.ncbi,
        references: [MEDICAL_SOURCES.pubmed, MEDICAL_SOURCES.uptodate]
      },
      lastUpdated: new Date()
    }
  ];

  console.log('📋 Создание методологий...');
  const createdMethodologies = [];
  for (const methodology of methodologies) {
    // Проверяем, существует ли уже такая методология
    const existing = await prisma.methodology.findFirst({
      where: { 
        name: methodology.name,
        type: methodology.type
      }
    });
    
    let created;
    if (existing) {
      created = await prisma.methodology.update({
        where: { id: existing.id },
        data: methodology
      });
    } else {
      created = await prisma.methodology.create({
        data: methodology
      });
    }
    
    createdMethodologies.push(created);
    console.log(`✅ Методология: ${created.name}`);
  }

  // Создаем типы исследований с источниками
  const studyTypes = [
    {
      name: 'Общий анализ крови',
      nameEn: 'Complete Blood Count (CBC)',
      code: 'CBC',
      category: 'Гематология',
      description: 'Комплексное исследование клеточного состава крови',
      clinicalSignificance: 'Основной скрининг-тест для оценки общего состояния здоровья, выявления анемии, инфекций, воспалительных процессов',
      preparation: 'Кровь сдается натощак, утром. За 24 часа исключить алкоголь, физические нагрузки',
      biomaterial: 'Венозная кровь с ЭДТА',
      sources: {
        primary: MEDICAL_SOURCES.uptodate,
        references: [MEDICAL_SOURCES.msd, MEDICAL_SOURCES.rucml, MEDICAL_SOURCES.medscape],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: 'Биохимический анализ крови',
      nameEn: 'Blood Chemistry Panel',
      code: 'BCP',
      category: 'Клиническая химия',
      description: 'Исследование биохимических показателей крови',
      clinicalSignificance: 'Оценка функции печени, почек, обмена веществ, электролитного баланса',
      preparation: 'Кровь сдается строго натощак (8-12 часов голодания). Утром, до приема лекарств',
      biomaterial: 'Венозная кровь без антикоагулянта',
      sources: {
        primary: MEDICAL_SOURCES.msd,
        references: [MEDICAL_SOURCES.uptodate, MEDICAL_SOURCES.rucml, MEDICAL_SOURCES.pubmed],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: 'Общий анализ мочи',
      nameEn: 'Urinalysis',
      code: 'UA',
      category: 'Клиническая химия',
      description: 'Комплексное исследование физико-химических свойств мочи',
      clinicalSignificance: 'Диагностика заболеваний почек, мочевыводящих путей, обмена веществ',
      preparation: 'Утренняя порция мочи, тщательный туалет наружных половых органов',
      biomaterial: 'Средняя порция утренней мочи',
      sources: {
        primary: MEDICAL_SOURCES.rucml,
        references: [MEDICAL_SOURCES.uptodate, MEDICAL_SOURCES.msd, MEDICAL_SOURCES.medscape],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    }
  ];

  console.log('🧪 Создание типов исследований...');
  const createdStudyTypes = [];
  for (const studyType of studyTypes) {
    // Проверяем, существует ли уже такой тип исследования
    const existing = await prisma.studyType.findFirst({
      where: { 
        name: studyType.name
      }
    });
    
    let created;
    if (existing) {
      created = await prisma.studyType.update({
        where: { id: existing.id },
        data: studyType
      });
    } else {
      created = await prisma.studyType.create({
        data: studyType
      });
    }
    
    createdStudyTypes.push(created);
    console.log(`✅ Тип исследования: ${created.name}`);
  }

  // Создаем показатели с источниками
  const indicators = [
    // Показатели общего анализа крови
    {
      studyTypeId: createdStudyTypes[0].id,
      name: 'Гемоглобин',
      nameEn: 'Hemoglobin',
      code: 'HGB',
      shortName: 'Hb',
      unit: 'г/л',
      description: 'Белок, содержащий железо, переносящий кислород в крови',
      clinicalSignificance: 'Основной показатель для диагностики анемии и полицитемии',
      increasedMeaning: 'Полицитемия, обезвоживание, хроническая гипоксия',
      decreasedMeaning: 'Анемия различного генеза, кровопотеря, гемолиз',
      relatedConditions: ['Анемия', 'Полицитемия', 'Обезвоживание'],
      synonyms: ['Hb', 'HGB', 'Гемоглобин'],
      sources: {
        primary: MEDICAL_SOURCES.uptodate,
        references: [MEDICAL_SOURCES.msd, MEDICAL_SOURCES.rucml, MEDICAL_SOURCES.pubmed],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      studyTypeId: createdStudyTypes[0].id,
      name: 'Эритроциты',
      nameEn: 'Red Blood Cells',
      code: 'RBC',
      shortName: 'Эр',
      unit: '×10¹²/л',
      description: 'Красные кровяные клетки, переносящие кислород',
      clinicalSignificance: 'Количественная оценка эритроцитарного ростка крови',
      increasedMeaning: 'Полицитемия, обезвоживание, хроническая гипоксия',
      decreasedMeaning: 'Анемия, кровопотеря, гемолиз, угнетение костного мозга',
      relatedConditions: ['Анемия', 'Полицитемия', 'Гемолиз'],
      synonyms: ['RBC', 'Эритроциты', 'Красные кровяные клетки'],
      sources: {
        primary: MEDICAL_SOURCES.msd,
        references: [MEDICAL_SOURCES.uptodate, MEDICAL_SOURCES.rucml, MEDICAL_SOURCES.medscape],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      studyTypeId: createdStudyTypes[0].id,
      name: 'Лейкоциты',
      nameEn: 'White Blood Cells',
      code: 'WBC',
      shortName: 'Лц',
      unit: '×10⁹/л',
      description: 'Белые кровяные клетки, обеспечивающие иммунную защиту',
      clinicalSignificance: 'Оценка иммунного статуса, выявление воспалительных процессов',
      increasedMeaning: 'Инфекции, воспаление, лейкоз, стресс, физическая нагрузка',
      decreasedMeaning: 'Угнетение костного мозга, вирусные инфекции, аутоиммунные заболевания',
      relatedConditions: ['Инфекции', 'Воспаление', 'Лейкоз', 'Агранулоцитоз'],
      synonyms: ['WBC', 'Лейкоциты', 'Белые кровяные клетки'],
      sources: {
        primary: MEDICAL_SOURCES.rucml,
        references: [MEDICAL_SOURCES.uptodate, MEDICAL_SOURCES.msd, MEDICAL_SOURCES.pubmed],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    // Показатели биохимического анализа
    {
      studyTypeId: createdStudyTypes[1].id,
      name: 'Глюкоза',
      nameEn: 'Glucose',
      code: 'GLU',
      shortName: 'Глюкоза',
      unit: 'ммоль/л',
      description: 'Основной углевод крови, источник энергии для клеток',
      clinicalSignificance: 'Диагностика сахарного диабета, нарушений углеводного обмена',
      increasedMeaning: 'Сахарный диабет, стресс, панкреатит, эндокринные нарушения',
      decreasedMeaning: 'Гипогликемия, передозировка инсулина, заболевания печени',
      relatedConditions: ['Сахарный диабет', 'Гипогликемия', 'Метаболический синдром'],
      synonyms: ['Глюкоза', 'GLU', 'Сахар крови'],
      sources: {
        primary: MEDICAL_SOURCES.uptodate,
        references: [MEDICAL_SOURCES.msd, MEDICAL_SOURCES.rucml, MEDICAL_SOURCES.pubmed],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      studyTypeId: createdStudyTypes[1].id,
      name: 'Общий холестерин',
      nameEn: 'Total Cholesterol',
      code: 'CHOL',
      shortName: 'ХС',
      unit: 'ммоль/л',
      description: 'Общий холестерин в сыворотке крови',
      clinicalSignificance: 'Оценка риска сердечно-сосудистых заболеваний',
      increasedMeaning: 'Гиперхолестеринемия, атеросклероз, заболевания печени',
      decreasedMeaning: 'Гипохолестеринемия, заболевания печени, гипертиреоз',
      relatedConditions: ['Атеросклероз', 'ИБС', 'Гиперлипидемия'],
      synonyms: ['Холестерин', 'CHOL', 'Общий холестерин'],
      sources: {
        primary: MEDICAL_SOURCES.msd,
        references: [MEDICAL_SOURCES.uptodate, MEDICAL_SOURCES.rucml, MEDICAL_SOURCES.medscape],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    }
  ];

  console.log('📊 Создание показателей...');
  const createdIndicators = [];
  for (const indicator of indicators) {
    // Проверяем, существует ли уже такой показатель
    const existing = await prisma.indicator.findFirst({
      where: { 
        studyTypeId: indicator.studyTypeId,
        name: indicator.name
      }
    });
    
    let created;
    if (existing) {
      created = await prisma.indicator.update({
        where: { id: existing.id },
        data: indicator
      });
    } else {
      created = await prisma.indicator.create({
        data: indicator
      });
    }
    
    createdIndicators.push(created);
    console.log(`✅ Показатель: ${created.name}`);
  }

  // Создаем референсные диапазоны
  const referenceRanges = [
    // Референсные диапазоны для гемоглобина
    {
      indicatorId: createdIndicators[0].id,
      methodologyId: createdMethodologies[0].id, // Минздрав РФ
      ageGroupMin: 18,
      ageGroupMax: 60,
      gender: 'male',
      minValue: 130,
      maxValue: 160,
      optimalMin: 140,
      optimalMax: 150,
      criticalLow: 80,
      criticalHigh: 200,
      note: 'Норма для взрослых мужчин по стандартам Минздрава РФ',
      conditions: { fasting: false, timeOfDay: 'any' }
    },
    {
      indicatorId: createdIndicators[0].id,
      methodologyId: createdMethodologies[0].id, // Минздрав РФ
      ageGroupMin: 18,
      ageGroupMax: 60,
      gender: 'female',
      minValue: 120,
      maxValue: 140,
      optimalMin: 125,
      optimalMax: 135,
      criticalLow: 70,
      criticalHigh: 180,
      note: 'Норма для взрослых женщин по стандартам Минздрава РФ',
      conditions: { fasting: false, timeOfDay: 'any' }
    },
    {
      indicatorId: createdIndicators[0].id,
      methodologyId: createdMethodologies[1].id, // UpToDate
      ageGroupMin: 18,
      ageGroupMax: 60,
      gender: 'male',
      minValue: 135,
      maxValue: 175,
      optimalMin: 140,
      optimalMax: 160,
      criticalLow: 80,
      criticalHigh: 200,
      note: 'UpToDate reference ranges for adult males',
      conditions: { fasting: false, timeOfDay: 'any' }
    },
    // Референсные диапазоны для глюкозы
    {
      indicatorId: createdIndicators[3].id,
      methodologyId: createdMethodologies[0].id, // Минздрав РФ
      ageGroupMin: 18,
      ageGroupMax: 60,
      gender: 'all',
      minValue: 3.9,
      maxValue: 6.1,
      optimalMin: 4.1,
      optimalMax: 5.9,
      criticalLow: 2.8,
      criticalHigh: 11.1,
      note: 'Норма глюкозы натощак по стандартам Минздрава РФ',
      conditions: { fasting: true, timeOfDay: 'morning' }
    },
    {
      indicatorId: createdIndicators[3].id,
      methodologyId: createdMethodologies[1].id, // UpToDate
      ageGroupMin: 18,
      ageGroupMax: 60,
      gender: 'all',
      minValue: 3.9,
      maxValue: 5.6,
      optimalMin: 4.0,
      optimalMax: 5.5,
      criticalLow: 2.8,
      criticalHigh: 11.1,
      note: 'UpToDate fasting glucose reference ranges',
      conditions: { fasting: true, timeOfDay: 'morning' }
    }
  ];

  console.log('📏 Создание референсных диапазонов...');
  for (const range of referenceRanges) {
    // Проверяем, существует ли уже такой диапазон
    const existing = await prisma.referenceRange.findFirst({
      where: {
        indicatorId: range.indicatorId,
        methodologyId: range.methodologyId,
        gender: range.gender,
        ageGroupMin: range.ageGroupMin,
        ageGroupMax: range.ageGroupMax
      }
    });
    
    if (existing) {
      await prisma.referenceRange.update({
        where: { id: existing.id },
        data: range
      });
    } else {
      await prisma.referenceRange.create({
        data: range
      });
    }
    console.log(`✅ Референсный диапазон создан`);
  }

  console.log('🎉 База знаний успешно заполнена с медицинскими источниками!');
  console.log(`📊 Создано:`);
  console.log(`   - ${createdMethodologies.length} методологий`);
  console.log(`   - ${createdStudyTypes.length} типов исследований`);
  console.log(`   - ${createdIndicators.length} показателей`);
  console.log(`   - ${referenceRanges.length} референсных диапазонов`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы знаний:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
