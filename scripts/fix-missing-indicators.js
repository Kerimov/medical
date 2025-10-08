const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Исправление пропущенных показателей...');

  try {
    // Находим типы исследований
    const lipidProfile = await prisma.studyType.findFirst({
      where: { name: 'Липидный профиль' }
    });

    const biochemistry = await prisma.studyType.findFirst({
      where: { name: 'Биохимический анализ крови' }
    });

    if (!lipidProfile || !biochemistry) {
      console.log('❌ Не найдены типы исследований');
      return;
    }

    // Добавляем Общий холестерин в Липидный профиль
    const totalCholesterol = await prisma.indicator.findFirst({
      where: { name: 'Общий холестерин' }
    });

    if (totalCholesterol) {
      await prisma.indicator.update({
        where: { id: totalCholesterol.id },
        data: { studyTypeId: lipidProfile.id }
      });
      console.log('✅ Общий холестерин добавлен в Липидный профиль');
    } else {
      // Создаем если не существует
      await prisma.indicator.create({
        data: {
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
          studyTypeId: lipidProfile.id,
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
        }
      });
      console.log('✅ Создан Общий холестерин в Липидном профиле');
    }

    // Добавляем Общий билирубин в Биохимический анализ
    const totalBilirubin = await prisma.indicator.findFirst({
      where: { name: 'Общий билирубин' }
    });

    if (totalBilirubin) {
      await prisma.indicator.update({
        where: { id: totalBilirubin.id },
        data: { studyTypeId: biochemistry.id }
      });
      console.log('✅ Общий билирубин добавлен в Биохимический анализ');
    } else {
      // Создаем если не существует
      await prisma.indicator.create({
        data: {
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
          studyTypeId: biochemistry.id,
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
        }
      });
      console.log('✅ Создан Общий билирубин в Биохимическом анализе');
    }

    // Добавляем недостающие референсные диапазоны для Общего холестерина
    const totalCholIndicator = await prisma.indicator.findFirst({
      where: { name: 'Общий холестерин' }
    });

    if (totalCholIndicator) {
      const methodologies = await prisma.methodology.findMany({
        where: {
          name: {
            in: ['Стандарты Минздрава РФ', 'Американские стандарты (CDC/NIH)', 'Европейские стандарты (ESC/EASL)']
          }
        }
      });

      const cholesterolRanges = [
        {
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
        }
      ];

      for (const range of cholesterolRanges) {
        const methodology = methodologies.find(meth => meth.name === range.methodologyName);
        if (methodology) {
          const existing = await prisma.referenceRange.findFirst({
            where: {
              indicatorId: totalCholIndicator.id,
              methodologyId: methodology.id,
              gender: range.gender,
              ageGroupMin: range.ageGroupMin,
              ageGroupMax: range.ageGroupMax
            }
          });

          if (!existing) {
            await prisma.referenceRange.create({
              data: {
                indicatorId: totalCholIndicator.id,
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
              }
            });
            console.log(`✅ Референсный диапазон для Общего холестерина (${range.methodologyName})`);
          }
        }
      }
    }

    console.log('🎉 Исправления завершены успешно!');

  } catch (error) {
    console.error('❌ Ошибка при исправлении:', error);
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
