const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Добавление всех показателей к типам исследований...');

  try {
    // Получаем все типы исследований
    const studyTypes = await prisma.studyType.findMany();
    console.log(`📊 Найдено типов исследований: ${studyTypes.length}`);

    // Создаем Map для быстрого поиска
    const studyTypesMap = new Map();
    studyTypes.forEach(st => {
      studyTypesMap.set(st.code, st);
      studyTypesMap.set(st.name, st);
    });

    // Полный список показателей для каждого типа исследования
    const allIndicators = [
      // Общий анализ крови (CBC) - 10 показателей
      { name: "Гемоглобин", nameEn: "Hemoglobin", code: "HGB", shortName: "Hb", unit: "г/л", studyTypeCode: "CBC", description: "Белок эритроцитов, переносящий кислород", clinicalSignificance: "Основной показатель для диагностики анемии", increasedMeaning: "Полицитемия, обезвоживание, хроническая гипоксия", decreasedMeaning: "Анемия, кровопотеря, гемолиз", relatedConditions: ["Анемия", "Полицитемия"], synonyms: ["Hb", "HGB"] },
      { name: "Эритроциты", nameEn: "Red Blood Cells", code: "RBC", shortName: "Эр", unit: "×10¹²/л", studyTypeCode: "CBC", description: "Красные кровяные клетки", clinicalSignificance: "Количественная оценка эритроцитарного ростка", increasedMeaning: "Полицитемия, обезвоживание", decreasedMeaning: "Анемия, кровопотеря", relatedConditions: ["Анемия"], synonyms: ["RBC", "Эр"] },
      { name: "Лейкоциты", nameEn: "White Blood Cells", code: "WBC", shortName: "Лейк", unit: "×10⁹/л", studyTypeCode: "CBC", description: "Белые кровяные клетки", clinicalSignificance: "Показатель воспаления и иммунного статуса", increasedMeaning: "Инфекции, воспаление, лейкоз", decreasedMeaning: "Угнетение костного мозга, вирусные инфекции", relatedConditions: ["Инфекции", "Лейкоз"], synonyms: ["WBC", "Лейк"] },
      { name: "Тромбоциты", nameEn: "Platelets", code: "PLT", shortName: "Тромб", unit: "×10⁹/л", studyTypeCode: "CBC", description: "Клетки свертывания крови", clinicalSignificance: "Оценка гемостатической функции", increasedMeaning: "Тромбоцитоз, воспаление", decreasedMeaning: "Тромбоцитопения, аутоиммунные заболевания", relatedConditions: ["Тромбоцитопения"], synonyms: ["PLT", "Тромб"] },
      { name: "Гематокрит", nameEn: "Hematocrit", code: "HCT", shortName: "Ht", unit: "%", studyTypeCode: "CBC", description: "Объемная доля эритроцитов", clinicalSignificance: "Показатель густоты крови", increasedMeaning: "Полицитемия, обезвоживание", decreasedMeaning: "Анемия, гипергидратация", relatedConditions: ["Анемия", "Полицитемия"], synonyms: ["HCT", "Ht"] },
      { name: "СОЭ", nameEn: "ESR", code: "ESR", shortName: "СОЭ", unit: "мм/ч", studyTypeCode: "CBC", description: "Скорость оседания эритроцитов", clinicalSignificance: "Неспецифический маркер воспаления", increasedMeaning: "Воспаление, инфекции, злокачественные новообразования", decreasedMeaning: "Полицитемия, серповидноклеточная анемия", relatedConditions: ["Воспаление", "Инфекции"], synonyms: ["ESR", "СОЭ"] },
      { name: "MCV", nameEn: "Mean Corpuscular Volume", code: "MCV", shortName: "MCV", unit: "фл", studyTypeCode: "CBC", description: "Средний объем эритроцита", clinicalSignificance: "Классификация анемий", increasedMeaning: "Макроцитарная анемия, дефицит B12", decreasedMeaning: "Микроцитарная анемия, дефицит железа", relatedConditions: ["Анемия"], synonyms: ["MCV"] },
      { name: "MCH", nameEn: "Mean Corpuscular Hemoglobin", code: "MCH", shortName: "MCH", unit: "пг", studyTypeCode: "CBC", description: "Среднее содержание гемоглобина в эритроците", clinicalSignificance: "Классификация анемий", increasedMeaning: "Гиперхромная анемия", decreasedMeaning: "Гипохромная анемия", relatedConditions: ["Анемия"], synonyms: ["MCH"] },
      { name: "MCHC", nameEn: "Mean Corpuscular Hemoglobin Concentration", code: "MCHC", shortName: "MCHC", unit: "г/л", studyTypeCode: "CBC", description: "Средняя концентрация гемоглобина в эритроците", clinicalSignificance: "Классификация анемий", increasedMeaning: "Сфероцитоз", decreasedMeaning: "Железодефицитная анемия", relatedConditions: ["Анемия"], synonyms: ["MCHC"] },
      { name: "RDW", nameEn: "Red Cell Distribution Width", code: "RDW", shortName: "RDW", unit: "%", studyTypeCode: "CBC", description: "Ширина распределения эритроцитов по объему", clinicalSignificance: "Оценка анизоцитоза", increasedMeaning: "Анизоцитоз, смешанные анемии", decreasedMeaning: "Норма", relatedConditions: ["Анемия"], synonyms: ["RDW"] },

      // Ретикулоциты (RETIC) - 1 показатель
      { name: "Ретикулоциты", nameEn: "Reticulocytes", code: "RETIC", shortName: "Ret", unit: "‰", studyTypeCode: "RETIC", description: "Молодые эритроциты", clinicalSignificance: "Оценка регенераторной способности костного мозга", increasedMeaning: "Активная регенерация при анемии, гемолиз", decreasedMeaning: "Апластическая анемия, угнетение костного мозга", relatedConditions: ["Анемия", "Гемолиз"], synonyms: ["Ret", "RETIC"] },

      // Лейкоцитарная формула (DIFF) - 5 показателей
      { name: "Нейтрофилы", nameEn: "Neutrophils", code: "NEUT", shortName: "Нейтр", unit: "%", studyTypeCode: "DIFF", description: "Основные клетки врожденного иммунитета", clinicalSignificance: "Диагностика бактериальных инфекций", increasedMeaning: "Бактериальные инфекции, воспаление", decreasedMeaning: "Вирусные инфекции, агранулоцитоз", relatedConditions: ["Инфекции", "Сепсис"], synonyms: ["NEUT", "Нейтр"] },
      { name: "Лимфоциты", nameEn: "Lymphocytes", code: "LYMPH", shortName: "Лимф", unit: "%", studyTypeCode: "DIFF", description: "Клетки адаптивного иммунитета", clinicalSignificance: "Диагностика вирусных инфекций", increasedMeaning: "Вирусные инфекции, лимфолейкоз", decreasedMeaning: "Иммунодефицит, стресс", relatedConditions: ["Инфекции", "Лимфолейкоз"], synonyms: ["LYMPH", "Лимф"] },
      { name: "Моноциты", nameEn: "Monocytes", code: "MONO", shortName: "Мон", unit: "%", studyTypeCode: "DIFF", description: "Макрофаги крови", clinicalSignificance: "Диагностика хронических инфекций", increasedMeaning: "Хронические инфекции, туберкулез", decreasedMeaning: "Апластическая анемия", relatedConditions: ["Инфекции", "Туберкулез"], synonyms: ["MONO", "Мон"] },
      { name: "Эозинофилы", nameEn: "Eosinophils", code: "EOS", shortName: "Эоз", unit: "%", studyTypeCode: "DIFF", description: "Клетки, участвующие в аллергических реакциях", clinicalSignificance: "Диагностика аллергий и паразитозов", increasedMeaning: "Аллергии, паразитозы, бронхиальная астма", decreasedMeaning: "Стресс, острые инфекции", relatedConditions: ["Аллергия", "Паразитозы"], synonyms: ["EOS", "Эоз"] },
      { name: "Базофилы", nameEn: "Basophils", code: "BASO", shortName: "Баз", unit: "%", studyTypeCode: "DIFF", description: "Клетки, участвующие в аллергических реакциях", clinicalSignificance: "Диагностика аллергий", increasedMeaning: "Аллергии, хронический миелолейкоз", decreasedMeaning: "Гипертиреоз, стресс", relatedConditions: ["Аллергия"], synonyms: ["BASO", "Баз"] },

      // Биохимический анализ (CHEM) - 20+ показателей
      { name: "Глюкоза", nameEn: "Glucose", code: "GLU", shortName: "Глюк", unit: "ммоль/л", studyTypeCode: "CHEM", description: "Основной углевод крови", clinicalSignificance: "Диагностика сахарного диабета", increasedMeaning: "Сахарный диабет, стресс, панкреатит", decreasedMeaning: "Гипогликемия, инсулинома", relatedConditions: ["Диабет", "Гипогликемия"], synonyms: ["GLU", "Глюк"] },
      { name: "Гликированный гемоглобин", nameEn: "HbA1c", code: "HBA1C", shortName: "HbA1c", unit: "%", studyTypeCode: "CHEM", description: "Средний уровень глюкозы за 3 месяца", clinicalSignificance: "Контроль диабета", increasedMeaning: "Плохой контроль диабета", decreasedMeaning: "Хороший контроль диабета", relatedConditions: ["Диабет"], synonyms: ["HbA1c", "Гликированный Hb"] },
      { name: "Креатинин", nameEn: "Creatinine", code: "CREA", shortName: "Креат", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Продукт метаболизма креатина", clinicalSignificance: "Показатель функции почек", increasedMeaning: "Почечная недостаточность, обезвоживание", decreasedMeaning: "Снижение мышечной массы", relatedConditions: ["ХБП", "ОПН"], synonyms: ["CREA", "Креат"] },
      { name: "Мочевина", nameEn: "Urea", code: "UREA", shortName: "Мочев", unit: "ммоль/л", studyTypeCode: "CHEM", description: "Конечный продукт белкового обмена", clinicalSignificance: "Показатель функции почек", increasedMeaning: "Почечная недостаточность, обезвоживание", decreasedMeaning: "Печеночная недостаточность", relatedConditions: ["ХБП", "ОПН"], synonyms: ["UREA", "Мочев"] },
      { name: "Мочевая кислота", nameEn: "Uric Acid", code: "UA_ACID", shortName: "МК", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Продукт обмена пуринов", clinicalSignificance: "Диагностика подагры", increasedMeaning: "Подагра, почечная недостаточность", decreasedMeaning: "Синдром Фанкони", relatedConditions: ["Подагра", "ХБП"], synonyms: ["UA", "МК"] },
      { name: "АСТ", nameEn: "AST", code: "AST", shortName: "АСТ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Фермент печени и сердца", clinicalSignificance: "Маркер повреждения печени и миокарда", increasedMeaning: "Гепатит, инфаркт миокарда, мышечные заболевания", decreasedMeaning: "Дефицит витамина B6", relatedConditions: ["Гепатит", "Инфаркт"], synonyms: ["AST", "АСТ"] },
      { name: "АЛТ", nameEn: "ALT", code: "ALT", shortName: "АЛТ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Специфичный фермент печени", clinicalSignificance: "Маркер повреждения печени", increasedMeaning: "Гепатит, цирроз, жировая дистрофия печени", decreasedMeaning: "Дефицит витамина B6", relatedConditions: ["Гепатит", "Цирроз"], synonyms: ["ALT", "АЛТ"] },
      { name: "ГГТ", nameEn: "GGT", code: "GGT", shortName: "ГГТ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Гамма-глутамилтрансфераза", clinicalSignificance: "Маркер холестаза и алкоголизма", increasedMeaning: "Холестаз, алкоголизм, заболевания печени", decreasedMeaning: "Норма", relatedConditions: ["Холестаз", "Алкоголизм"], synonyms: ["GGT", "ГГТ"] },
      { name: "Щелочная фосфатаза", nameEn: "Alkaline Phosphatase", code: "ALP", shortName: "ЩФ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Фермент костей и печени", clinicalSignificance: "Маркер холестаза и костных заболеваний", increasedMeaning: "Холестаз, болезни костей, рахит", decreasedMeaning: "Гипофосфатазия", relatedConditions: ["Холестаз", "Остеопороз"], synonyms: ["ALP", "ЩФ"] },
      { name: "Общий билирубин", nameEn: "Total Bilirubin", code: "TBIL", shortName: "Билир", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Продукт распада гемоглобина", clinicalSignificance: "Показатель функции печени", increasedMeaning: "Желтуха, гепатит, цирроз, гемолиз", decreasedMeaning: "Анемия", relatedConditions: ["Желтуха", "Гепатит"], synonyms: ["TBIL", "Билир"] },
      { name: "Прямой билирубин", nameEn: "Direct Bilirubin", code: "DBIL", shortName: "Прям.билир", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Конъюгированный билирубин", clinicalSignificance: "Дифференциальная диагностика желтух", increasedMeaning: "Механическая желтуха, холестаз", decreasedMeaning: "Норма", relatedConditions: ["Желтуха", "Холестаз"], synonyms: ["DBIL"] },
      { name: "Общий белок", nameEn: "Total Protein", code: "TP", shortName: "ОБ", unit: "г/л", studyTypeCode: "CHEM", description: "Общее количество белков", clinicalSignificance: "Показатель белкового обмена", increasedMeaning: "Обезвоживание, воспаление", decreasedMeaning: "Гипопротеинемия, печеночная недостаточность", relatedConditions: ["Гипопротеинемия"], synonyms: ["TP", "ОБ"] },
      { name: "Альбумин", nameEn: "Albumin", code: "ALB", shortName: "Альб", unit: "г/л", studyTypeCode: "CHEM", description: "Основной белок плазмы", clinicalSignificance: "Показатель функции печени", increasedMeaning: "Обезвоживание", decreasedMeaning: "Гипоальбуминемия, печеночная недостаточность", relatedConditions: ["Гипоальбуминемия"], synonyms: ["ALB", "Альб"] },
      { name: "С-реактивный белок", nameEn: "CRP", code: "CRP", shortName: "СРБ", unit: "мг/л", studyTypeCode: "CHEM", description: "Белок острой фазы воспаления", clinicalSignificance: "Маркер воспаления", increasedMeaning: "Воспаление, инфекции, аутоиммунные заболевания", decreasedMeaning: "Норма", relatedConditions: ["Воспаление", "Инфекции"], synonyms: ["CRP", "СРБ"] },
      { name: "Прокальцитонин", nameEn: "Procalcitonin", code: "PCT", shortName: "ПКТ", unit: "нг/мл", studyTypeCode: "CHEM", description: "Маркер бактериальной инфекции", clinicalSignificance: "Дифференциальная диагностика инфекций", increasedMeaning: "Бактериальная инфекция, сепсис", decreasedMeaning: "Вирусная инфекция", relatedConditions: ["Сепсис", "Инфекции"], synonyms: ["PCT", "ПКТ"] },
      { name: "Ферритин", nameEn: "Ferritin", code: "FERR", shortName: "Ферр", unit: "нг/мл", studyTypeCode: "CHEM", description: "Белок запасов железа", clinicalSignificance: "Показатель запасов железа", increasedMeaning: "Гемохроматоз, воспаление", decreasedMeaning: "Дефицит железа, железодефицитная анемия", relatedConditions: ["Анемия", "Гемохроматоз"], synonyms: ["FERR", "Ферр"] },
      { name: "Железо сыворотки", nameEn: "Serum Iron", code: "FE", shortName: "Fe", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Железо в сыворотке крови", clinicalSignificance: "Диагностика анемий", increasedMeaning: "Гемохроматоз, гемолиз", decreasedMeaning: "Дефицит железа, железодефицитная анемия", relatedConditions: ["Анемия"], synonyms: ["FE", "Fe"] },
      { name: "ОЖСС", nameEn: "TIBC", code: "TIBC", shortName: "ОЖСС", unit: "мкмоль/л", studyTypeCode: "CHEM", description: "Общая железосвязывающая способность", clinicalSignificance: "Диагностика анемий", increasedMeaning: "Дефицит железа", decreasedMeaning: "Гемохроматоз, воспаление", relatedConditions: ["Анемия"], synonyms: ["TIBC", "ОЖСС"] },
      { name: "Трансферрин", nameEn: "Transferrin", code: "TRANS", shortName: "Трансф", unit: "г/л", studyTypeCode: "CHEM", description: "Белок-переносчик железа", clinicalSignificance: "Диагностика анемий", increasedMeaning: "Дефицит железа", decreasedMeaning: "Гемохроматоз, воспаление", relatedConditions: ["Анемия"], synonyms: ["TRANS", "Трансф"] },
      { name: "Тропонин I", nameEn: "Troponin I", code: "TROP_I", shortName: "Тропонин", unit: "нг/мл", studyTypeCode: "CHEM", description: "Кардиоспецифичный белок", clinicalSignificance: "Диагностика инфаркта миокарда", increasedMeaning: "Инфаркт миокарда, миокардит", decreasedMeaning: "Норма", relatedConditions: ["Инфаркт миокарда"], synonyms: ["TROP_I", "Тропонин"] },
      { name: "КФК", nameEn: "CPK", code: "CPK", shortName: "КФК", unit: "Ед/л", studyTypeCode: "CHEM", description: "Креатинфосфокиназа", clinicalSignificance: "Маркер повреждения мышц и миокарда", increasedMeaning: "Инфаркт миокарда, миопатия, травмы", decreasedMeaning: "Норма", relatedConditions: ["Инфаркт", "Миопатия"], synonyms: ["CPK", "КФК"] },
      { name: "ЛДГ", nameEn: "LDH", code: "LDH", shortName: "ЛДГ", unit: "Ед/л", studyTypeCode: "CHEM", description: "Лактатдегидрогеназа", clinicalSignificance: "Неспецифичный маркер повреждения тканей", increasedMeaning: "Инфаркт, гемолиз, опухоли", decreasedMeaning: "Норма", relatedConditions: ["Инфаркт", "Гемолиз"], synonyms: ["LDH", "ЛДГ"] },
      { name: "NT-proBNP", nameEn: "NT-proBNP", code: "NTPROBNP", shortName: "NT-proBNP", unit: "пг/мл", studyTypeCode: "CHEM", description: "N-терминальный фрагмент мозгового натрийуретического пептида", clinicalSignificance: "Диагностика сердечной недостаточности", increasedMeaning: "Сердечная недостаточность", decreasedMeaning: "Норма", relatedConditions: ["Сердечная недостаточность"], synonyms: ["NTPROBNP"] },

      // Электролиты (ELEC) - 6 показателей
      { name: "Натрий", nameEn: "Sodium", code: "NA", shortName: "Na", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Основной внеклеточный катион", clinicalSignificance: "Оценка водно-электролитного баланса", increasedMeaning: "Гипернатриемия, обезвоживание", decreasedMeaning: "Гипонатриемия, гипергидратация", relatedConditions: ["Дегидратация", "Гипергидратация"], synonyms: ["Na", "Натрий"] },
      { name: "Калий", nameEn: "Potassium", code: "K", shortName: "K", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Основной внутриклеточный катион", clinicalSignificance: "Оценка водно-электролитного баланса", increasedMeaning: "Гиперкалиемия, почечная недостаточность", decreasedMeaning: "Гипокалиемия, рвота, диарея", relatedConditions: ["Аритмия", "ХБП"], synonyms: ["K", "Калий"] },
      { name: "Хлор", nameEn: "Chloride", code: "CL", shortName: "Cl", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Основной внеклеточный анион", clinicalSignificance: "Оценка водно-электролитного баланса", increasedMeaning: "Гиперхлоремия, обезвоживание", decreasedMeaning: "Гипохлоремия, рвота", relatedConditions: ["Ацидоз", "Алкалоз"], synonyms: ["Cl", "Хлор"] },
      { name: "Кальций общий", nameEn: "Total Calcium", code: "CA", shortName: "Ca", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Основной минерал костей", clinicalSignificance: "Оценка костного обмена", increasedMeaning: "Гиперкальциемия, гиперпаратиреоз", decreasedMeaning: "Гипокальциемия, гипопаратиреоз", relatedConditions: ["Остеопороз", "Гиперпаратиреоз"], synonyms: ["Ca", "Кальций"] },
      { name: "Магний", nameEn: "Magnesium", code: "MG", shortName: "Mg", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Важный внутриклеточный катион", clinicalSignificance: "Оценка электролитного баланса", increasedMeaning: "Гипермагниемия, почечная недостаточность", decreasedMeaning: "Гипомагниемия, диарея", relatedConditions: ["Аритмия", "Судороги"], synonyms: ["Mg", "Магний"] },
      { name: "Фосфор", nameEn: "Phosphorus", code: "P", shortName: "P", unit: "ммоль/л", studyTypeCode: "ELEC", description: "Минерал костей", clinicalSignificance: "Оценка костного обмена", increasedMeaning: "Гиперфосфатемия, почечная недостаточность", decreasedMeaning: "Гипофосфатемия, рахит", relatedConditions: ["ХБП", "Рахит"], synonyms: ["P", "Фосфор"] },

      // Ферменты поджелудочной (PANC) - 2 показателя
      { name: "Амилаза", nameEn: "Amylase", code: "AMY", shortName: "Амил", unit: "Ед/л", studyTypeCode: "PANC", description: "Фермент поджелудочной железы", clinicalSignificance: "Диагностика панкреатита", increasedMeaning: "Панкреатит, паротит", decreasedMeaning: "Недостаточность поджелудочной железы", relatedConditions: ["Панкреатит"], synonyms: ["AMY", "Амил"] },
      { name: "Липаза", nameEn: "Lipase", code: "LIP", shortName: "Липаза", unit: "Ед/л", studyTypeCode: "PANC", description: "Фермент поджелудочной железы", clinicalSignificance: "Диагностика панкреатита", increasedMeaning: "Панкреатит, более специфична чем амилаза", decreasedMeaning: "Недостаточность поджелудочной железы", relatedConditions: ["Панкреатит"], synonyms: ["LIP", "Липаза"] },

      // Липидный профиль (LIPID) - 4 показателя
      { name: "Общий холестерин", nameEn: "Total Cholesterol", code: "CHOL", shortName: "Холест", unit: "ммоль/л", studyTypeCode: "LIPID", description: "Общий уровень холестерина", clinicalSignificance: "Оценка риска сердечно-сосудистых заболеваний", increasedMeaning: "Гиперхолестеринемия, риск атеросклероза", decreasedMeaning: "Гипохолестеринемия, печеночная недостаточность", relatedConditions: ["Атеросклероз", "ИБС"], synonyms: ["CHOL", "Холест"] },
      { name: "ЛПНП", nameEn: "LDL", code: "LDL", shortName: "ЛПНП", unit: "ммоль/л", studyTypeCode: "LIPID", description: "Липопротеины низкой плотности - 'плохой' холестерин", clinicalSignificance: "Основной фактор риска атеросклероза", increasedMeaning: "Высокий риск атеросклероза, ИБС", decreasedMeaning: "Низкий риск ССЗ", relatedConditions: ["Атеросклероз", "ИБС"], synonyms: ["LDL", "ЛПНП"] },
      { name: "ЛПВП", nameEn: "HDL", code: "HDL", shortName: "ЛПВП", unit: "ммоль/л", studyTypeCode: "LIPID", description: "Липопротеины высокой плотности - 'хороший' холестерин", clinicalSignificance: "Защитный фактор от атеросклероза", increasedMeaning: "Низкий риск ССЗ", decreasedMeaning: "Высокий риск атеросклероза", relatedConditions: ["Атеросклероз"], synonyms: ["HDL", "ЛПВП"] },
      { name: "Триглицериды", nameEn: "Triglycerides", code: "TG", shortName: "ТГ", unit: "ммоль/л", studyTypeCode: "LIPID", description: "Основные липиды крови", clinicalSignificance: "Оценка риска ССЗ", increasedMeaning: "Гипертриглицеридемия, метаболический синдром", decreasedMeaning: "Гипотриглицеридемия", relatedConditions: ["Метаболический синдром", "Панкреатит"], synonyms: ["TG", "ТГ"] },

      // Гормоны щитовидной (THYROID) - 4 показателя
      { name: "ТТГ", nameEn: "TSH", code: "TSH", shortName: "ТТГ", unit: "мЕд/л", studyTypeCode: "THYROID", description: "Тиреотропный гормон гипофиза", clinicalSignificance: "Основной показатель функции щитовидной железы", increasedMeaning: "Гипотиреоз, тиреоидит", decreasedMeaning: "Гипертиреоз, тиреотоксикоз", relatedConditions: ["Гипотиреоз", "Гипертиреоз"], synonyms: ["TSH", "ТТГ"] },
      { name: "Свободный Т4", nameEn: "Free T4", code: "FT4", shortName: "свТ4", unit: "пмоль/л", studyTypeCode: "THYROID", description: "Свободный тироксин", clinicalSignificance: "Показатель функции щитовидной железы", increasedMeaning: "Гипертиреоз, тиреотоксикоз", decreasedMeaning: "Гипотиреоз", relatedConditions: ["Гипертиреоз", "Гипотиреоз"], synonyms: ["FT4", "свТ4"] },
      { name: "Свободный Т3", nameEn: "Free T3", code: "FT3", shortName: "свТ3", unit: "пмоль/л", studyTypeCode: "THYROID", description: "Свободный трийодтиронин", clinicalSignificance: "Показатель функции щитовидной железы", increasedMeaning: "Гипертиреоз, тиреотоксикоз", decreasedMeaning: "Гипотиреоз", relatedConditions: ["Гипертиреоз", "Гипотиреоз"], synonyms: ["FT3", "свТ3"] },
      { name: "Антитела к ТПО", nameEn: "Anti-TPO", code: "ATPO", shortName: "АТ-ТПО", unit: "МЕ/мл", studyTypeCode: "THYROID", description: "Антитела к тиреопероксидазе", clinicalSignificance: "Диагностика аутоиммунного тиреоидита", increasedMeaning: "Аутоиммунный тиреоидит Хашимото", decreasedMeaning: "Норма", relatedConditions: ["Тиреоидит Хашимото"], synonyms: ["ATPO", "АТ-ТПО"] },

      // Коагулограмма (COAG) - 5 показателей
      { name: "ПТИ", nameEn: "PTI", code: "PTI", shortName: "ПТИ", unit: "%", studyTypeCode: "COAG", description: "Протромбиновый индекс", clinicalSignificance: "Оценка внешнего пути свертывания", increasedMeaning: "Гиперкоагуляция, риск тромбозов", decreasedMeaning: "Гипокоагуляция, риск кровотечений", relatedConditions: ["Тромбоз", "Кровотечение"], synonyms: ["PTI", "ПТИ"] },
      { name: "МНО", nameEn: "INR", code: "INR", shortName: "МНО", unit: "ед", studyTypeCode: "COAG", description: "Международное нормализованное отношение", clinicalSignificance: "Контроль антикоагулянтной терапии", increasedMeaning: "Гипокоагуляция, риск кровотечений", decreasedMeaning: "Гиперкоагуляция, риск тромбозов", relatedConditions: ["Тромбоз", "Антикоагулянтная терапия"], synonyms: ["INR", "МНО"] },
      { name: "Фибриноген", nameEn: "Fibrinogen", code: "FIB", shortName: "Фибр", unit: "г/л", studyTypeCode: "COAG", description: "Белок свертывания крови", clinicalSignificance: "Показатель свертывания и воспаления", increasedMeaning: "Воспаление, стресс, беременность", decreasedMeaning: "Гипофибриногенемия, ДВС-синдром", relatedConditions: ["ДВС-синдром", "Воспаление"], synonyms: ["FIB", "Фибр"] },
      { name: "АЧТВ", nameEn: "aPTT", code: "APTT", shortName: "АЧТВ", unit: "сек", studyTypeCode: "COAG", description: "Активированное частичное тромбопластиновое время", clinicalSignificance: "Оценка внутреннего пути свертывания", increasedMeaning: "Гипокоагуляция, гемофилия", decreasedMeaning: "Гиперкоагуляция", relatedConditions: ["Гемофилия", "ДВС-синдром"], synonyms: ["APTT", "АЧТВ"] },
      { name: "Д-димер", nameEn: "D-dimer", code: "DDIM", shortName: "Д-димер", unit: "мкг/л", studyTypeCode: "COAG", description: "Продукт распада фибрина", clinicalSignificance: "Диагностика тромбозов", increasedMeaning: "Тромбоз, ДВС-синдром, ТЭЛА", decreasedMeaning: "Норма", relatedConditions: ["Тромбоз", "ТЭЛА", "ДВС"], synonyms: ["DDIM", "Д-димер"] },

      // Общий анализ мочи (UA) - 7 показателей
      { name: "Белок в моче", nameEn: "Protein in Urine", code: "PROT_U", shortName: "Белок", unit: "г/л", studyTypeCode: "UA", description: "Содержание белка в моче", clinicalSignificance: "Показатель функции почек", increasedMeaning: "Протеинурия, нефротический синдром, диабетическая нефропатия", decreasedMeaning: "Норма", relatedConditions: ["Протеинурия", "Нефротический синдром"], synonyms: ["PROT", "Белок"] },
      { name: "Лейкоциты в моче", nameEn: "Leukocytes in Urine", code: "LEU_U", shortName: "Лейк", unit: "в п/з", studyTypeCode: "UA", description: "Количество лейкоцитов в моче", clinicalSignificance: "Показатель воспаления мочевыводящих путей", increasedMeaning: "Пиурия, цистит, пиелонефрит, уретрит", decreasedMeaning: "Норма", relatedConditions: ["Цистит", "Пиелонефрит"], synonyms: ["LEU", "Лейк"] },
      { name: "Эритроциты в моче", nameEn: "Erythrocytes in Urine", code: "ERY_U", shortName: "Эр", unit: "в п/з", studyTypeCode: "UA", description: "Количество эритроцитов в моче", clinicalSignificance: "Показатель гематурии", increasedMeaning: "Гематурия, гломерулонефрит, мочекаменная болезнь", decreasedMeaning: "Норма", relatedConditions: ["Гематурия", "Гломерулонефрит"], synonyms: ["ERY", "Эр"] },
      { name: "Глюкоза в моче", nameEn: "Glucose in Urine", code: "GLU_U", shortName: "Глюк", unit: "ммоль/л", studyTypeCode: "UA", description: "Содержание глюкозы в моче", clinicalSignificance: "Диагностика глюкозурии", increasedMeaning: "Глюкозурия, сахарный диабет", decreasedMeaning: "Норма", relatedConditions: ["Диабет", "Глюкозурия"], synonyms: ["GLU_U", "Глюк"] },
      { name: "Кетоновые тела в моче", nameEn: "Ketones in Urine", code: "KET", shortName: "Кетоны", unit: "ммоль/л", studyTypeCode: "UA", description: "Содержание кетоновых тел в моче", clinicalSignificance: "Диагностика кетоацидоза", increasedMeaning: "Кетоацидоз, голодание, диабет", decreasedMeaning: "Норма", relatedConditions: ["Кетоацидоз", "Диабет"], synonyms: ["KET", "Кетоны"] },
      { name: "Удельный вес мочи", nameEn: "Specific Gravity", code: "SG", shortName: "УВ", unit: "г/мл", studyTypeCode: "UA", description: "Плотность мочи", clinicalSignificance: "Оценка концентрационной функции почек", increasedMeaning: "Обезвоживание, глюкозурия", decreasedMeaning: "Полиурия, несахарный диабет", relatedConditions: ["Несахарный диабет", "ХБП"], synonyms: ["SG", "УВ"] },
      { name: "pH мочи", nameEn: "pH", code: "PH_U", shortName: "pH", unit: "ед", studyTypeCode: "UA", description: "Кислотность мочи", clinicalSignificance: "Оценка кислотно-основного состояния", increasedMeaning: "Алкалоз, инфекции МВП", decreasedMeaning: "Ацидоз, диабет", relatedConditions: ["Ацидоз", "Алкалоз"], synonyms: ["PH", "pH"] },

      // Витамины (VIT) - 3 показателя
      { name: "Витамин B12", nameEn: "Vitamin B12", code: "B12", shortName: "B12", unit: "пмоль/л", studyTypeCode: "VIT", description: "Витамин B12 (кобаламин)", clinicalSignificance: "Диагностика мегалобластной анемии", increasedMeaning: "Избыток B12, заболевания печени", decreasedMeaning: "Дефицит B12, мегалобластная анемия", relatedConditions: ["Анемия", "Нейропатия"], synonyms: ["B12", "Кобаламин"] },
      { name: "Фолиевая кислота", nameEn: "Folic Acid", code: "FOLIC", shortName: "Фолаты", unit: "нмоль/л", studyTypeCode: "VIT", description: "Фолиевая кислота (витамин B9)", clinicalSignificance: "Диагностика мегалобластной анемии", increasedMeaning: "Избыток фолатов", decreasedMeaning: "Дефицит фолатов, мегалобластная анемия", relatedConditions: ["Анемия"], synonyms: ["FOLIC", "Фолаты", "B9"] },
      { name: "Витамин D", nameEn: "Vitamin D", code: "VIT_D", shortName: "Вит D", unit: "нг/мл", studyTypeCode: "VIT", description: "25-гидроксивитамин D", clinicalSignificance: "Оценка статуса витамина D", increasedMeaning: "Гипервитаминоз D", decreasedMeaning: "Дефицит витамина D, остеопороз", relatedConditions: ["Остеопороз", "Рахит"], synonyms: ["VIT_D", "25-OH-D"] },

      // Анализ мочи по Нечипоренко (NECH) - 2 показателя
      { name: "Лейкоциты (Нечипоренко)", nameEn: "Leukocytes (Nechiporenko)", code: "LEU_N", shortName: "Лейк", unit: "в 1 мл", studyTypeCode: "NECH", description: "Количество лейкоцитов в 1 мл мочи", clinicalSignificance: "Уточняющая диагностика воспаления МВП", increasedMeaning: "Пиелонефрит, цистит", decreasedMeaning: "Норма", relatedConditions: ["Пиелонефрит", "Цистит"], synonyms: ["LEU_N"] },
      { name: "Эритроциты (Нечипоренко)", nameEn: "Erythrocytes (Nechiporenko)", code: "ERY_N", shortName: "Эр", unit: "в 1 мл", studyTypeCode: "NECH", description: "Количество эритроцитов в 1 мл мочи", clinicalSignificance: "Уточняющая диагностика гематурии", increasedMeaning: "Гломерулонефрит, мочекаменная болезнь", decreasedMeaning: "Норма", relatedConditions: ["Гломерулонефрит", "МКБ"], synonyms: ["ERY_N"] },

      // Анализ мочи по Зимницкому (ZIM) - 2 показателя
      { name: "Дневной диурез", nameEn: "Day Diuresis", code: "DAY_DIUR", shortName: "Дневн.диурез", unit: "мл", studyTypeCode: "ZIM", description: "Объем мочи за день", clinicalSignificance: "Оценка функции почек", increasedMeaning: "Полиурия", decreasedMeaning: "Олигурия", relatedConditions: ["ХБП"], synonyms: ["DAY_DIUR"] },
      { name: "Ночной диурез", nameEn: "Night Diuresis", code: "NIGHT_DIUR", shortName: "Ночн.диурез", unit: "мл", studyTypeCode: "ZIM", description: "Объем мочи за ночь", clinicalSignificance: "Оценка функции почек", increasedMeaning: "Никтурия", decreasedMeaning: "Олигурия", relatedConditions: ["ХБП", "Никтурия"], synonyms: ["NIGHT_DIUR"] },

      // Суточная протеинурия (24H_PROT) - 1 показатель
      { name: "Белок в суточной моче", nameEn: "24-hour Urine Protein", code: "PROT_24H", shortName: "Белок 24ч", unit: "г/сут", studyTypeCode: "24H_PROT", description: "Количество белка в суточной моче", clinicalSignificance: "Диагностика заболеваний почек", increasedMeaning: "Протеинурия, нефротический синдром", decreasedMeaning: "Норма", relatedConditions: ["Нефротический синдром", "ХБП"], synonyms: ["PROT_24H"] }
    ];

    console.log(`📊 Будет создано/обновлено показателей: ${allIndicators.length}`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const indicator of allIndicators) {
      const studyType = studyTypesMap.get(indicator.studyTypeCode);
      
      if (!studyType) {
        console.log(`⚠️ Не найден тип исследования для кода: ${indicator.studyTypeCode}`);
        skipped++;
        continue;
      }

      const { studyTypeCode, ...indicatorData } = indicator;

      const existing = await prisma.indicator.findFirst({
        where: {
          studyTypeId: studyType.id,
          code: indicator.code
        }
      });

      if (existing) {
        await prisma.indicator.update({
          where: { id: existing.id },
          data: { ...indicatorData, studyTypeId: studyType.id }
        });
        updated++;
      } else {
        await prisma.indicator.create({
          data: { ...indicatorData, studyTypeId: studyType.id }
        });
        created++;
      }

      if ((created + updated) % 10 === 0) {
        console.log(`   ✅ Обработано ${created + updated} показателей...`);
      }
    }

    console.log(`\n🎉 Показатели добавлены успешно!`);
    console.log(`📊 Статистика:`);
    console.log(`   ✅ Создано новых: ${created}`);
    console.log(`   ✅ Обновлено существующих: ${updated}`);
    console.log(`   ⚠️ Пропущено: ${skipped}`);

    // Проверяем результат
    const studyTypesWithIndicators = await prisma.studyType.findMany({
      include: {
        indicators: true
      }
    });

    console.log(`\n📋 Распределение показателей по типам исследований:`);
    studyTypesWithIndicators.forEach(st => {
      console.log(`   ${st.name}: ${st.indicators.length} показателей`);
    });

  } catch (error) {
    console.error('❌ Ошибка при добавлении показателей:', error);
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
