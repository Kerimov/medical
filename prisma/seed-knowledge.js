const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Заполнение базы знаний медицинскими данными...');

  // Создание методологий
  console.log('📚 Создание методологий...');
  
  const minzdrav = await prisma.methodology.create({
    data: {
      name: 'Стандарты Минздрава РФ',
      type: 'MINZDRAV_RF',
      description: 'Официальные нормативы Министерства здравоохранения Российской Федерации',
      organization: 'Минздрав РФ',
      country: 'Россия',
      version: '2024',
      source: 'https://www.rosminzdrav.ru',
      isActive: true
    }
  });

  const usStandards = await prisma.methodology.create({
    data: {
      name: 'Американские стандарты',
      type: 'US_STANDARDS',
      description: 'Стандарты CDC и NIH (США)',
      organization: 'CDC, NIH',
      country: 'США',
      version: '2024',
      source: 'https://www.cdc.gov',
      isActive: true
    }
  });

  const euStandards = await prisma.methodology.create({
    data: {
      name: 'Европейские стандарты',
      type: 'EU_STANDARDS',
      description: 'Стандарты ESC и EASL (Европа)',
      organization: 'ESC, EASL',
      country: 'Европа',
      version: '2024',
      source: 'https://www.escardio.org',
      isActive: true
    }
  });

  console.log('✅ Методологии созданы');

  // Создание типа исследования: Общий анализ крови
  console.log('🩸 Создание типов исследований...');
  
  const bloodTest = await prisma.studyType.create({
    data: {
      name: 'Общий анализ крови',
      nameEn: 'Complete Blood Count (CBC)',
      code: 'CBC-001',
      category: 'Гематология',
      description: 'Основное лабораторное исследование, позволяющее оценить количество и качественные характеристики форменных элементов крови: эритроцитов, лейкоцитов, тромбоцитов.',
      clinicalSignificance: 'Используется для диагностики анемии, воспалительных процессов, инфекций, заболеваний крови и оценки общего состояния здоровья.',
      preparation: 'Сдается натощак, желательно утром. Последний прием пищи за 8-12 часов до анализа. Можно пить воду.',
      biomaterial: 'Венозная кровь',
      isActive: true
    }
  });

  // Показатели для общего анализа крови
  const hemoglobin = await prisma.indicator.create({
    data: {
      studyTypeId: bloodTest.id,
      name: 'Гемоглобин',
      nameEn: 'Hemoglobin',
      code: 'HGB',
      shortName: 'HGB',
      unit: 'г/л',
      description: 'Белок эритроцитов, переносящий кислород от легких к тканям и углекислый газ обратно.',
      clinicalSignificance: 'Основной показатель для диагностики анемии и оценки кислородотransporting способности крови.',
      increasedMeaning: 'Полицитемия, обезвоживание, пребывание на большой высоте, курение, заболевания легких.',
      decreasedMeaning: 'Анемия различного происхождения, кровопотеря, заболевания костного мозга, недостаток железа, витамина B12 или фолиевой кислоты.',
      synonyms: JSON.stringify(['Hb', 'HGB', 'Гемоглобин']),
      isActive: true
    }
  });

  // Нормативы для гемоглобина
  await prisma.referenceRange.createMany({
    data: [
      // Минздрав РФ
      {
        indicatorId: hemoglobin.id,
        methodologyId: minzdrav.id,
        gender: 'male',
        ageGroupMin: 18,
        ageGroupMax: 65,
        minValue: 130,
        maxValue: 170,
        optimalMin: 140,
        optimalMax: 160,
        criticalLow: 80,
        criticalHigh: 200,
        note: 'Для мужчин 18-65 лет',
        isActive: true
      },
      {
        indicatorId: hemoglobin.id,
        methodologyId: minzdrav.id,
        gender: 'female',
        ageGroupMin: 18,
        ageGroupMax: 65,
        minValue: 120,
        maxValue: 150,
        optimalMin: 125,
        optimalMax: 145,
        criticalLow: 70,
        criticalHigh: 180,
        note: 'Для женщин 18-65 лет',
        isActive: true
      },
      // Американские стандарты
      {
        indicatorId: hemoglobin.id,
        methodologyId: usStandards.id,
        gender: 'male',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 135,
        maxValue: 175,
        optimalMin: 140,
        optimalMax: 170,
        criticalLow: 85,
        criticalHigh: 195,
        note: 'CDC standards for adult males',
        isActive: true
      },
      {
        indicatorId: hemoglobin.id,
        methodologyId: usStandards.id,
        gender: 'female',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 120,
        maxValue: 155,
        optimalMin: 125,
        optimalMax: 150,
        criticalLow: 75,
        criticalHigh: 175,
        note: 'CDC standards for adult females',
        isActive: true
      },
      // Европейские стандарты
      {
        indicatorId: hemoglobin.id,
        methodologyId: euStandards.id,
        gender: 'male',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 130,
        maxValue: 180,
        optimalMin: 140,
        optimalMax: 170,
        note: 'ESC guidelines for adult males',
        isActive: true
      },
      {
        indicatorId: hemoglobin.id,
        methodologyId: euStandards.id,
        gender: 'female',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 115,
        maxValue: 160,
        optimalMin: 120,
        optimalMax: 150,
        note: 'ESC guidelines for adult females',
        isActive: true
      }
    ]
  });

  // Эритроциты
  const erythrocytes = await prisma.indicator.create({
    data: {
      studyTypeId: bloodTest.id,
      name: 'Эритроциты',
      nameEn: 'Red Blood Cells',
      code: 'RBC',
      shortName: 'RBC',
      unit: '×10¹²/л',
      description: 'Красные кровяные клетки, содержащие гемоглобин и переносящие кислород.',
      clinicalSignificance: 'Используется для диагностики анемий, полицитемии и других заболеваний крови.',
      increasedMeaning: 'Полицитемия, обезвоживание, гипоксия, курение.',
      decreasedMeaning: 'Анемия, кровопотеря, гемолиз, заболевания костного мозга.',
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: erythrocytes.id,
        methodologyId: minzdrav.id,
        gender: 'male',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 4.0,
        maxValue: 5.5,
        optimalMin: 4.5,
        optimalMax: 5.0,
        isActive: true
      },
      {
        indicatorId: erythrocytes.id,
        methodologyId: minzdrav.id,
        gender: 'female',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 3.5,
        maxValue: 5.0,
        optimalMin: 4.0,
        optimalMax: 4.7,
        isActive: true
      }
    ]
  });

  // Лейкоциты
  const leukocytes = await prisma.indicator.create({
    data: {
      studyTypeId: bloodTest.id,
      name: 'Лейкоциты',
      nameEn: 'White Blood Cells',
      code: 'WBC',
      shortName: 'WBC',
      unit: '×10⁹/л',
      description: 'Белые кровяные клетки, обеспечивающие иммунную защиту организма.',
      clinicalSignificance: 'Важнейший показатель иммунной системы, используется для диагностики инфекций, воспалений и заболеваний крови.',
      increasedMeaning: 'Инфекции, воспаление, лейкоз, стресс, физическая нагрузка.',
      decreasedMeaning: 'Вирусные инфекции, иммунодефициты, воздействие радиации, аутоиммунные заболевания.',
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: leukocytes.id,
        methodologyId: minzdrav.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 4.0,
        maxValue: 9.0,
        optimalMin: 5.0,
        optimalMax: 8.0,
        criticalLow: 2.0,
        criticalHigh: 25.0,
        isActive: true
      },
      {
        indicatorId: leukocytes.id,
        methodologyId: usStandards.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 4.5,
        maxValue: 11.0,
        criticalLow: 2.5,
        criticalHigh: 30.0,
        isActive: true
      }
    ]
  });

  // Тромбоциты
  const platelets = await prisma.indicator.create({
    data: {
      studyTypeId: bloodTest.id,
      name: 'Тромбоциты',
      nameEn: 'Platelets',
      code: 'PLT',
      shortName: 'PLT',
      unit: '×10⁹/л',
      description: 'Кровяные пластинки, участвующие в свертывании крови.',
      clinicalSignificance: 'Оценка состояния системы гемостаза, риска кровотечений и тромбозов.',
      increasedMeaning: 'Тромбоцитоз, миелопролиферативные заболевания, воспаление, после операций.',
      decreasedMeaning: 'Тромбоцитопения, аутоиммунные заболевания, лейкоз, прием некоторых лекарств.',
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: platelets.id,
        methodologyId: minzdrav.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 150,
        maxValue: 400,
        optimalMin: 180,
        optimalMax: 350,
        criticalLow: 50,
        criticalHigh: 1000,
        isActive: true
      }
    ]
  });

  console.log('✅ Общий анализ крови создан');

  // Создание типа исследования: Биохимический анализ крови
  const biochemistry = await prisma.studyType.create({
    data: {
      name: 'Биохимический анализ крови',
      nameEn: 'Blood Chemistry Panel',
      code: 'BIO-001',
      category: 'Биохимия',
      description: 'Комплексное исследование, позволяющее оценить функциональное состояние органов и систем организма.',
      clinicalSignificance: 'Диагностика заболеваний печени, почек, поджелудочной железы, сердца, оценка обмена веществ.',
      preparation: 'Строго натощак! Последний прием пищи за 12 часов до анализа. Исключить алкоголь за 24 часа.',
      biomaterial: 'Венозная кровь',
      isActive: true
    }
  });

  // Глюкоза
  const glucose = await prisma.indicator.create({
    data: {
      studyTypeId: biochemistry.id,
      name: 'Глюкоза',
      nameEn: 'Glucose',
      code: 'GLU',
      shortName: 'Глюкоза',
      unit: 'ммоль/л',
      description: 'Основной источник энергии для клеток организма.',
      clinicalSignificance: 'Диагностика сахарного диабета, преддиабета, гипогликемии.',
      increasedMeaning: 'Сахарный диабет, стресс, панкреатит, прием кортикостероидов, акромегалия.',
      decreasedMeaning: 'Гипогликемия, инсулинома, недостаточность надпочечников, длительное голодание.',
      synonyms: JSON.stringify(['Сахар крови', 'Blood Sugar', 'GLU']),
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: glucose.id,
        methodologyId: minzdrav.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 3.3,
        maxValue: 5.5,
        optimalMin: 4.0,
        optimalMax: 5.0,
        criticalLow: 2.2,
        criticalHigh: 15.0,
        note: 'Натощак',
        isActive: true
      },
      {
        indicatorId: glucose.id,
        methodologyId: usStandards.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 3.9,
        maxValue: 6.1,
        optimalMin: 4.0,
        optimalMax: 5.6,
        criticalLow: 2.5,
        criticalHigh: 20.0,
        note: 'Fasting glucose - ADA standards',
        isActive: true
      }
    ]
  });

  // Холестерин
  const cholesterol = await prisma.indicator.create({
    data: {
      studyTypeId: biochemistry.id,
      name: 'Холестерин общий',
      nameEn: 'Total Cholesterol',
      code: 'CHOL',
      shortName: 'ХС',
      unit: 'ммоль/л',
      description: 'Жироподобное вещество, необходимое для построения клеточных мембран и синтеза гормонов.',
      clinicalSignificance: 'Оценка риска атеросклероза и сердечно-сосудистых заболеваний.',
      increasedMeaning: 'Атеросклероз, ожирение, гипотиреоз, сахарный диабет, заболевания печени.',
      decreasedMeaning: 'Гипертиреоз, голодание, тяжелые заболевания печени, анемия.',
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: cholesterol.id,
        methodologyId: minzdrav.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 3.0,
        maxValue: 5.2,
        optimalMin: 3.5,
        optimalMax: 5.0,
        criticalHigh: 7.8,
        note: 'Оптимальный уровень для профилактики ССЗ',
        isActive: true
      },
      {
        indicatorId: cholesterol.id,
        methodologyId: usStandards.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 0,
        maxValue: 5.17,
        optimalMin: 3.0,
        optimalMax: 5.0,
        note: 'AHA/ACC guidelines - desirable level',
        isActive: true
      },
      {
        indicatorId: cholesterol.id,
        methodologyId: euStandards.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 0,
        maxValue: 5.0,
        optimalMin: 3.0,
        optimalMax: 4.5,
        note: 'ESC guidelines',
        isActive: true
      }
    ]
  });

  // Креатинин
  const creatinine = await prisma.indicator.create({
    data: {
      studyTypeId: biochemistry.id,
      name: 'Креатинин',
      nameEn: 'Creatinine',
      code: 'CREA',
      shortName: 'Креат',
      unit: 'мкмоль/л',
      description: 'Продукт распада креатина, выделяющийся почками.',
      clinicalSignificance: 'Основной показатель функции почек.',
      increasedMeaning: 'Почечная недостаточность, обезвоживание, акромегалия, гипертиреоз.',
      decreasedMeaning: 'Снижение мышечной массы, беременность, голодание.',
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: creatinine.id,
        methodologyId: minzdrav.id,
        gender: 'male',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 62,
        maxValue: 115,
        optimalMin: 70,
        optimalMax: 100,
        criticalHigh: 500,
        isActive: true
      },
      {
        indicatorId: creatinine.id,
        methodologyId: minzdrav.id,
        gender: 'female',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 53,
        maxValue: 97,
        optimalMin: 60,
        optimalMax: 90,
        criticalHigh: 450,
        isActive: true
      }
    ]
  });

  // АЛТ
  const alt = await prisma.indicator.create({
    data: {
      studyTypeId: biochemistry.id,
      name: 'Аланинаминотрансфераза',
      nameEn: 'Alanine Aminotransferase',
      code: 'ALT',
      shortName: 'АЛТ',
      unit: 'Ед/л',
      description: 'Фермент печени, показатель ее функционального состояния.',
      clinicalSignificance: 'Диагностика заболеваний печени и желчевыводящих путей.',
      increasedMeaning: 'Гепатит, цирроз, токсическое поражение печени, инфаркт миокарда.',
      decreasedMeaning: 'Тяжелый некроз печени, дефицит витамина B6.',
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: alt.id,
        methodologyId: minzdrav.id,
        gender: 'male',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 0,
        maxValue: 41,
        optimalMin: 10,
        optimalMax: 35,
        isActive: true
      },
      {
        indicatorId: alt.id,
        methodologyId: minzdrav.id,
        gender: 'female',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 0,
        maxValue: 31,
        optimalMin: 10,
        optimalMax: 28,
        isActive: true
      }
    ]
  });

  // АСТ
  const ast = await prisma.indicator.create({
    data: {
      studyTypeId: biochemistry.id,
      name: 'Аспартатаминотрансфераза',
      nameEn: 'Aspartate Aminotransferase',
      code: 'AST',
      shortName: 'АСТ',
      unit: 'Ед/л',
      description: 'Фермент, содержащийся в клетках печени и сердца.',
      clinicalSignificance: 'Диагностика заболеваний печени и миокарда.',
      increasedMeaning: 'Инфаркт миокарда, гепатит, цирроз, повреждение мышц.',
      decreasedMeaning: 'Тяжелый некроз печени.',
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: ast.id,
        methodologyId: minzdrav.id,
        gender: 'male',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 0,
        maxValue: 37,
        optimalMin: 10,
        optimalMax: 33,
        isActive: true
      },
      {
        indicatorId: ast.id,
        methodologyId: minzdrav.id,
        gender: 'female',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 0,
        maxValue: 31,
        optimalMin: 10,
        optimalMax: 28,
        isActive: true
      }
    ]
  });

  console.log('✅ Биохимический анализ крови создан');

  // Гормоны щитовидной железы
  const thyroid = await prisma.studyType.create({
    data: {
      name: 'Гормоны щитовидной железы',
      nameEn: 'Thyroid Hormones',
      code: 'THY-001',
      category: 'Эндокринология',
      description: 'Исследование гормонов щитовидной железы для оценки ее функции.',
      clinicalSignificance: 'Диагностика гипер- и гипотиреоза, заболеваний щитовидной железы.',
      preparation: 'Утром натощак. За 2-3 дня до анализа исключить прием йодсодержащих препаратов.',
      biomaterial: 'Венозная кровь',
      isActive: true
    }
  });

  const tsh = await prisma.indicator.create({
    data: {
      studyTypeId: thyroid.id,
      name: 'Тиреотропный гормон',
      nameEn: 'Thyroid Stimulating Hormone',
      code: 'TSH',
      shortName: 'ТТГ',
      unit: 'мМЕ/л',
      description: 'Гормон гипофиза, регулирующий функцию щитовидной железы.',
      clinicalSignificance: 'Основной маркер функции щитовидной железы.',
      increasedMeaning: 'Гипотиреоз, тиреоидит Хашимото, опухоль гипофиза.',
      decreasedMeaning: 'Гипертиреоз, диффузный токсический зоб, аденома щитовидной железы.',
      isActive: true
    }
  });

  await prisma.referenceRange.createMany({
    data: [
      {
        indicatorId: tsh.id,
        methodologyId: minzdrav.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 0.4,
        maxValue: 4.0,
        optimalMin: 0.5,
        optimalMax: 2.5,
        criticalHigh: 10.0,
        isActive: true
      },
      {
        indicatorId: tsh.id,
        methodologyId: usStandards.id,
        gender: 'all',
        ageGroupMin: 18,
        ageGroupMax: null,
        minValue: 0.5,
        maxValue: 5.0,
        optimalMin: 0.5,
        optimalMax: 2.5,
        note: 'ATA guidelines',
        isActive: true
      }
    ]
  });

  console.log('✅ Гормоны щитовидной железы созданы');

  console.log('🎉 База знаний успешно заполнена!');
  console.log('📊 Создано:');
  console.log(`   - 3 методологии (Минздрав РФ, США, Европа)`);
  console.log(`   - 3 типа исследований`);
  console.log(`   - 11 показателей`);
  console.log(`   - ${await prisma.referenceRange.count()} нормативных диапазонов`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы знаний:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
