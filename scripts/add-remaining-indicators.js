const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Добавление показателей для оставшихся типов исследований...');

  try {
    const studyTypes = await prisma.studyType.findMany();
    const studyTypesMap = new Map();
    studyTypes.forEach(st => {
      studyTypesMap.set(st.code, st);
      studyTypesMap.set(st.name, st);
    });

    const remainingIndicators = [
      // Половые гормоны (SEX_HORM) - 8 показателей
      { name: "Тестостерон общий", nameEn: "Total Testosterone", code: "TEST", shortName: "Тест", unit: "нмоль/л", studyTypeCode: "SEX_HORM", description: "Основной мужской половой гормон", clinicalSignificance: "Оценка репродуктивной функции", increasedMeaning: "Гиперандрогения, опухоли", decreasedMeaning: "Гипогонадизм, возрастное снижение", relatedConditions: ["Гипогонадизм"], synonyms: ["TEST"] },
      { name: "Эстрадиол", nameEn: "Estradiol", code: "E2", shortName: "E2", unit: "пмоль/л", studyTypeCode: "SEX_HORM", description: "Основной женский половой гормон", clinicalSignificance: "Оценка репродуктивной функции", increasedMeaning: "Гиперэстрогения, опухоли", decreasedMeaning: "Гипоэстрогения, менопауза", relatedConditions: ["Менопауза"], synonyms: ["E2", "Эстрадиол"] },
      { name: "Прогестерон", nameEn: "Progesterone", code: "PROG", shortName: "Прог", unit: "нмоль/л", studyTypeCode: "SEX_HORM", description: "Гормон желтого тела", clinicalSignificance: "Оценка овуляции и беременности", increasedMeaning: "Беременность, опухоли", decreasedMeaning: "Недостаточность желтого тела", relatedConditions: ["Бесплодие"], synonyms: ["PROG"] },
      { name: "ЛГ", nameEn: "LH", code: "LH", shortName: "ЛГ", unit: "МЕ/л", studyTypeCode: "SEX_HORM", description: "Лютеинизирующий гормон", clinicalSignificance: "Оценка репродуктивной функции", increasedMeaning: "Менопауза, гипогонадизм", decreasedMeaning: "Гипопитуитаризм", relatedConditions: ["Бесплодие"], synonyms: ["LH", "ЛГ"] },
      { name: "ФСГ", nameEn: "FSH", code: "FSH", shortName: "ФСГ", unit: "МЕ/л", studyTypeCode: "SEX_HORM", description: "Фолликулостимулирующий гормон", clinicalSignificance: "Оценка репродуктивной функции", increasedMeaning: "Менопауза, гипогонадизм", decreasedMeaning: "Гипопитуитаризм", relatedConditions: ["Бесплодие"], synonyms: ["FSH", "ФСГ"] },
      { name: "Пролактин", nameEn: "Prolactin", code: "PRL", shortName: "ПРЛ", unit: "мМЕ/л", studyTypeCode: "SEX_HORM", description: "Гормон лактации", clinicalSignificance: "Диагностика гиперпролактинемии", increasedMeaning: "Гиперпролактинемия, пролактинома", decreasedMeaning: "Гипопитуитаризм", relatedConditions: ["Пролактинома", "Бесплодие"], synonyms: ["PRL", "ПРЛ"] },
      { name: "ДГЭА-С", nameEn: "DHEA-S", code: "DHEAS", shortName: "ДГЭА", unit: "мкмоль/л", studyTypeCode: "SEX_HORM", description: "Дегидроэпиандростерон-сульфат", clinicalSignificance: "Оценка функции надпочечников", increasedMeaning: "Гиперандрогения, опухоли надпочечников", decreasedMeaning: "Недостаточность надпочечников", relatedConditions: ["Гиперандрогения"], synonyms: ["DHEAS", "ДГЭА"] },
      { name: "17-ОН прогестерон", nameEn: "17-OH Progesterone", code: "17OHP", shortName: "17-ОП", unit: "нмоль/л", studyTypeCode: "SEX_HORM", description: "Предшественник кортизола", clinicalSignificance: "Диагностика ВДКН", increasedMeaning: "ВДКН, опухоли надпочечников", decreasedMeaning: "Недостаточность надпочечников", relatedConditions: ["ВДКН"], synonyms: ["17OHP"] },

      // Гормоны надпочечников (ADRENAL) - 4 показателя
      { name: "Кортизол", nameEn: "Cortisol", code: "CORT", shortName: "Корт", unit: "нмоль/л", studyTypeCode: "ADRENAL", description: "Основной гормон надпочечников", clinicalSignificance: "Оценка функции надпочечников", increasedMeaning: "Синдром Кушинга, стресс", decreasedMeaning: "Недостаточность надпочечников, болезнь Аддисона", relatedConditions: ["Синдром Кушинга", "Болезнь Аддисона"], synonyms: ["CORT", "Корт"] },
      { name: "АКТГ", nameEn: "ACTH", code: "ACTH", shortName: "АКТГ", unit: "пмоль/л", studyTypeCode: "ADRENAL", description: "Адренокортикотропный гормон", clinicalSignificance: "Оценка функции гипофиза и надпочечников", increasedMeaning: "Болезнь Аддисона, синдром Кушинга", decreasedMeaning: "Недостаточность гипофиза", relatedConditions: ["Болезнь Аддисона"], synonyms: ["ACTH", "АКТГ"] },
      { name: "Альдостерон", nameEn: "Aldosterone", code: "ALDO", shortName: "Альд", unit: "пмоль/л", studyTypeCode: "ADRENAL", description: "Минералокортикоид надпочечников", clinicalSignificance: "Регуляция водно-солевого обмена", increasedMeaning: "Гиперальдостеронизм, гипертония", decreasedMeaning: "Гипоальдостеронизм", relatedConditions: ["Гипертония"], synonyms: ["ALDO", "Альд"] },
      { name: "Ренин", nameEn: "Renin", code: "RENIN", shortName: "Ренин", unit: "нг/мл/ч", studyTypeCode: "ADRENAL", description: "Фермент ренин-ангиотензиновой системы", clinicalSignificance: "Диагностика гипертонии", increasedMeaning: "Реноваскулярная гипертония", decreasedMeaning: "Гиперальдостеронизм", relatedConditions: ["Гипертония"], synonyms: ["RENIN"] },

      // Иммунограмма (IMMUNO) - 6 показателей
      { name: "CD3+ (Т-лимфоциты)", nameEn: "CD3+", code: "CD3", shortName: "CD3", unit: "%", studyTypeCode: "IMMUNO", description: "Общие Т-лимфоциты", clinicalSignificance: "Оценка клеточного иммунитета", increasedMeaning: "Аутоиммунные заболевания", decreasedMeaning: "Иммунодефицит", relatedConditions: ["Иммунодефицит"], synonyms: ["CD3"] },
      { name: "CD4+ (Т-хелперы)", nameEn: "CD4+", code: "CD4", shortName: "CD4", unit: "%", studyTypeCode: "IMMUNO", description: "Т-хелперы", clinicalSignificance: "Оценка иммунного статуса", increasedMeaning: "Аутоиммунные заболевания", decreasedMeaning: "ВИЧ-инфекция, иммунодефицит", relatedConditions: ["ВИЧ", "Иммунодефицит"], synonyms: ["CD4"] },
      { name: "CD8+ (Т-супрессоры)", nameEn: "CD8+", code: "CD8", shortName: "CD8", unit: "%", studyTypeCode: "IMMUNO", description: "Т-супрессоры", clinicalSignificance: "Оценка иммунного статуса", increasedMeaning: "Вирусные инфекции", decreasedMeaning: "Иммунодефицит", relatedConditions: ["Инфекции"], synonyms: ["CD8"] },
      { name: "CD19+ (В-лимфоциты)", nameEn: "CD19+", code: "CD19", shortName: "CD19", unit: "%", studyTypeCode: "IMMUNO", description: "В-лимфоциты", clinicalSignificance: "Оценка гуморального иммунитета", increasedMeaning: "Аутоиммунные заболевания", decreasedMeaning: "Иммунодефицит", relatedConditions: ["Иммунодефицит"], synonyms: ["CD19"] },
      { name: "IgG", nameEn: "Immunoglobulin G", code: "IGG", shortName: "IgG", unit: "г/л", studyTypeCode: "IMMUNO", description: "Иммуноглобулин G", clinicalSignificance: "Основной класс антител", increasedMeaning: "Хронические инфекции, аутоиммунные заболевания", decreasedMeaning: "Иммунодефицит", relatedConditions: ["Иммунодефицит"], synonyms: ["IgG"] },
      { name: "IgM", nameEn: "Immunoglobulin M", code: "IGM", shortName: "IgM", unit: "г/л", studyTypeCode: "IMMUNO", description: "Иммуноглобулин M", clinicalSignificance: "Маркер острой инфекции", increasedMeaning: "Острые инфекции", decreasedMeaning: "Иммунодефицит", relatedConditions: ["Инфекции"], synonyms: ["IgM"] },

      // Аллергологические тесты (ALLERGY) - 3 показателя
      { name: "IgE общий", nameEn: "Total IgE", code: "IGE", shortName: "IgE", unit: "МЕ/мл", studyTypeCode: "ALLERGY", description: "Общий иммуноглобулин E", clinicalSignificance: "Диагностика аллергий", increasedMeaning: "Аллергические заболевания, паразитозы", decreasedMeaning: "Норма", relatedConditions: ["Аллергия", "Бронхиальная астма"], synonyms: ["IgE"] },
      { name: "Эозинофильный катионный белок", nameEn: "ECP", code: "ECP", shortName: "ECP", unit: "мкг/л", studyTypeCode: "ALLERGY", description: "Маркер активации эозинофилов", clinicalSignificance: "Оценка активности аллергии", increasedMeaning: "Активная аллергия, бронхиальная астма", decreasedMeaning: "Норма", relatedConditions: ["Аллергия", "Астма"], synonyms: ["ECP"] },
      { name: "Триптаза", nameEn: "Tryptase", code: "TRYP", shortName: "Трипт", unit: "мкг/л", studyTypeCode: "ALLERGY", description: "Маркер активации тучных клеток", clinicalSignificance: "Диагностика анафилаксии", increasedMeaning: "Анафилаксия, мастоцитоз", decreasedMeaning: "Норма", relatedConditions: ["Анафилаксия"], synonyms: ["TRYP"] },

      // Онкомаркеры (TUMOR) - 10 показателей
      { name: "ПСА общий", nameEn: "PSA Total", code: "PSA", shortName: "ПСА", unit: "нг/мл", studyTypeCode: "TUMOR", description: "Простат-специфический антиген", clinicalSignificance: "Скрининг рака простаты", increasedMeaning: "Рак простаты, простатит, ДГПЖ", decreasedMeaning: "Норма", relatedConditions: ["Рак простаты", "ДГПЖ"], synonyms: ["PSA", "ПСА"] },
      { name: "СА 125", nameEn: "CA 125", code: "CA125", shortName: "СА125", unit: "Ед/мл", studyTypeCode: "TUMOR", description: "Онкомаркер яичников", clinicalSignificance: "Скрининг рака яичников", increasedMeaning: "Рак яичников, эндометриоз", decreasedMeaning: "Норма", relatedConditions: ["Рак яичников"], synonyms: ["CA125"] },
      { name: "СА 15-3", nameEn: "CA 15-3", code: "CA153", shortName: "СА15-3", unit: "Ед/мл", studyTypeCode: "TUMOR", description: "Онкомаркер молочной железы", clinicalSignificance: "Мониторинг рака молочной железы", increasedMeaning: "Рак молочной железы", decreasedMeaning: "Норма", relatedConditions: ["Рак молочной железы"], synonyms: ["CA153"] },
      { name: "СА 19-9", nameEn: "CA 19-9", code: "CA199", shortName: "СА19-9", unit: "Ед/мл", studyTypeCode: "TUMOR", description: "Онкомаркер поджелудочной железы", clinicalSignificance: "Мониторинг рака поджелудочной", increasedMeaning: "Рак поджелудочной, желчевыводящих путей", decreasedMeaning: "Норма", relatedConditions: ["Рак поджелудочной"], synonyms: ["CA199"] },
      { name: "РЭА", nameEn: "CEA", code: "CEA", shortName: "РЭА", unit: "нг/мл", studyTypeCode: "TUMOR", description: "Раково-эмбриональный антиген", clinicalSignificance: "Мониторинг колоректального рака", increasedMeaning: "Рак толстой кишки, курение", decreasedMeaning: "Норма", relatedConditions: ["Рак толстой кишки"], synonyms: ["CEA", "РЭА"] },
      { name: "АФП", nameEn: "AFP", code: "AFP", shortName: "АФП", unit: "МЕ/мл", studyTypeCode: "TUMOR", description: "Альфа-фетопротеин", clinicalSignificance: "Диагностика рака печени", increasedMeaning: "Рак печени, герминогенные опухоли", decreasedMeaning: "Норма", relatedConditions: ["Рак печени"], synonyms: ["AFP", "АФП"] },
      { name: "Бета-ХГЧ", nameEn: "Beta-hCG", code: "HCG", shortName: "ХГЧ", unit: "мМЕ/мл", studyTypeCode: "TUMOR", description: "Хорионический гонадотропин", clinicalSignificance: "Диагностика беременности и трофобластических опухолей", increasedMeaning: "Беременность, трофобластические опухоли", decreasedMeaning: "Норма", relatedConditions: ["Беременность", "Опухоли"], synonyms: ["HCG", "ХГЧ"] },
      { name: "Кальцитонин", nameEn: "Calcitonin", code: "CALC", shortName: "Кальц", unit: "пг/мл", studyTypeCode: "TUMOR", description: "Гормон щитовидной железы", clinicalSignificance: "Диагностика медуллярного рака ЩЖ", increasedMeaning: "Медуллярный рак щитовидной железы", decreasedMeaning: "Норма", relatedConditions: ["Рак щитовидной железы"], synonyms: ["CALC"] },
      { name: "Хромогранин А", nameEn: "Chromogranin A", code: "CGA", shortName: "ХгА", unit: "нг/мл", studyTypeCode: "TUMOR", description: "Маркер нейроэндокринных опухолей", clinicalSignificance: "Диагностика нейроэндокринных опухолей", increasedMeaning: "Нейроэндокринные опухоли", decreasedMeaning: "Норма", relatedConditions: ["Нейроэндокринные опухоли"], synonyms: ["CGA"] },
      { name: "NSE", nameEn: "NSE", code: "NSE", shortName: "NSE", unit: "нг/мл", studyTypeCode: "TUMOR", description: "Нейрон-специфическая енолаза", clinicalSignificance: "Маркер мелкоклеточного рака легкого", increasedMeaning: "Мелкоклеточный рак легкого, нейробластома", decreasedMeaning: "Норма", relatedConditions: ["Рак легкого"], synonyms: ["NSE"] },

      // Посев на микрофлору (CULTURE) - 2 показателя
      { name: "Выделенный микроорганизм", nameEn: "Isolated Microorganism", code: "MICRO", shortName: "Микроорг", unit: "КОЕ/мл", studyTypeCode: "CULTURE", description: "Идентифицированный микроорганизм", clinicalSignificance: "Диагностика инфекций", increasedMeaning: "Инфекция", decreasedMeaning: "Норма", relatedConditions: ["Инфекции"], synonyms: ["MICRO"] },
      { name: "Чувствительность к антибиотикам", nameEn: "Antibiotic Sensitivity", code: "SENS", shortName: "Чувств", unit: "мм", studyTypeCode: "CULTURE", description: "Чувствительность к антибиотикам", clinicalSignificance: "Подбор антибиотикотерапии", increasedMeaning: "Чувствительность", decreasedMeaning: "Резистентность", relatedConditions: ["Инфекции"], synonyms: ["SENS"] },

      // Серологические исследования (SERO) - 8 показателей
      { name: "Anti-HCV", nameEn: "Anti-HCV", code: "HCV", shortName: "Anti-HCV", unit: "S/CO", studyTypeCode: "SERO", description: "Антитела к вирусу гепатита C", clinicalSignificance: "Диагностика гепатита C", increasedMeaning: "Гепатит C", decreasedMeaning: "Норма", relatedConditions: ["Гепатит C"], synonyms: ["HCV"] },
      { name: "HBsAg", nameEn: "HBsAg", code: "HBSAG", shortName: "HBsAg", unit: "S/CO", studyTypeCode: "SERO", description: "Поверхностный антиген гепатита B", clinicalSignificance: "Диагностика гепатита B", increasedMeaning: "Гепатит B", decreasedMeaning: "Норма", relatedConditions: ["Гепатит B"], synonyms: ["HBSAG"] },
      { name: "Anti-HIV", nameEn: "Anti-HIV", code: "HIV", shortName: "Anti-HIV", unit: "S/CO", studyTypeCode: "SERO", description: "Антитела к ВИЧ", clinicalSignificance: "Диагностика ВИЧ-инфекции", increasedMeaning: "ВИЧ-инфекция", decreasedMeaning: "Норма", relatedConditions: ["ВИЧ"], synonyms: ["HIV"] },
      { name: "RPR (сифилис)", nameEn: "RPR", code: "RPR", shortName: "RPR", unit: "титр", studyTypeCode: "SERO", description: "Быстрый плазмареагиновый тест", clinicalSignificance: "Скрининг сифилиса", increasedMeaning: "Сифилис", decreasedMeaning: "Норма", relatedConditions: ["Сифилис"], synonyms: ["RPR"] },
      { name: "Anti-Toxoplasma IgG", nameEn: "Anti-Toxoplasma IgG", code: "TOXO_G", shortName: "Токсо IgG", unit: "МЕ/мл", studyTypeCode: "SERO", description: "Антитела IgG к токсоплазме", clinicalSignificance: "Диагностика токсоплазмоза", increasedMeaning: "Перенесенный токсоплазмоз", decreasedMeaning: "Отсутствие иммунитета", relatedConditions: ["Токсоплазмоз"], synonyms: ["TOXO_G"] },
      { name: "Anti-Rubella IgG", nameEn: "Anti-Rubella IgG", code: "RUB_G", shortName: "Краснуха IgG", unit: "МЕ/мл", studyTypeCode: "SERO", description: "Антитела IgG к краснухе", clinicalSignificance: "Оценка иммунитета к краснухе", increasedMeaning: "Иммунитет к краснухе", decreasedMeaning: "Отсутствие иммунитета", relatedConditions: ["Краснуха"], synonyms: ["RUB_G"] },
      { name: "Anti-CMV IgG", nameEn: "Anti-CMV IgG", code: "CMV_G", shortName: "ЦМВ IgG", unit: "Ед/мл", studyTypeCode: "SERO", description: "Антитела IgG к цитомегаловирусу", clinicalSignificance: "Диагностика ЦМВ-инфекции", increasedMeaning: "Перенесенная ЦМВ-инфекция", decreasedMeaning: "Отсутствие иммунитета", relatedConditions: ["ЦМВ-инфекция"], synonyms: ["CMV_G"] },
      { name: "Anti-HSV IgG", nameEn: "Anti-HSV IgG", code: "HSV_G", shortName: "ВПГ IgG", unit: "Ед/мл", studyTypeCode: "SERO", description: "Антитела IgG к вирусу простого герпеса", clinicalSignificance: "Диагностика герпеса", increasedMeaning: "Перенесенная герпетическая инфекция", decreasedMeaning: "Отсутствие иммунитета", relatedConditions: ["Герпес"], synonyms: ["HSV_G"] },

      // Микроэлементы (TRACE) - 5 показателей
      { name: "Цинк", nameEn: "Zinc", code: "ZN", shortName: "Zn", unit: "мкмоль/л", studyTypeCode: "TRACE", description: "Микроэлемент цинк", clinicalSignificance: "Оценка статуса цинка", increasedMeaning: "Избыток цинка", decreasedMeaning: "Дефицит цинка", relatedConditions: ["Дефицит цинка"], synonyms: ["ZN", "Цинк"] },
      { name: "Медь", nameEn: "Copper", code: "CU", shortName: "Cu", unit: "мкмоль/л", studyTypeCode: "TRACE", description: "Микроэлемент медь", clinicalSignificance: "Оценка статуса меди", increasedMeaning: "Болезнь Вильсона", decreasedMeaning: "Дефицит меди", relatedConditions: ["Болезнь Вильсона"], synonyms: ["CU", "Медь"] },
      { name: "Селен", nameEn: "Selenium", code: "SE", shortName: "Se", unit: "мкмоль/л", studyTypeCode: "TRACE", description: "Микроэлемент селен", clinicalSignificance: "Оценка статуса селена", increasedMeaning: "Избыток селена", decreasedMeaning: "Дефицит селена", relatedConditions: ["Дефицит селена"], synonyms: ["SE", "Селен"] },
      { name: "Йод", nameEn: "Iodine", code: "I", shortName: "I", unit: "мкг/л", studyTypeCode: "TRACE", description: "Микроэлемент йод", clinicalSignificance: "Оценка статуса йода", increasedMeaning: "Избыток йода", decreasedMeaning: "Дефицит йода, гипотиреоз", relatedConditions: ["Гипотиреоз"], synonyms: ["I", "Йод"] },
      { name: "Хром", nameEn: "Chromium", code: "CR", shortName: "Cr", unit: "нмоль/л", studyTypeCode: "TRACE", description: "Микроэлемент хром", clinicalSignificance: "Оценка углеводного обмена", increasedMeaning: "Избыток хрома", decreasedMeaning: "Дефицит хрома, диабет", relatedConditions: ["Диабет"], synonyms: ["CR", "Хром"] }
    ];

    console.log(`📊 Будет создано/обновлено показателей: ${remainingIndicators.length}`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const indicator of remainingIndicators) {
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
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`\n📋 Итоговое распределение показателей:`);
    let totalIndicators = 0;
    studyTypesWithIndicators.forEach(st => {
      console.log(`   ${st.name}: ${st.indicators.length} показателей`);
      totalIndicators += st.indicators.length;
    });
    console.log(`\n📊 ВСЕГО показателей: ${totalIndicators}`);

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
