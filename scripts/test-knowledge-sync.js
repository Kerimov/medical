const { MedicalSourcesManager } = require('../lib/medical-sources/index.ts');

async function testKnowledgeSync() {
  console.log('🧪 Тестирование системы синхронизации знаний...');
  
  const manager = new MedicalSourcesManager();
  
  try {
    // Тест 1: Получение доступных источников
    console.log('\n📚 Тест 1: Получение источников');
    const sources = manager.getAvailableSources();
    console.log(`Найдено источников: ${sources.length}`);
    sources.forEach(source => {
      console.log(`- ${source.name} (${source.type}): ${source.description}`);
    });
    
    // Тест 2: Поиск знаний
    console.log('\n🔍 Тест 2: Поиск знаний');
    const query = 'общий анализ крови гемоглобин';
    console.log(`Запрос: "${query}"`);
    
    const results = await manager.searchKnowledge(query, ['uptodate', 'pubmed']);
    console.log(`Найдено результатов: ${results.length}`);
    
    results.forEach((result, index) => {
      console.log(`\nРезультат ${index + 1}:`);
      console.log(`- Источник: ${result.sources.primary.name}`);
      if (result.studyType) {
        console.log(`- Тип исследования: ${result.studyType.name}`);
      }
      if (result.indicators) {
        console.log(`- Показателей: ${result.indicators.length}`);
        result.indicators.forEach(indicator => {
          console.log(`  * ${indicator.name} (${indicator.unit})`);
        });
      }
      if (result.referenceRanges) {
        console.log(`- Референсных диапазонов: ${result.referenceRanges.length}`);
      }
    });
    
    console.log('\n✅ Тестирование завершено успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  }
}

// Запуск теста
testKnowledgeSync();
