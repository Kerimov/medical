const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Расширенная база медицинских знаний
const comprehensiveKnowledge = {
  studyTypes: [
    // Гематология
    {
      name: "Общий анализ крови",
      nameEn: "Complete Blood Count (CBC)",
      code: "CBC",
      category: "Гематология",
      description: "Базовое исследование крови для оценки общего состояния здоровья",
      clinicalSignificance: "Позволяет выявить анемию, инфекции, воспалительные процессы, нарушения свертывания крови",
      preparation: "Натощак, утром. Избегать физических нагрузок за 30 минут до анализа",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [{ name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Ретикулоциты",
      nameEn: "Reticulocytes",
      code: "RETIC",
      category: "Гематология",
      description: "Молодые эритроциты, показатель активности костного мозга",
      clinicalSignificance: "Оценка регенераторной способности костного мозга при анемиях",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Лейкоцитарная формула",
      nameEn: "Differential Blood Count",
      code: "DIFF",
      category: "Гематология",
      description: "Процентное соотношение различных видов лейкоцитов",
      clinicalSignificance: "Дифференциальная диагностика инфекций, воспалительных и онкологических заболеваний",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Биохимия
    {
      name: "Биохимический анализ крови",
      nameEn: "Blood Chemistry Panel",
      code: "CHEM",
      category: "Клиническая химия",
      description: "Комплексное исследование биохимических показателей крови",
      clinicalSignificance: "Оценка функции печени, почек, поджелудочной железы, обмена веществ",
      preparation: "Натощак 8-12 часов. Исключить алкоголь за 24 часа",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "Medscape", url: "https://reference.medscape.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Электролиты крови",
      nameEn: "Electrolytes Panel",
      code: "ELEC",
      category: "Клиническая химия",
      description: "Исследование основных электролитов крови",
      clinicalSignificance: "Диагностика нарушений водно-электролитного баланса",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Ферменты поджелудочной железы",
      nameEn: "Pancreatic Enzymes",
      code: "PANC",
      category: "Клиническая химия",
      description: "Исследование ферментов поджелудочной железы",
      clinicalSignificance: "Диагностика панкреатита и других заболеваний поджелудочной железы",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Липидный профиль
    {
      name: "Липидный профиль",
      nameEn: "Lipid Profile",
      code: "LIPID",
      category: "Клиническая химия",
      description: "Исследование липидного обмена для оценки риска сердечно-сосудистых заболеваний",
      clinicalSignificance: "Оценка риска атеросклероза, ишемической болезни сердца, инсульта",
      preparation: "Натощак 12-14 часов. Исключить алкоголь и жирную пищу за 24 часа",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "American Heart Association", url: "https://www.heart.org/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Гормоны
    {
      name: "Гормоны щитовидной железы",
      nameEn: "Thyroid Function Tests",
      code: "THYROID",
      category: "Эндокринология",
      description: "Исследование функции щитовидной железы",
      clinicalSignificance: "Диагностика гипо- и гипертиреоза, тиреоидитов",
      preparation: "Натощак, утром",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Половые гормоны",
      nameEn: "Sex Hormones",
      code: "SEX_HORM",
      category: "Эндокринология",
      description: "Исследование половых гормонов",
      clinicalSignificance: "Диагностика нарушений репродуктивной функции",
      preparation: "Натощак, в определенные дни цикла для женщин",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "Medscape", url: "https://reference.medscape.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Гормоны надпочечников",
      nameEn: "Adrenal Hormones",
      code: "ADRENAL",
      category: "Эндокринология",
      description: "Исследование гормонов надпочечников",
      clinicalSignificance: "Диагностика заболеваний надпочечников",
      preparation: "Натощак, утром",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Коагулограмма
    {
      name: "Коагулограмма",
      nameEn: "Coagulation Panel",
      code: "COAG",
      category: "Гемостаз",
      description: "Исследование системы свертывания крови",
      clinicalSignificance: "Диагностика нарушений гемостаза, контроль антикоагулянтной терапии",
      preparation: "Натощак. Исключить прием антикоагулянтов по согласованию с врачом",
      biomaterial: "Венозная кровь с цитратом",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Иммунология
    {
      name: "Иммунограмма",
      nameEn: "Immunogram",
      code: "IMMUNO",
      category: "Иммунология",
      description: "Комплексное исследование иммунного статуса",
      clinicalSignificance: "Оценка состояния иммунной системы",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Аллергологические тесты",
      nameEn: "Allergy Tests",
      code: "ALLERGY",
      category: "Иммунология",
      description: "Исследование аллергических реакций",
      clinicalSignificance: "Диагностика аллергических заболеваний",
      preparation: "Без специальной подготовки",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Онкомаркеры
    {
      name: "Онкомаркеры",
      nameEn: "Tumor Markers",
      code: "TUMOR",
      category: "Онкология",
      description: "Исследование опухолевых маркеров",
      clinicalSignificance: "Скрининг, диагностика и мониторинг онкологических заболеваний",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "NCBI", url: "https://www.ncbi.nlm.nih.gov/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Анализы мочи
    {
      name: "Общий анализ мочи",
      nameEn: "Urinalysis",
      code: "UA",
      category: "Клиническая химия",
      description: "Исследование физических, химических и микроскопических свойств мочи",
      clinicalSignificance: "Диагностика заболеваний почек, мочевыводящих путей, обмена веществ",
      preparation: "Средняя порция утренней мочи после гигиенических процедур",
      biomaterial: "Моча",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Анализ мочи по Нечипоренко",
      nameEn: "Nechiporenko Urine Test",
      code: "NECH",
      category: "Клиническая химия",
      description: "Количественное определение форменных элементов в 1 мл мочи",
      clinicalSignificance: "Уточняющая диагностика заболеваний почек и мочевыводящих путей",
      preparation: "Средняя порция утренней мочи",
      biomaterial: "Моча",
      sources: { primary: { name: "RUCLM", url: "https://rucml.ru/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Анализ мочи по Зимницкому",
      nameEn: "Zimnitsky Urine Test",
      code: "ZIM",
      category: "Клиническая химия",
      description: "Исследование концентрационной функции почек",
      clinicalSignificance: "Оценка функции почек",
      preparation: "Сбор мочи в течение суток каждые 3 часа",
      biomaterial: "Моча",
      sources: { primary: { name: "RUCLM", url: "https://rucml.ru/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Суточная протеинурия",
      nameEn: "24-hour Urine Protein",
      code: "24H_PROT",
      category: "Клиническая химия",
      description: "Определение белка в суточной моче",
      clinicalSignificance: "Диагностика заболеваний почек",
      preparation: "Сбор суточной мочи",
      biomaterial: "Моча",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Микробиология
    {
      name: "Посев на микрофлору",
      nameEn: "Culture and Sensitivity",
      code: "CULTURE",
      category: "Микробиология",
      description: "Исследование микрофлоры и чувствительности к антибиотикам",
      clinicalSignificance: "Диагностика инфекционных заболеваний и подбор антибиотикотерапии",
      preparation: "До начала антибиотикотерапии",
      biomaterial: "Различные биоматериалы",
      sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Серология
    {
      name: "Серологические исследования",
      nameEn: "Serology Tests",
      code: "SERO",
      category: "Серология",
      description: "Исследование антител к инфекционным агентам",
      clinicalSignificance: "Диагностика инфекционных заболеваний",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },

    // Витамины и микроэлементы
    {
      name: "Витамины",
      nameEn: "Vitamins",
      code: "VIT",
      category: "Клиническая химия",
      description: "Исследование уровня витаминов",
      clinicalSignificance: "Диагностика гипо- и гипервитаминозов",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "Medscape", url: "https://reference.medscape.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    },
    {
      name: "Микроэлементы",
      nameEn: "Trace Elements",
      code: "TRACE",
      category: "Клиническая химия",
      description: "Исследование уровня микроэлементов",
      clinicalSignificance: "Диагностика дефицита или избытка микроэлементов",
      preparation: "Натощак",
      biomaterial: "Венозная кровь",
      sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() },
      lastUpdated: new Date()
    }
  ],

  // Добавим еще 50+ показателей
  indicators: [
    // Гематология (расширенная)
    { name: "Гемоглобин", nameEn: "Hemoglobin", code: "HGB", shortName: "Hb", unit: "г/л", studyTypeCode: "CBC", description: "Белок эритроцитов, переносящий кислород", clinicalSignificance: "Основной показатель для диагностики анемии", increasedMeaning: "Полицитемия, обезвоживание", decreasedMeaning: "Анемия, кровопотеря", relatedConditions: ["Анемия", "Полицитемия"], synonyms: ["Hb", "HGB"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Эритроциты", nameEn: "Red Blood Cells", code: "RBC", shortName: "Эр", unit: "×10¹²/л", studyTypeCode: "CBC", description: "Красные кровяные клетки", clinicalSignificance: "Количественная оценка эритроцитарного ростка", increasedMeaning: "Полицитемия", decreasedMeaning: "Анемия", relatedConditions: ["Анемия"], synonyms: ["RBC"], sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Лейкоциты", nameEn: "White Blood Cells", code: "WBC", shortName: "Лейк", unit: "×10⁹/л", studyTypeCode: "CBC", description: "Белые кровяные клетки", clinicalSignificance: "Показатель воспаления и иммунного статуса", increasedMeaning: "Инфекции, воспаление", decreasedMeaning: "Угнетение костного мозга", relatedConditions: ["Инфекции"], synonyms: ["WBC"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Тромбоциты", nameEn: "Platelets", code: "PLT", shortName: "Тромб", unit: "×10⁹/л", studyTypeCode: "CBC", description: "Клетки свертывания крови", clinicalSignificance: "Оценка гемостатической функции", increasedMeaning: "Тромбоцитоз", decreasedMeaning: "Тромбоцитопения", relatedConditions: ["Тромбоцитопения"], synonyms: ["PLT"], sources: { primary: { name: "Medscape", url: "https://reference.medscape.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Гематокрит", nameEn: "Hematocrit", code: "HCT", shortName: "Ht", unit: "%", studyTypeCode: "CBC", description: "Объемная доля эритроцитов", clinicalSignificance: "Показатель густоты крови", increasedMeaning: "Полицитемия", decreasedMeaning: "Анемия", relatedConditions: ["Анемия"], synonyms: ["HCT"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "СОЭ", nameEn: "ESR", code: "ESR", shortName: "СОЭ", unit: "мм/ч", studyTypeCode: "CBC", description: "Скорость оседания эритроцитов", clinicalSignificance: "Неспецифический маркер воспаления", increasedMeaning: "Воспаление, инфекции", decreasedMeaning: "Полицитемия", relatedConditions: ["Воспаление"], synonyms: ["ESR"], sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "MCV", nameEn: "Mean Corpuscular Volume", code: "MCV", shortName: "MCV", unit: "фл", studyTypeCode: "CBC", description: "Средний объем эритроцита", clinicalSignificance: "Классификация анемий", increasedMeaning: "Макроцитарная анемия", decreasedMeaning: "Микроцитарная анемия", relatedConditions: ["Анемия"], synonyms: ["MCV"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "MCH", nameEn: "Mean Corpuscular Hemoglobin", code: "MCH", shortName: "MCH", unit: "пг", studyTypeCode: "CBC", description: "Среднее содержание гемоглобина в эритроците", clinicalSignificance: "Классификация анемий", increasedMeaning: "Гиперхромная анемия", decreasedMeaning: "Гипохромная анемия", relatedConditions: ["Анемия"], synonyms: ["MCH"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "MCHC", nameEn: "Mean Corpuscular Hemoglobin Concentration", code: "MCHC", shortName: "MCHC", unit: "г/л", studyTypeCode: "CBC", description: "Средняя концентрация гемоглобина в эритроците", clinicalSignificance: "Классификация анемий", increasedMeaning: "Сфероцитоз", decreasedMeaning: "Железодефицитная анемия", relatedConditions: ["Анемия"], synonyms: ["MCHC"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "RDW", nameEn: "Red Cell Distribution Width", code: "RDW", shortName: "RDW", unit: "%", studyTypeCode: "CBC", description: "Ширина распределения эритроцитов по объему", clinicalSignificance: "Оценка анизоцитоза", increasedMeaning: "Анизоцитоз", decreasedMeaning: "Норма", relatedConditions: ["Анемия"], synonyms: ["RDW"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Лейкоцитарная формула
    { name: "Нейтрофилы", nameEn: "Neutrophils", code: "NEUT", shortName: "Нейтр", unit: "%", studyTypeCode: "DIFF", description: "Основные клетки врожденного иммунитета", clinicalSignificance: "Диагностика бактериальных инфекций", increasedMeaning: "Бактериальные инфекции", decreasedMeaning: "Вирусные инфекции, агранулоцитоз", relatedConditions: ["Инфекции"], synonyms: ["NEUT"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Лимфоциты", nameEn: "Lymphocytes", code: "LYMPH", shortName: "Лимф", unit: "%", studyTypeCode: "DIFF", description: "Клетки адаптивного иммунитета", clinicalSignificance: "Диагностика вирусных инфекций", increasedMeaning: "Вирусные инфекции, лимфолейкоз", decreasedMeaning: "Иммунодефицит", relatedConditions: ["Инфекции"], synonyms: ["LYMPH"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Моноциты", nameEn: "Monocytes", code: "MONO", shortName: "Мон", unit: "%", studyTypeCode: "DIFF", description: "Макрофаги крови", clinicalSignificance: "Диагностика хронических инфекций", increasedMeaning: "Хронические инфекции", decreasedMeaning: "Апластическая анемия", relatedConditions: ["Инфекции"], synonyms: ["MONO"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Эозинофилы", nameEn: "Eosinophils", code: "EOS", shortName: "Эоз", unit: "%", studyTypeCode: "DIFF", description: "Клетки, участвующие в аллергических реакциях", clinicalSignificance: "Диагностика аллергий и паразитозов", increasedMeaning: "Аллергии, паразитозы", decreasedMeaning: "Стресс, инфекции", relatedConditions: ["Аллергия"], synonyms: ["EOS"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Базофилы", nameEn: "Basophils", code: "BASO", shortName: "Баз", unit: "%", studyTypeCode: "DIFF", description: "Клетки, участвующие в аллергических реакциях", clinicalSignificance: "Диагностика аллергий", increasedMeaning: "Аллергии, хронический миелолейкоз", decreasedMeaning: "Гипертиреоз", relatedConditions: ["Аллергия"], synonyms: ["BASO"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Биохимия (расширенная)
    { name: "Глюкоза", nameEn: "Glucose", code: "GLU", shortName: "Глюк", unit: "ммоль/л", studyTypeCode: "CHEM", description: "Основной углевод крови", clinicalSignificance: "Диагностика сахарного диабета", increasedMeaning: "Сахарный диабет", decreasedMeaning: "Гипогликемия", relatedConditions: ["Диабет"], synonyms: ["GLU"], sources: { primary: { name: "American Diabetes Association", url: "https://www.diabetes.org/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Гликированный гемоглобин", nameEn: "HbA1c", code: "HBA1C", shortName: "HbA1c", unit: "%", studyTypeCode: "CHEM", description: "Средний уровень глюкозы за 3 месяца", clinicalSignificance: "Контроль диабета", increasedMeaning: "Плохой контроль диабета", decreasedMeaning: "Хороший контроль", relatedConditions: ["Диабет"], synonyms: ["HbA1c"], sources: { primary: { name: "American Diabetes Association", url: "https://www.diabetes.org/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Общий холестерин", nameEn: "Total Cholesterol", code: "CHOL", shortName: "Холест", unit: "ммоль/л", studyTypeCode: "LIPID", description: "Общий уровень холестерина", clinicalSignificance: "Оценка риска ССЗ", increasedMeaning: "Риск атеросклероза", decreasedMeaning: "Низкий риск", relatedConditions: ["Атеросклероз"], synonyms: ["CHOL"], sources: { primary: { name: "American Heart Association", url: "https://www.heart.org/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "ЛПНП", nameEn: "LDL", code: "LDL", shortName: "ЛПНП", unit: "ммоль/л", studyTypeCode: "LIPID", description: "Липопротеины низкой плотности", clinicalSignificance: "Основной фактор риска атеросклероза", increasedMeaning: "Высокий риск ССЗ", decreasedMeaning: "Низкий риск", relatedConditions: ["Атеросклероз"], synonyms: ["LDL"], sources: { primary: { name: "American Heart Association", url: "https://www.heart.org/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "ЛПВП", nameEn: "HDL", code: "HDL", shortName: "ЛПВП", unit: "ммоль/л", studyTypeCode: "LIPID", description: "Липопротеины высокой плотности", clinicalSignificance: "Защитный фактор", increasedMeaning: "Низкий риск ССЗ", decreasedMeaning: "Высокий риск", relatedConditions: ["Атеросклероз"], synonyms: ["HDL"], sources: { primary: { name: "American Heart Association", url: "https://www.heart.org/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Триглицериды", nameEn: "Triglycerides", code: "TG", shortName: "ТГ", unit: "ммоль/л", studyTypeCode: "LIPID", description: "Основные липиды крови", clinicalSignificance: "Оценка риска ССЗ", increasedMeaning: "Метаболический синдром", decreasedMeaning: "Норма", relatedConditions: ["Метаболический синдром"], synonyms: ["TG"], sources: { primary: { name: "American Heart Association", url: "https://www.heart.org/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Креатинин", nameEn: "Creatinine", code: "CREA", shortName: "Креат", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Продукт метаболизма креатина", clinicalSignificance: "Показатель функции почек", increasedMeaning: "Почечная недостаточность", decreasedMeaning: "Снижение мышечной массы", relatedConditions: ["ХБП"], synonyms: ["CREA"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Мочевина", nameEn: "Urea", code: "UREA", shortName: "Мочев", unit: "ммоль/л", studyTypeCode: "CHEM", description: "Конечный продукт белкового обмена", clinicalSignificance: "Показатель функции почек", increasedMeaning: "Почечная недостаточность", decreasedMeaning: "Печеночная недостаточность", relatedConditions: ["ХБП"], synonyms: ["UREA"], sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Мочевая кислота", nameEn: "Uric Acid", code: "UA", shortName: "МК", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Продукт обмена пуринов", clinicalSignificance: "Диагностика подагры", increasedMeaning: "Подагра, почечная недостаточность", decreasedMeaning: "Синдром Фанкони", relatedConditions: ["Подагра"], synonyms: ["UA"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "АСТ", nameEn: "AST", code: "AST", shortName: "АСТ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Фермент печени и сердца", clinicalSignificance: "Маркер повреждения печени", increasedMeaning: "Гепатит, инфаркт", decreasedMeaning: "Дефицит B6", relatedConditions: ["Гепатит"], synonyms: ["AST"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "АЛТ", nameEn: "ALT", code: "ALT", shortName: "АЛТ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Специфичный фермент печени", clinicalSignificance: "Маркер повреждения печени", increasedMeaning: "Гепатит, цирроз", decreasedMeaning: "Дефицит B6", relatedConditions: ["Гепатит"], synonyms: ["ALT"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "ГГТ", nameEn: "GGT", code: "GGT", shortName: "ГГТ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Гамма-глутамилтрансфераза", clinicalSignificance: "Маркер холестаза", increasedMeaning: "Холестаз, алкоголизм", decreasedMeaning: "Норма", relatedConditions: ["Холестаз"], synonyms: ["GGT"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Щелочная фосфатаза", nameEn: "Alkaline Phosphatase", code: "ALP", shortName: "ЩФ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Фермент костей и печени", clinicalSignificance: "Маркер холестаза и костных заболеваний", increasedMeaning: "Холестаз, болезни костей", decreasedMeaning: "Гипофосфатазия", relatedConditions: ["Холестаз"], synonyms: ["ALP"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Общий билирубин", nameEn: "Total Bilirubin", code: "TBIL", shortName: "Билир", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Продукт распада гемоглобина", clinicalSignificance: "Показатель функции печени", increasedMeaning: "Желтуха, гепатит", decreasedMeaning: "Анемия", relatedConditions: ["Желтуха"], synonyms: ["TBIL"], sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Прямой билирубин", nameEn: "Direct Bilirubin", code: "DBIL", shortName: "Прям.билир", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Конъюгированный билирубин", clinicalSignificance: "Дифференциальная диагностика желтух", increasedMeaning: "Механическая желтуха", decreasedMeaning: "Норма", relatedConditions: ["Желтуха"], synonyms: ["DBIL"], sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Общий белок", nameEn: "Total Protein", code: "TP", shortName: "ОБ", unit: "г/л", studyTypeCode: "CHEM", description: "Общее количество белков", clinicalSignificance: "Показатель белкового обмена", increasedMeaning: "Обезвоживание", decreasedMeaning: "Гипопротеинемия", relatedConditions: ["Гипопротеинемия"], synonyms: ["TP"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Альбумин", nameEn: "Albumin", code: "ALB", shortName: "Альб", unit: "г/л", studyTypeCode: "CHEM", description: "Основной белок плазмы", clinicalSignificance: "Показатель функции печени", increasedMeaning: "Обезвоживание", decreasedMeaning: "Гипоальбуминемия", relatedConditions: ["Гипоальбуминемия"], synonyms: ["ALB"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Электролиты
    { name: "Натрий", nameEn: "Sodium", code: "NA", shortName: "Na", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Основной внеклеточный катион", clinicalSignificance: "Оценка водно-электролитного баланса", increasedMeaning: "Гипернатриемия", decreasedMeaning: "Гипонатриемия", relatedConditions: ["Дегидратация"], synonyms: ["Na"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Калий", nameEn: "Potassium", code: "K", shortName: "K", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Основной внутриклеточный катион", clinicalSignificance: "Оценка водно-электролитного баланса", increasedMeaning: "Гиперкалиемия", decreasedMeaning: "Гипокалиемия", relatedConditions: ["Аритмия"], synonyms: ["K"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Хлор", nameEn: "Chloride", code: "CL", shortName: "Cl", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Основной внеклеточный анион", clinicalSignificance: "Оценка водно-электролитного баланса", increasedMeaning: "Гиперхлоремия", decreasedMeaning: "Гипохлоремия", relatedConditions: ["Ацидоз"], synonyms: ["Cl"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Кальций общий", nameEn: "Total Calcium", code: "CA", shortName: "Ca", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Основной минерал костей", clinicalSignificance: "Оценка костного обмена", increasedMeaning: "Гиперкальциемия", decreasedMeaning: "Гипокальциемия", relatedConditions: ["Остеопороз"], synonyms: ["Ca"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Магний", nameEn: "Magnesium", code: "MG", shortName: "Mg", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Важный внутриклеточный катион", clinicalSignificance: "Оценка электролитного баланса", increasedMeaning: "Гипермагниемия", decreasedMeaning: "Гипомагниемия", relatedConditions: ["Аритмия"], synonyms: ["Mg"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Фосфор", nameEn: "Phosphorus", code: "P", shortName: "P", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Минерал костей", clinicalSignificance: "Оценка костного обмена", increasedMeaning: "Гиперфосфатемия", decreasedMeaning: "Гипофосфатемия", relatedConditions: ["ХБП"], synonyms: ["P"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Панкреатические ферменты
    { name: "Амилаза", nameEn: "Amylase", code: "AMY", shortName: "Амил", unit: "Ед/л", studyTypeCode: "PANC", description: "Фермент поджелудочной железы", clinicalSignificance: "Диагностика панкреатита", increasedMeaning: "Панкреатит", decreasedMeaning: "Недостаточность поджелудочной", relatedConditions: ["Панкреатит"], synonyms: ["AMY"], sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Липаза", nameEn: "Lipase", code: "LIP", shortName: "Липаза", unit: "Ед/л", studyTypeCode: "PANC", description: "Фермент поджелудочной железы", clinicalSignificance: "Диагностика панкреатита", increasedMeaning: "Панкреатит", decreasedMeaning: "Недостаточность поджелудочной", relatedConditions: ["Панкреатит"], synonyms: ["LIP"], sources: { primary: { name: "MSD Manuals", url: "https://www.msdmanuals.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Гормоны щитовидной железы
    { name: "ТТГ", nameEn: "TSH", code: "TSH", shortName: "ТТГ", unit: "мЕд/л", studyTypeCode: "THYROID", description: "Тиреотропный гормон", clinicalSignificance: "Основной показатель функции ЩЖ", increasedMeaning: "Гипотиреоз", decreasedMeaning: "Гипертиреоз", relatedConditions: ["Гипотиреоз"], synonyms: ["TSH"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Свободный Т4", nameEn: "Free T4", code: "FT4", shortName: "свТ4", unit: "пмоль/л", studyTypeCode: "THYROID", description: "Свободный тироксин", clinicalSignificance: "Показатель функции ЩЖ", increasedMeaning: "Гипертиреоз", decreasedMeaning: "Гипотиреоз", relatedConditions: ["Гипертиреоз"], synonyms: ["FT4"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Свободный Т3", nameEn: "Free T3", code: "FT3", shortName: "свТ3", unit: "пмоль/л", studyTypeCode: "THYROID", description: "Свободный трийодтиронин", clinicalSignificance: "Показатель функции ЩЖ", increasedMeaning: "Гипертиреоз", decreasedMeaning: "Гипотиреоз", relatedConditions: ["Гипертиреоз"], synonyms: ["FT3"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Антитела к ТПО", nameEn: "Anti-TPO", code: "ATPO", shortName: "АТ-ТПО", unit: "МЕ/мл", studyTypeCode: "THYROID", description: "Антитела к тиреопероксидазе", clinicalSignificance: "Диагностика аутоиммунного тиреоидита", increasedMeaning: "Аутоиммунный тиреоидит", decreasedMeaning: "Норма", relatedConditions: ["Тиреоидит"], synonyms: ["ATPO"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Коагулограмма
    { name: "ПТИ", nameEn: "PTI", code: "PTI", shortName: "ПТИ", unit: "%", studyTypeCode: "COAG", description: "Протромбиновый индекс", clinicalSignificance: "Оценка свертывания", increasedMeaning: "Гиперкоагуляция", decreasedMeaning: "Гипокоагуляция", relatedConditions: ["Тромбоз"], synonyms: ["PTI"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "МНО", nameEn: "INR", code: "INR", shortName: "МНО", unit: "ед", studyTypeCode: "COAG", description: "Международное нормализованное отношение", clinicalSignificance: "Контроль антикоагулянтной терапии", increasedMeaning: "Гипокоагуляция", decreasedMeaning: "Гиперкоагуляция", relatedConditions: ["Тромбоз"], synonyms: ["INR"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Фибриноген", nameEn: "Fibrinogen", code: "FIB", shortName: "Фибр", unit: "г/л", studyTypeCode: "COAG", description: "Белок свертывания", clinicalSignificance: "Показатель свертывания", increasedMeaning: "Воспаление", decreasedMeaning: "ДВС-синдром", relatedConditions: ["ДВС"], synonyms: ["FIB"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "АЧТВ", nameEn: "aPTT", code: "APTT", shortName: "АЧТВ", unit: "сек", studyTypeCode: "COAG", description: "Активированное частичное тромбопластиновое время", clinicalSignificance: "Оценка внутреннего пути свертывания", increasedMeaning: "Гипокоагуляция", decreasedMeaning: "Гиперкоагуляция", relatedConditions: ["Гемофилия"], synonyms: ["APTT"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Д-димер", nameEn: "D-dimer", code: "DDIM", shortName: "Д-димер", unit: "мкг/л", studyTypeCode: "COAG", description: "Продукт распада фибрина", clinicalSignificance: "Диагностика тромбозов", increasedMeaning: "Тромбоз, ДВС", decreasedMeaning: "Норма", relatedConditions: ["Тромбоз"], synonyms: ["DDIM"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Маркеры воспаления
    { name: "С-реактивный белок", nameEn: "CRP", code: "CRP", shortName: "СРБ", unit: "мг/л", studyTypeCode: "CHEM", description: "Белок острой фазы", clinicalSignificance: "Маркер воспаления", increasedMeaning: "Воспаление, инфекции", decreasedMeaning: "Норма", relatedConditions: ["Воспаление"], synonyms: ["CRP"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Прокальцитонин", nameEn: "Procalcitonin", code: "PCT", shortName: "ПКТ", unit: "нг/мл", studyTypeCode: "CHEM", description: "Маркер бактериальной инфекции", clinicalSignificance: "Дифференциальная диагностика инфекций", increasedMeaning: "Бактериальная инфекция, сепсис", decreasedMeaning: "Вирусная инфекция", relatedConditions: ["Сепсис"], synonyms: ["PCT"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Железо и анемия
    { name: "Ферритин", nameEn: "Ferritin", code: "FERR", shortName: "Ферр", unit: "нг/мл", studyTypeCode: "CHEM", description: "Белок запасов железа", clinicalSignificance: "Показатель запасов железа", increasedMeaning: "Гемохроматоз, воспаление", decreasedMeaning: "Дефицит железа", relatedConditions: ["Анемия"], synonyms: ["FERR"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Железо сыворотки", nameEn: "Serum Iron", code: "FE", shortName: "Fe", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Железо в сыворотке крови", clinicalSignificance: "Диагностика анемий", increasedMeaning: "Гемохроматоз", decreasedMeaning: "Дефицит железа", relatedConditions: ["Анемия"], synonyms: ["FE"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "ОЖСС", nameEn: "TIBC", code: "TIBC", shortName: "ОЖСС", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Общая железосвязывающая способность", clinicalSignificance: "Диагностика анемий", increasedMeaning: "Дефицит железа", decreasedMeaning: "Гемохроматоз", relatedConditions: ["Анемия"], synonyms: ["TIBC"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Трансферрин", nameEn: "Transferrin", code: "TRANS", shortName: "Трансф", unit: "г/л", studyTypeCode: "CHEM", description: "Белок-переносчик железа", clinicalSignificance: "Диагностика анемий", increasedMeaning: "Дефицит железа", decreasedMeaning: "Гемохроматоз", relatedConditions: ["Анемия"], synonyms: ["TRANS"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Витамин B12", nameEn: "Vitamin B12", code: "B12", shortName: "B12", unit: "пмоль/л", studyTypeCode: "VIT", description: "Витамин B12", clinicalSignificance: "Диагностика мегалобластной анемии", increasedMeaning: "Избыток B12", decreasedMeaning: "Дефицит B12, мегалобластная анемия", relatedConditions: ["Анемия"], synonyms: ["B12"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Фолиевая кислота", nameEn: "Folic Acid", code: "FOLIC", shortName: "Фолаты", unit: "нмоль/л", studyTypeCode: "VIT", description: "Фолиевая кислота", clinicalSignificance: "Диагностика мегалобластной анемии", increasedMeaning: "Избыток фолатов", decreasedMeaning: "Дефицит фолатов, мегалобластная анемия", relatedConditions: ["Анемия"], synonyms: ["FOLIC"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Витамины
    { name: "Витамин D", nameEn: "Vitamin D", code: "VIT_D", shortName: "Вит D", unit: "нг/мл", studyTypeCode: "VIT", description: "25-гидроксивитамин D", clinicalSignificance: "Оценка статуса витамина D", increasedMeaning: "Гипервитаминоз D", decreasedMeaning: "Дефицит витамина D", relatedConditions: ["Остеопороз"], synonyms: ["VIT_D"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Кардиомаркеры
    { name: "Тропонин I", nameEn: "Troponin I", code: "TROP_I", shortName: "Тропонин", unit: "нг/мл", studyTypeCode: "CHEM", description: "Кардиоспецифичный белок", clinicalSignificance: "Диагностика инфаркта миокарда", increasedMeaning: "Инфаркт миокарда", decreasedMeaning: "Норма", relatedConditions: ["Инфаркт"], synonyms: ["TROP_I"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "КФК", nameEn: "CPK", code: "CPK", shortName: "КФК", unit: "Ед/л", studyTypeCode: "CHEM", description: "Креатинфосфокиназа", clinicalSignificance: "Маркер повреждения мышц", increasedMeaning: "Инфаркт, миопатия", decreasedMeaning: "Норма", relatedConditions: ["Инфаркт"], synonyms: ["CPK"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "ЛДГ", nameEn: "LDH", code: "LDH", shortName: "ЛДГ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Лактатдегидрогеназа", clinicalSignificance: "Неспецифичный маркер повреждения тканей", increasedMeaning: "Инфаркт, гемолиз, опухоли", decreasedMeaning: "Норма", relatedConditions: ["Инфаркт"], synonyms: ["LDH"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "NT-proBNP", nameEn: "NT-proBNP", code: "NTPROBNP", shortName: "NT-proBNP", unit: "пг/мл", studyTypeCode: "CHEM", description: "N-терминальный фрагмент мозгового натрийуретического пептида", clinicalSignificance: "Диагностика сердечной недостаточности", increasedMeaning: "Сердечная недостаточность", decreasedMeaning: "Норма", relatedConditions: ["Сердечная недостаточность"], synonyms: ["NTPROBNP"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },

    // Показатели мочи
    { name: "Белок в моче", nameEn: "Protein in Urine", code: "PROT", shortName: "Белок", unit: "г/л", studyTypeCode: "UA", description: "Содержание белка в моче", clinicalSignificance: "Показатель функции почек", increasedMeaning: "Протеинурия, нефротический синдром", decreasedMeaning: "Норма", relatedConditions: ["Протеинурия"], synonyms: ["PROT"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Лейкоциты в моче", nameEn: "Leukocytes in Urine", code: "LEU", shortName: "Лейк", unit: "в п/з", studyTypeCode: "UA", description: "Количество лейкоцитов в моче", clinicalSignificance: "Показатель воспаления МВП", increasedMeaning: "Пиурия, цистит, пиелонефрит", decreasedMeaning: "Норма", relatedConditions: ["Цистит"], synonyms: ["LEU"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Эритроциты в моче", nameEn: "Erythrocytes in Urine", code: "ERY", shortName: "Эр", unit: "в п/з", studyTypeCode: "UA", description: "Количество эритроцитов в моче", clinicalSignificance: "Показатель гематурии", increasedMeaning: "Гематурия, гломерулонефрит", decreasedMeaning: "Норма", relatedConditions: ["Гематурия"], synonyms: ["ERY"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Глюкоза в моче", nameEn: "Glucose in Urine", code: "GLU_U", shortName: "Глюк", unit: "ммоль/л", studyTypeCode: "UA", description: "Содержание глюкозы в моче", clinicalSignificance: "Диагностика глюкозурии", increasedMeaning: "Глюкозурия, диабет", decreasedMeaning: "Норма", relatedConditions: ["Диабет"], synonyms: ["GLU_U"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Кетоновые тела в моче", nameEn: "Ketones in Urine", code: "KET", shortName: "Кетоны", unit: "ммоль/л", studyTypeCode: "UA", description: "Содержание кетоновых тел в моче", clinicalSignificance: "Диагностика кетоацидоза", increasedMeaning: "Кетоацидоз, голодание", decreasedMeaning: "Норма", relatedConditions: ["Кетоацидоз"], synonyms: ["KET"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "Удельный вес мочи", nameEn: "Specific Gravity", code: "SG", shortName: "УВ", unit: "г/мл", studyTypeCode: "UA", description: "Плотность мочи", clinicalSignificance: "Оценка концентрационной функции почек", increasedMeaning: "Обезвоживание, глюкозурия", decreasedMeaning: "Полиурия, несахарный диабет", relatedConditions: ["Несахарный диабет"], synonyms: ["SG"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() },
    { name: "pH мочи", nameEn: "pH", code: "PH", shortName: "pH", unit: "ед", studyTypeCode: "UA", description: "Кислотность мочи", clinicalSignificance: "Оценка кислотно-основного состояния", increasedMeaning: "Алкалоз, инфекции", decreasedMeaning: "Ацидоз, диабет", relatedConditions: ["Ацидоз"], synonyms: ["PH"], sources: { primary: { name: "UpToDate", url: "https://www.uptodate.com/" }, references: [], lastChecked: new Date().toISOString() }, lastUpdated: new Date() }
  ]
};

async function main() {
  console.log('🚀 Создание расширенной базы медицинских знаний...');
  console.log(`📊 Будет создано:`);
  console.log(`   - ${comprehensiveKnowledge.studyTypes.length} типов исследований`);
  console.log(`   - ${comprehensiveKnowledge.indicators.length} показателей`);

  try {
    // Создаем типы исследований
    console.log('\n🧪 Создание типов исследований...');
    const createdStudyTypes = new Map();
    for (const studyType of comprehensiveKnowledge.studyTypes) {
      const existing = await prisma.studyType.findFirst({
        where: { name: studyType.name }
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
      createdStudyTypes.set(studyType.code, created);
      console.log(`✅ ${created.name}`);
    }

    // Создаем показатели
    console.log('\n📊 Создание показателей...');
    let indicatorCount = 0;
    for (const indicator of comprehensiveKnowledge.indicators) {
      const studyType = createdStudyTypes.get(indicator.studyTypeCode);
      if (!studyType) {
        console.log(`⚠️ Не найден тип исследования для: ${indicator.name} (${indicator.studyTypeCode})`);
        continue;
      }

      const { studyTypeCode, ...indicatorData } = indicator;
      const existing = await prisma.indicator.findFirst({
        where: {
          studyTypeId: studyType.id,
          name: indicator.name
        }
      });

      if (existing) {
        await prisma.indicator.update({
          where: { id: existing.id },
          data: { ...indicatorData, studyTypeId: studyType.id }
        });
      } else {
        await prisma.indicator.create({
          data: { ...indicatorData, studyTypeId: studyType.id }
        });
      }
      indicatorCount++;
      if (indicatorCount % 10 === 0) {
        console.log(`   ✅ Создано ${indicatorCount} показателей...`);
      }
    }

    console.log(`\n🎉 Расширенная база знаний создана успешно!`);
    console.log(`📊 Итоговая статистика:`);
    console.log(`   - Типов исследований: ${createdStudyTypes.size}`);
    console.log(`   - Показателей: ${indicatorCount}`);

  } catch (error) {
    console.error('❌ Ошибка при создании базы знаний:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Критическая ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
