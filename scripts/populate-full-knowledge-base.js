const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Полная база медицинских знаний из открытых источников
const medicalKnowledge = {
  studyTypes: [
    {
      name: "Общий анализ крови",
      nameEn: "Complete Blood Count (CBC)",
      code: "CBC",
      category: "Гематология",
      description: "Базовое исследование крови для оценки общего состояния здоровья",
      clinicalSignificance: "Позволяет выявить анемию, инфекции, воспалительные процессы, нарушения свертывания крови",
      preparation: "Натощак, утром. Избегать физических нагрузок за 30 минут до анализа",
      biomaterial: "Венозная кровь",
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/complete-blood-count-cbc"
        },
        references: [
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" },
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Биохимический анализ крови",
      nameEn: "Blood Chemistry Panel",
      code: "CHEM",
      category: "Клиническая химия",
      description: "Комплексное исследование биохимических показателей крови",
      clinicalSignificance: "Оценка функции печени, почек, поджелудочной железы, обмена веществ",
      preparation: "Натощак 8-12 часов. Исключить алкоголь за 24 часа",
      biomaterial: "Венозная кровь",
      sources: {
        primary: {
          name: "Medscape",
          url: "https://reference.medscape.com/"
        },
        references: [
          { name: "RUCLM", url: "https://rucml.ru/" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Общий анализ мочи",
      nameEn: "Urinalysis",
      code: "UA",
      category: "Клиническая химия",
      description: "Исследование физических, химических и микроскопических свойств мочи",
      clinicalSignificance: "Диагностика заболеваний почек, мочевыводящих путей, обмена веществ",
      preparation: "Средняя порция утренней мочи после гигиенических процедур",
      biomaterial: "Моча",
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/urinalysis"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "NCBI", url: "https://www.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Липидный профиль",
      nameEn: "Lipid Profile",
      code: "LIPID",
      category: "Клиническая химия",
      description: "Исследование липидного обмена для оценки риска сердечно-сосудистых заболеваний",
      clinicalSignificance: "Оценка риска атеросклероза, ишемической болезни сердца, инсульта",
      preparation: "Натощак 12-14 часов. Исключить алкоголь и жирную пищу за 24 часа",
      biomaterial: "Венозная кровь",
      sources: {
        primary: {
          name: "American Heart Association",
          url: "https://www.heart.org/"
        },
        references: [
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" },
          { name: "Medscape", url: "https://reference.medscape.com/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Коагулограмма",
      nameEn: "Coagulation Panel",
      code: "COAG",
      category: "Гемостаз",
      description: "Исследование системы свертывания крови",
      clinicalSignificance: "Диагностика нарушений гемостаза, контроль антикоагулянтной терапии",
      preparation: "Натощак. Исключить прием антикоагулянтов по согласованию с врачом",
      biomaterial: "Венозная кровь с цитратом",
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/coagulation-tests"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "RUCLM", url: "https://rucml.ru/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    }
  ],

  indicators: [
    // Показатели общего анализа крови
    {
      name: "Гемоглобин",
      nameEn: "Hemoglobin",
      code: "HGB",
      shortName: "Hb",
      unit: "г/л",
      description: "Белок эритроцитов, переносящий кислород",
      clinicalSignificance: "Основной показатель для диагностики анемии и полицитемии",
      increasedMeaning: "Полицитемия, обезвоживание, хроническая гипоксия",
      decreasedMeaning: "Анемия различного генеза, кровопотеря, гемолиз",
      relatedConditions: ["Анемия", "Полицитемия", "Обезвоживание"],
      synonyms: ["Hb", "HGB", "Гемоглобин"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/anemia-in-adults"
        },
        references: [
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" },
          { name: "WHO", url: "https://www.who.int/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Эритроциты",
      nameEn: "Red Blood Cells",
      code: "RBC",
      shortName: "Эр",
      unit: "×10¹²/л",
      description: "Красные кровяные клетки, переносящие кислород",
      clinicalSignificance: "Количественная оценка эритроцитарного ростка",
      increasedMeaning: "Полицитемия, обезвоживание, хроническая гипоксия",
      decreasedMeaning: "Анемия, кровопотеря, гемолиз, угнетение костного мозга",
      relatedConditions: ["Анемия", "Полицитемия", "Гемолиз"],
      synonyms: ["RBC", "Эр", "Красные кровяные клетки"],
      sources: {
        primary: {
          name: "MSD Manuals",
          url: "https://www.msdmanuals.com/ru-ru/professional"
        },
        references: [
          { name: "Medscape", url: "https://reference.medscape.com/" },
          { name: "NCBI", url: "https://www.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Лейкоциты",
      nameEn: "White Blood Cells",
      code: "WBC",
      shortName: "Лейк",
      unit: "×10⁹/л",
      description: "Белые кровяные клетки, обеспечивающие иммунную защиту",
      clinicalSignificance: "Показатель воспалительного процесса и иммунного статуса",
      increasedMeaning: "Инфекции, воспаление, лейкоз, стресс, физическая нагрузка",
      decreasedMeaning: "Угнетение костного мозга, вирусные инфекции, аутоиммунные заболевания",
      relatedConditions: ["Инфекции", "Воспаление", "Лейкоз", "Агранулоцитоз"],
      synonyms: ["WBC", "Лейк", "Белые кровяные клетки"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/leukocytosis"
        },
        references: [
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" },
          { name: "RUCLM", url: "https://rucml.ru/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Тромбоциты",
      nameEn: "Platelets",
      code: "PLT",
      shortName: "Тромб",
      unit: "×10⁹/л",
      description: "Клетки, участвующие в процессе свертывания крови",
      clinicalSignificance: "Оценка гемостатической функции",
      increasedMeaning: "Тромбоцитоз, воспаление, злокачественные новообразования",
      decreasedMeaning: "Тромбоцитопения, аутоиммунные заболевания, лекарственные реакции",
      relatedConditions: ["Тромбоцитоз", "Тромбоцитопения", "Геморрагический синдром"],
      synonyms: ["PLT", "Тромб", "Кровяные пластинки"],
      sources: {
        primary: {
          name: "Medscape",
          url: "https://reference.medscape.com/"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "NCBI", url: "https://www.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Гематокрит",
      nameEn: "Hematocrit",
      code: "HCT",
      shortName: "Ht",
      unit: "%",
      description: "Объемная доля эритроцитов в крови",
      clinicalSignificance: "Показатель густоты крови и кислородной емкости",
      increasedMeaning: "Полицитемия, обезвоживание, хроническая гипоксия",
      decreasedMeaning: "Анемия, гипергидратация, кровопотеря",
      relatedConditions: ["Анемия", "Полицитемия", "Обезвоживание"],
      synonyms: ["HCT", "Ht", "Гематокрит"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/polycythemia-vera"
        },
        references: [
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" },
          { name: "WHO", url: "https://www.who.int/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "СОЭ",
      nameEn: "ESR",
      code: "ESR",
      shortName: "СОЭ",
      unit: "мм/ч",
      description: "Скорость оседания эритроцитов",
      clinicalSignificance: "Неспецифический маркер воспаления",
      increasedMeaning: "Воспаление, инфекции, злокачественные новообразования, аутоиммунные заболевания",
      decreasedMeaning: "Полицитемия, серповидноклеточная анемия, гипофибриногенемия",
      relatedConditions: ["Воспаление", "Инфекции", "Ревматоидный артрит", "Злокачественные новообразования"],
      synonyms: ["ESR", "СОЭ", "Скорость оседания эритроцитов"],
      sources: {
        primary: {
          name: "MSD Manuals",
          url: "https://www.msdmanuals.com/ru-ru/professional"
        },
        references: [
          { name: "Medscape", url: "https://reference.medscape.com/" },
          { name: "RUCLM", url: "https://rucml.ru/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },

    // Биохимические показатели
    {
      name: "Глюкоза",
      nameEn: "Glucose",
      code: "GLU",
      shortName: "Глюк",
      unit: "ммоль/л",
      description: "Основной углевод крови, источник энергии",
      clinicalSignificance: "Диагностика сахарного диабета и нарушений углеводного обмена",
      increasedMeaning: "Сахарный диабет, стресс, панкреатит, синдром Кушинга",
      decreasedMeaning: "Гипогликемия, инсулинома, недостаточность надпочечников",
      relatedConditions: ["Сахарный диабет", "Гипогликемия", "Метаболический синдром"],
      synonyms: ["GLU", "Глюк", "Сахар крови"],
      sources: {
        primary: {
          name: "American Diabetes Association",
          url: "https://www.diabetes.org/"
        },
        references: [
          { name: "UpToDate", url: "https://www.uptodate.com/contents/diabetes-mellitus" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Общий холестерин",
      nameEn: "Total Cholesterol",
      code: "CHOL",
      shortName: "Холест",
      unit: "ммоль/л",
      description: "Общий уровень холестерина в крови",
      clinicalSignificance: "Оценка риска сердечно-сосудистых заболеваний",
      increasedMeaning: "Гиперхолестеринемия, атеросклероз, гипотиреоз",
      decreasedMeaning: "Гипохолестеринемия, гипертиреоз, печеночная недостаточность",
      relatedConditions: ["Атеросклероз", "ИБС", "Гиперхолестеринемия"],
      synonyms: ["CHOL", "Холест", "Общий холестерин"],
      sources: {
        primary: {
          name: "American Heart Association",
          url: "https://www.heart.org/"
        },
        references: [
          { name: "UpToDate", url: "https://www.uptodate.com/contents/hypercholesterolemia" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "ЛПНП",
      nameEn: "LDL Cholesterol",
      code: "LDL",
      shortName: "ЛПНП",
      unit: "ммоль/л",
      description: "Липопротеины низкой плотности - 'плохой' холестерин",
      clinicalSignificance: "Основной фактор риска атеросклероза",
      increasedMeaning: "Высокий риск атеросклероза, ИБС, инсульта",
      decreasedMeaning: "Снижение риска сердечно-сосудистых заболеваний",
      relatedConditions: ["Атеросклероз", "ИБС", "Инсульт"],
      synonyms: ["LDL", "ЛПНП", "Липопротеины низкой плотности"],
      sources: {
        primary: {
          name: "American Heart Association",
          url: "https://www.heart.org/"
        },
        references: [
          { name: "UpToDate", url: "https://www.uptodate.com/contents/ldl-cholesterol" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "ЛПВП",
      nameEn: "HDL Cholesterol",
      code: "HDL",
      shortName: "ЛПВП",
      unit: "ммоль/л",
      description: "Липопротеины высокой плотности - 'хороший' холестерин",
      clinicalSignificance: "Защитный фактор от атеросклероза",
      increasedMeaning: "Снижение риска сердечно-сосудистых заболеваний",
      decreasedMeaning: "Повышение риска атеросклероза, ИБС",
      relatedConditions: ["Атеросклероз", "ИБС", "Метаболический синдром"],
      synonyms: ["HDL", "ЛПВП", "Липопротеины высокой плотности"],
      sources: {
        primary: {
          name: "American Heart Association",
          url: "https://www.heart.org/"
        },
        references: [
          { name: "UpToDate", url: "https://www.uptodate.com/contents/hdl-cholesterol" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Триглицериды",
      nameEn: "Triglycerides",
      code: "TG",
      shortName: "ТГ",
      unit: "ммоль/л",
      description: "Основные липиды крови, источник энергии",
      clinicalSignificance: "Оценка риска сердечно-сосудистых заболеваний",
      increasedMeaning: "Гипертриглицеридемия, метаболический синдром, диабет",
      decreasedMeaning: "Гипотриглицеридемия, мальабсорбция, гипертиреоз",
      relatedConditions: ["Метаболический синдром", "Сахарный диабет", "Панкреатит"],
      synonyms: ["TG", "ТГ", "Триглицериды"],
      sources: {
        primary: {
          name: "American Heart Association",
          url: "https://www.heart.org/"
        },
        references: [
          { name: "UpToDate", url: "https://www.uptodate.com/contents/hypertriglyceridemia" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Креатинин",
      nameEn: "Creatinine",
      code: "CREA",
      shortName: "Креат",
      unit: "мкмоль/л",
      description: "Продукт метаболизма креатина в мышцах",
      clinicalSignificance: "Основной показатель функции почек",
      increasedMeaning: "Почечная недостаточность, обезвоживание, мышечные заболевания",
      decreasedMeaning: "Снижение мышечной массы, беременность, печеночная недостаточность",
      relatedConditions: ["Хроническая болезнь почек", "Острая почечная недостаточность"],
      synonyms: ["CREA", "Креат", "Креатинин"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/chronic-kidney-disease"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Мочевина",
      nameEn: "Urea",
      code: "UREA",
      shortName: "Мочев",
      unit: "ммоль/л",
      description: "Конечный продукт белкового обмена",
      clinicalSignificance: "Показатель функции почек и белкового обмена",
      increasedMeaning: "Почечная недостаточность, обезвоживание, высокобелковая диета",
      decreasedMeaning: "Печеночная недостаточность, недоедание, беременность",
      relatedConditions: ["Хроническая болезнь почек", "Острая почечная недостаточность"],
      synonyms: ["UREA", "Мочев", "Мочевина"],
      sources: {
        primary: {
          name: "MSD Manuals",
          url: "https://www.msdmanuals.com/ru-ru/professional"
        },
        references: [
          { name: "UpToDate", url: "https://www.uptodate.com/contents/acute-kidney-injury" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "АСТ",
      nameEn: "AST",
      code: "AST",
      shortName: "АСТ",
      unit: "Ед/л",
      description: "Аспартатаминотрансфераза - фермент печени и сердца",
      clinicalSignificance: "Маркер повреждения печени и миокарда",
      increasedMeaning: "Гепатит, инфаркт миокарда, мышечные заболевания",
      decreasedMeaning: "Дефицит витамина B6, хроническая почечная недостаточность",
      relatedConditions: ["Гепатит", "Инфаркт миокарда", "Мышечная дистрофия"],
      synonyms: ["AST", "АСТ", "Аспартатаминотрансфераза"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/liver-function-tests"
        },
        references: [
          { name: "Medscape", url: "https://reference.medscape.com/" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "АЛТ",
      nameEn: "ALT",
      code: "ALT",
      shortName: "АЛТ",
      unit: "Ед/л",
      description: "Аланинаминотрансфераза - специфичный фермент печени",
      clinicalSignificance: "Более специфичный маркер повреждения печени",
      increasedMeaning: "Гепатит, цирроз, жировая дистрофия печени",
      decreasedMeaning: "Дефицит витамина B6, хроническая почечная недостаточность",
      relatedConditions: ["Гепатит", "Цирроз печени", "Жировая дистрофия печени"],
      synonyms: ["ALT", "АЛТ", "Аланинаминотрансфераза"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/liver-function-tests"
        },
        references: [
          { name: "Medscape", url: "https://reference.medscape.com/" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Общий билирубин",
      nameEn: "Total Bilirubin",
      code: "TBIL",
      shortName: "Билир",
      unit: "мкмоль/л",
      description: "Продукт распада гемоглобина",
      clinicalSignificance: "Показатель функции печени и желчевыводящих путей",
      increasedMeaning: "Желтуха, гепатит, цирроз, гемолиз",
      decreasedMeaning: "Анемия, дефицит железа",
      relatedConditions: ["Желтуха", "Гепатит", "Цирроз печени", "Гемолиз"],
      synonyms: ["TBIL", "Билир", "Общий билирубин"],
      sources: {
        primary: {
          name: "MSD Manuals",
          url: "https://www.msdmanuals.com/ru-ru/professional"
        },
        references: [
          { name: "UpToDate", url: "https://www.uptodate.com/contents/jaundice" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Общий белок",
      nameEn: "Total Protein",
      code: "TP",
      shortName: "ОБ",
      unit: "г/л",
      description: "Общее количество белков в сыворотке крови",
      clinicalSignificance: "Показатель белкового обмена и функции печени",
      increasedMeaning: "Обезвоживание, воспаление, злокачественные новообразования",
      decreasedMeaning: "Гипопротеинемия, печеночная недостаточность, нефротический синдром",
      relatedConditions: ["Гипопротеинемия", "Печеночная недостаточность", "Нефротический синдром"],
      synonyms: ["TP", "ОБ", "Общий белок"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/hypoproteinemia"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Альбумин",
      nameEn: "Albumin",
      code: "ALB",
      shortName: "Альб",
      unit: "г/л",
      description: "Основной белок плазмы крови",
      clinicalSignificance: "Показатель белкового обмена и функции печени",
      increasedMeaning: "Обезвоживание, воспаление",
      decreasedMeaning: "Гипоальбуминемия, печеночная недостаточность, нефротический синдром",
      relatedConditions: ["Гипоальбуминемия", "Печеночная недостаточность", "Нефротический синдром"],
      synonyms: ["ALB", "Альб", "Альбумин"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/hypoalbuminemia"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },

    // Показатели мочи
    {
      name: "Белок в моче",
      nameEn: "Protein in Urine",
      code: "PROT",
      shortName: "Белок",
      unit: "г/л",
      description: "Содержание белка в моче",
      clinicalSignificance: "Показатель функции почек",
      increasedMeaning: "Протеинурия, нефротический синдром, диабетическая нефропатия",
      decreasedMeaning: "Норма или гипопротеинемия",
      relatedConditions: ["Протеинурия", "Нефротический синдром", "Диабетическая нефропатия"],
      synonyms: ["PROT", "Белок", "Протеинурия"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/proteinuria"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Лейкоциты в моче",
      nameEn: "Leukocytes in Urine",
      code: "LEU",
      shortName: "Лейк",
      unit: "в поле зрения",
      description: "Количество лейкоцитов в моче",
      clinicalSignificance: "Показатель воспаления мочевыводящих путей",
      increasedMeaning: "Пиурия, цистит, пиелонефрит, уретрит",
      decreasedMeaning: "Норма или отсутствие воспаления",
      relatedConditions: ["Цистит", "Пиелонефрит", "Уретрит", "Пиурия"],
      synonyms: ["LEU", "Лейк", "Пиурия"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/urinary-tract-infection"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Эритроциты в моче",
      nameEn: "Erythrocytes in Urine",
      code: "ERY",
      shortName: "Эр",
      unit: "в поле зрения",
      description: "Количество эритроцитов в моче",
      clinicalSignificance: "Показатель гематурии",
      increasedMeaning: "Гематурия, гломерулонефрит, мочекаменная болезнь, опухоли",
      decreasedMeaning: "Норма или отсутствие гематурии",
      relatedConditions: ["Гематурия", "Гломерулонефрит", "Мочекаменная болезнь"],
      synonyms: ["ERY", "Эр", "Гематурия"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/hematuria"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },

    // Дополнительные показатели
    {
      name: "С-реактивный белок",
      nameEn: "C-Reactive Protein",
      code: "CRP",
      shortName: "СРБ",
      unit: "мг/л",
      description: "Белок острой фазы воспаления",
      clinicalSignificance: "Маркер воспаления и инфекции",
      increasedMeaning: "Воспаление, инфекции, аутоиммунные заболевания, травмы",
      decreasedMeaning: "Отсутствие воспаления или эффективное лечение",
      relatedConditions: ["Воспаление", "Инфекции", "Ревматоидный артрит", "Сепсис"],
      synonyms: ["CRP", "СРБ", "С-реактивный белок"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/c-reactive-protein"
        },
        references: [
          { name: "Medscape", url: "https://reference.medscape.com/" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Ферритин",
      nameEn: "Ferritin",
      code: "FERR",
      shortName: "Ферр",
      unit: "нг/мл",
      description: "Белок, запасающий железо",
      clinicalSignificance: "Показатель запасов железа в организме",
      increasedMeaning: "Гемохроматоз, воспаление, злокачественные новообразования",
      decreasedMeaning: "Дефицит железа, железодефицитная анемия",
      relatedConditions: ["Железодефицитная анемия", "Гемохроматоз", "Воспаление"],
      synonyms: ["FERR", "Ферр", "Ферритин"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/iron-deficiency-anemia"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "ТТГ",
      nameEn: "TSH",
      code: "TSH",
      shortName: "ТТГ",
      unit: "мЕд/л",
      description: "Тиреотропный гормон гипофиза",
      clinicalSignificance: "Основной показатель функции щитовидной железы",
      increasedMeaning: "Гипотиреоз, тиреоидит, дефицит йода",
      decreasedMeaning: "Гипертиреоз, тиреотоксикоз, прием тиреоидных гормонов",
      relatedConditions: ["Гипотиреоз", "Гипертиреоз", "Тиреоидит"],
      synonyms: ["TSH", "ТТГ", "Тиреотропный гормон"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/thyroid-function-tests"
        },
        references: [
          { name: "Medscape", url: "https://reference.medscape.com/" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Свободный Т4",
      nameEn: "Free T4",
      code: "FT4",
      shortName: "свТ4",
      unit: "пмоль/л",
      description: "Свободный тироксин - активная форма гормона щитовидной железы",
      clinicalSignificance: "Показатель функции щитовидной железы",
      increasedMeaning: "Гипертиреоз, тиреотоксикоз, прием тиреоидных гормонов",
      decreasedMeaning: "Гипотиреоз, тиреоидит, дефицит йода",
      relatedConditions: ["Гипертиреоз", "Гипотиреоз", "Тиреотоксикоз"],
      synonyms: ["FT4", "свТ4", "Свободный тироксин"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/thyroid-function-tests"
        },
        references: [
          { name: "Medscape", url: "https://reference.medscape.com/" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },

    // Показатели коагулограммы
    {
      name: "ПТИ",
      nameEn: "PTI",
      code: "PTI",
      shortName: "ПТИ",
      unit: "%",
      description: "Протромбиновый индекс - показатель внешнего пути свертывания",
      clinicalSignificance: "Оценка функции свертывания крови",
      increasedMeaning: "Гиперкоагуляция, риск тромбозов",
      decreasedMeaning: "Гипокоагуляция, риск кровотечений, дефицит витамина K",
      relatedConditions: ["Тромбоз", "Кровотечение", "Дефицит витамина K"],
      synonyms: ["PTI", "ПТИ", "Протромбиновый индекс"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/coagulation-tests"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "МНО",
      nameEn: "INR",
      code: "INR",
      shortName: "МНО",
      unit: "ед",
      description: "Международное нормализованное отношение",
      clinicalSignificance: "Стандартизированный показатель свертывания крови",
      increasedMeaning: "Гипокоагуляция, риск кровотечений",
      decreasedMeaning: "Гиперкоагуляция, риск тромбозов",
      relatedConditions: ["Тромбоз", "Кровотечение", "Антикоагулянтная терапия"],
      synonyms: ["INR", "МНО", "Международное нормализованное отношение"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/anticoagulation"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Фибриноген",
      nameEn: "Fibrinogen",
      code: "FIB",
      shortName: "Фибр",
      unit: "г/л",
      description: "Белок свертывания крови",
      clinicalSignificance: "Показатель функции свертывания и воспаления",
      increasedMeaning: "Воспаление, стресс, беременность, злокачественные новообразования",
      decreasedMeaning: "Гипофибриногенемия, ДВС-синдром, печеночная недостаточность",
      relatedConditions: ["ДВС-синдром", "Воспаление", "Печеночная недостаточность"],
      synonyms: ["FIB", "Фибр", "Фибриноген"],
      sources: {
        primary: {
          name: "UpToDate",
          url: "https://www.uptodate.com/contents/disseminated-intravascular-coagulation"
        },
        references: [
          { name: "MSD Manuals", url: "https://www.msdmanuals.com/ru-ru/professional" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    }
  ],

  methodologies: [
    {
      name: "Стандарты Минздрава РФ",
      type: "MINZDRAV_RF",
      description: "Официальные нормативы Министерства здравоохранения Российской Федерации",
      organization: "Минздрав РФ",
      country: "Россия",
      version: "2024",
      effectiveFrom: new Date("2024-01-01"),
      source: "Приказы и методические рекомендации Минздрава РФ",
      sources: {
        primary: {
          name: "Минздрав РФ",
          url: "https://minzdrav.gov.ru/"
        },
        references: [
          { name: "RUCLM", url: "https://rucml.ru/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Американские стандарты (CDC/NIH)",
      type: "US_STANDARDS",
      description: "Стандарты Центров по контролю и профилактике заболеваний и Национальных институтов здравоохранения США",
      organization: "CDC/NIH",
      country: "США",
      version: "2024",
      effectiveFrom: new Date("2024-01-01"),
      source: "Clinical Laboratory Standards Institute (CLSI)",
      sources: {
        primary: {
          name: "CDC",
          url: "https://www.cdc.gov/"
        },
        references: [
          { name: "NIH", url: "https://www.nih.gov/" },
          { name: "UpToDate", url: "https://www.uptodate.com/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Европейские стандарты (ESC/EASL)",
      type: "EU_STANDARDS",
      description: "Стандарты Европейского общества кардиологов и Европейской ассоциации по изучению печени",
      organization: "ESC/EASL",
      country: "Европа",
      version: "2024",
      effectiveFrom: new Date("2024-01-01"),
      source: "European Guidelines",
      sources: {
        primary: {
          name: "ESC",
          url: "https://www.escardio.org/"
        },
        references: [
          { name: "EASL", url: "https://easl.eu/" },
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    },
    {
      name: "Стандарты ВОЗ",
      type: "WHO",
      description: "Международные стандарты Всемирной организации здравоохранения",
      organization: "WHO",
      country: "Международные",
      version: "2024",
      effectiveFrom: new Date("2024-01-01"),
      source: "WHO Guidelines",
      sources: {
        primary: {
          name: "WHO",
          url: "https://www.who.int/"
        },
        references: [
          { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" },
          { name: "NCBI", url: "https://www.ncbi.nlm.nih.gov/" }
        ],
        lastChecked: new Date().toISOString()
      },
      lastUpdated: new Date()
    }
  ]
};

// Референсные диапазоны для разных методологий
const referenceRanges = [
  // Гемоглобин
  {
    indicatorName: "Гемоглобин",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "male",
    minValue: 130,
    maxValue: 160,
    optimalMin: 140,
    optimalMax: 150,
    criticalLow: 80,
    criticalHigh: 200,
    note: "Норма для взрослых мужчин",
    conditions: ["Натощак", "Утренние часы"]
  },
  {
    indicatorName: "Гемоглобин",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "female",
    minValue: 120,
    maxValue: 140,
    optimalMin: 125,
    optimalMax: 135,
    criticalLow: 70,
    criticalHigh: 180,
    note: "Норма для взрослых женщин",
    conditions: ["Натощак", "Утренние часы"]
  },
  {
    indicatorName: "Гемоглобин",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "male",
    minValue: 135,
    maxValue: 175,
    optimalMin: 145,
    optimalMax: 165,
    criticalLow: 80,
    criticalHigh: 200,
    note: "CDC reference ranges",
    conditions: ["Fasting", "Morning collection"]
  },
  {
    indicatorName: "Гемоглобин",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "female",
    minValue: 120,
    maxValue: 155,
    optimalMin: 130,
    optimalMax: 145,
    criticalLow: 70,
    criticalHigh: 180,
    note: "CDC reference ranges",
    conditions: ["Fasting", "Morning collection"]
  },

  // Глюкоза
  {
    indicatorName: "Глюкоза",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 3.9,
    maxValue: 6.1,
    optimalMin: 4.5,
    optimalMax: 5.5,
    criticalLow: 2.8,
    criticalHigh: 11.1,
    note: "Натощак, венозная кровь",
    conditions: ["Натощак 8-12 часов", "Венозная кровь"]
  },
  {
    indicatorName: "Глюкоза",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 3.9,
    maxValue: 5.6,
    optimalMin: 4.4,
    optimalMax: 5.2,
    criticalLow: 2.8,
    criticalHigh: 11.1,
    note: "Fasting plasma glucose",
    conditions: ["Fasting 8-12 hours", "Plasma"]
  },
  {
    indicatorName: "Глюкоза",
    methodologyName: "Стандарты ВОЗ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 3.9,
    maxValue: 6.1,
    optimalMin: 4.5,
    optimalMax: 5.5,
    criticalLow: 2.8,
    criticalHigh: 11.1,
    note: "WHO diagnostic criteria",
    conditions: ["Fasting", "Venous blood"]
  },

  // Общий холестерин
  {
    indicatorName: "Общий холестерин",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 3.0,
    maxValue: 5.2,
    optimalMin: 3.5,
    optimalMax: 4.5,
    criticalLow: 2.0,
    criticalHigh: 8.0,
    note: "Желательный уровень",
    conditions: ["Натощак", "Венозная кровь"]
  },
  {
    indicatorName: "Общий холестерин",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 3.0,
    maxValue: 5.2,
    optimalMin: 3.5,
    optimalMax: 4.5,
    criticalLow: 2.0,
    criticalHigh: 8.0,
    note: "Desirable level",
    conditions: ["Fasting", "Serum"]
  },
  {
    indicatorName: "Общий холестерин",
    methodologyName: "Европейские стандарты (ESC/EASL)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 3.0,
    maxValue: 5.0,
    optimalMin: 3.5,
    optimalMax: 4.5,
    criticalLow: 2.0,
    criticalHigh: 8.0,
    note: "ESC guidelines",
    conditions: ["Fasting", "Serum"]
  },

  // ЛПНП
  {
    indicatorName: "ЛПНП",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 1.0,
    maxValue: 3.0,
    optimalMin: 1.5,
    optimalMax: 2.5,
    criticalLow: 0.5,
    criticalHigh: 5.0,
    note: "Оптимальный уровень",
    conditions: ["Натощак", "Расчетный метод"]
  },
  {
    indicatorName: "ЛПНП",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 1.0,
    maxValue: 2.6,
    optimalMin: 1.5,
    optimalMax: 2.3,
    criticalLow: 0.5,
    criticalHigh: 5.0,
    note: "Optimal level",
    conditions: ["Fasting", "Direct measurement"]
  },

  // ЛПВП
  {
    indicatorName: "ЛПВП",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "male",
    minValue: 1.0,
    maxValue: 3.0,
    optimalMin: 1.2,
    optimalMax: 2.0,
    criticalLow: 0.5,
    criticalHigh: 3.0,
    note: "Защитный уровень для мужчин",
    conditions: ["Натощак", "Прямое измерение"]
  },
  {
    indicatorName: "ЛПВП",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "female",
    minValue: 1.2,
    maxValue: 3.0,
    optimalMin: 1.4,
    optimalMax: 2.2,
    criticalLow: 0.5,
    criticalHigh: 3.0,
    note: "Защитный уровень для женщин",
    conditions: ["Натощак", "Прямое измерение"]
  },

  // Креатинин
  {
    indicatorName: "Креатинин",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "male",
    minValue: 62,
    maxValue: 106,
    optimalMin: 70,
    optimalMax: 100,
    criticalLow: 30,
    criticalHigh: 200,
    note: "Норма для мужчин",
    conditions: ["Натощак", "Венозная кровь"]
  },
  {
    indicatorName: "Креатинин",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "female",
    minValue: 53,
    maxValue: 97,
    optimalMin: 60,
    optimalMax: 90,
    criticalLow: 25,
    criticalHigh: 180,
    note: "Норма для женщин",
    conditions: ["Натощак", "Венозная кровь"]
  },

  // АСТ
  {
    indicatorName: "АСТ",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 10,
    maxValue: 37,
    optimalMin: 15,
    optimalMax: 30,
    criticalLow: 5,
    criticalHigh: 100,
    note: "Нормальная активность",
    conditions: ["Натощак", "Сыворотка"]
  },
  {
    indicatorName: "АСТ",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 10,
    maxValue: 40,
    optimalMin: 15,
    optimalMax: 35,
    criticalLow: 5,
    criticalHigh: 100,
    note: "Normal range",
    conditions: ["Fasting", "Serum"]
  },

  // АЛТ
  {
    indicatorName: "АЛТ",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 7,
    maxValue: 40,
    optimalMin: 10,
    optimalMax: 35,
    criticalLow: 3,
    criticalHigh: 150,
    note: "Нормальная активность",
    conditions: ["Натощак", "Сыворотка"]
  },
  {
    indicatorName: "АЛТ",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 7,
    maxValue: 56,
    optimalMin: 10,
    optimalMax: 50,
    criticalLow: 3,
    criticalHigh: 150,
    note: "Normal range",
    conditions: ["Fasting", "Serum"]
  },

  // ТТГ
  {
    indicatorName: "ТТГ",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 0.4,
    maxValue: 4.0,
    optimalMin: 0.8,
    optimalMax: 2.5,
    criticalLow: 0.1,
    criticalHigh: 10.0,
    note: "Нормальная функция щитовидной железы",
    conditions: ["Натощак", "Сыворотка"]
  },
  {
    indicatorName: "ТТГ",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 0.4,
    maxValue: 4.0,
    optimalMin: 0.8,
    optimalMax: 2.5,
    criticalLow: 0.1,
    criticalHigh: 10.0,
    note: "Normal thyroid function",
    conditions: ["Fasting", "Serum"]
  },

  // Свободный Т4
  {
    indicatorName: "Свободный Т4",
    methodologyName: "Стандарты Минздрава РФ",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 9.0,
    maxValue: 19.0,
    optimalMin: 12.0,
    optimalMax: 17.0,
    criticalLow: 5.0,
    criticalHigh: 30.0,
    note: "Нормальная концентрация",
    conditions: ["Натощак", "Сыворотка"]
  },
  {
    indicatorName: "Свободный Т4",
    methodologyName: "Американские стандарты (CDC/NIH)",
    ageGroupMin: 18,
    ageGroupMax: 65,
    gender: "all",
    minValue: 9.0,
    maxValue: 19.0,
    optimalMin: 12.0,
    optimalMax: 17.0,
    criticalLow: 5.0,
    criticalHigh: 30.0,
    note: "Normal concentration",
    conditions: ["Fasting", "Serum"]
  }
];

async function main() {
  console.log('🚀 Создание полной базы медицинских знаний...');

  try {
    // Создаем методологии
    console.log('📋 Создание методологий...');
    const createdMethodologies = [];
    for (const methodology of medicalKnowledge.methodologies) {
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

    // Создаем типы исследований
    console.log('🧪 Создание типов исследований...');
    const createdStudyTypes = [];
    for (const studyType of medicalKnowledge.studyTypes) {
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

    // Создаем показатели
    console.log('📊 Создание показателей...');
    const createdIndicators = [];
    for (const indicator of medicalKnowledge.indicators) {
      // Находим соответствующий тип исследования
      let studyTypeId;
      if (indicator.name.includes('Гемоглобин') || indicator.name.includes('Эритроциты') || 
          indicator.name.includes('Лейкоциты') || indicator.name.includes('Тромбоциты') ||
          indicator.name.includes('Гематокрит') || indicator.name.includes('СОЭ')) {
        const studyType = createdStudyTypes.find(st => st.name === 'Общий анализ крови');
        studyTypeId = studyType?.id;
      } else if (indicator.name.includes('Глюкоза') || indicator.name.includes('Холестерин') ||
                 indicator.name.includes('ЛПНП') || indicator.name.includes('ЛПВП') ||
                 indicator.name.includes('Триглицериды') || indicator.name.includes('Креатинин') ||
                 indicator.name.includes('Мочевина') || indicator.name.includes('АСТ') ||
                 indicator.name.includes('АЛТ') || indicator.name.includes('Билирубин') ||
                 indicator.name.includes('Общий белок') || indicator.name.includes('Альбумин') ||
                 indicator.name.includes('С-реактивный белок') || indicator.name.includes('Ферритин') ||
                 indicator.name.includes('ТТГ') || indicator.name.includes('Т4')) {
        const studyType = createdStudyTypes.find(st => st.name === 'Биохимический анализ крови');
        studyTypeId = studyType?.id;
      } else if (indicator.name.includes('Белок в моче') || indicator.name.includes('Лейкоциты в моче') ||
                 indicator.name.includes('Эритроциты в моче')) {
        const studyType = createdStudyTypes.find(st => st.name === 'Общий анализ мочи');
        studyTypeId = studyType?.id;
      } else if (indicator.name.includes('ПТИ') || indicator.name.includes('МНО') ||
                 indicator.name.includes('Фибриноген')) {
        const studyType = createdStudyTypes.find(st => st.name === 'Коагулограмма');
        studyTypeId = studyType?.id;
      }

      if (!studyTypeId) {
        console.log(`⚠️ Не найден тип исследования для показателя: ${indicator.name}`);
        continue;
      }

      const existing = await prisma.indicator.findFirst({
        where: {
          studyTypeId: studyTypeId,
          name: indicator.name
        }
      });

      let created;
      if (existing) {
        created = await prisma.indicator.update({
          where: { id: existing.id },
          data: { ...indicator, studyTypeId }
        });
      } else {
        created = await prisma.indicator.create({
          data: { ...indicator, studyTypeId }
        });
      }
      createdIndicators.push(created);
      console.log(`✅ Показатель: ${created.name}`);
    }

    // Создаем референсные диапазоны
    console.log('📏 Создание референсных диапазонов...');
    for (const range of referenceRanges) {
      const indicator = createdIndicators.find(ind => ind.name === range.indicatorName);
      const methodology = createdMethodologies.find(meth => meth.name === range.methodologyName);

      if (!indicator || !methodology) {
        console.log(`⚠️ Не найден показатель или методология для диапазона: ${range.indicatorName} - ${range.methodologyName}`);
        continue;
      }

      const existing = await prisma.referenceRange.findFirst({
        where: {
          indicatorId: indicator.id,
          methodologyId: methodology.id,
          gender: range.gender,
          ageGroupMin: range.ageGroupMin,
          ageGroupMax: range.ageGroupMax
        }
      });

      const rangeData = {
        indicatorId: indicator.id,
        methodologyId: methodology.id,
        ageGroupMin: range.ageGroupMin,
        ageGroupMax: range.ageGroupMax,
        gender: range.gender,
        minValue: range.minValue,
        maxValue: range.maxValue,
        optimalMin: range.optimalMin,
        optimalMax: range.optimalMax,
        criticalLow: range.criticalLow,
        criticalHigh: range.criticalHigh,
        note: range.note,
        conditions: range.conditions
      };

      if (existing) {
        await prisma.referenceRange.update({
          where: { id: existing.id },
          data: rangeData
        });
      } else {
        await prisma.referenceRange.create({
          data: rangeData
        });
      }
      console.log(`✅ Референсный диапазон: ${range.indicatorName} (${range.methodologyName})`);
    }

    console.log('🎉 Полная база медицинских знаний создана успешно!');
    console.log(`📊 Статистика:`);
    console.log(`   - Типов исследований: ${createdStudyTypes.length}`);
    console.log(`   - Показателей: ${createdIndicators.length}`);
    console.log(`   - Методологий: ${createdMethodologies.length}`);
    console.log(`   - Референсных диапазонов: ${referenceRanges.length}`);

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
