import OpenAI from 'openai';

// Конфигурация OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Интерфейсы для медицинских данных
export interface MedicalSource {
  name: string;
  url: string;
  description: string;
  type: 'api' | 'web' | 'database';
  apiKey?: string;
  endpoints?: {
    search: string;
    details: string;
    references: string;
  };
}

export interface ExtractedKnowledge {
  studyType?: {
    name: string;
    nameEn?: string;
    code?: string;
    category: string;
    description?: string;
    clinicalSignificance?: string;
    preparation?: string;
    biomaterial?: string;
  };
  indicators?: Array<{
    name: string;
    nameEn?: string;
    code?: string;
    shortName?: string;
    unit: string;
    description?: string;
    clinicalSignificance?: string;
    increasedMeaning?: string;
    decreasedMeaning?: string;
    relatedConditions?: string[];
    synonyms?: string[];
  }>;
  referenceRanges?: Array<{
    methodology: string;
    ageGroupMin?: number;
    ageGroupMax?: number;
    gender?: string;
    minValue?: number;
    maxValue?: number;
    optimalMin?: number;
    optimalMax?: number;
    criticalLow?: number;
    criticalHigh?: number;
    note?: string;
  }>;
  sources: {
    primary: MedicalSource;
    references: MedicalSource[];
    lastChecked: string;
  };
}

// Конфигурация медицинских источников
export const MEDICAL_SOURCES: Record<string, MedicalSource> = {
  uptodate: {
    name: 'UpToDate',
    url: 'https://www.uptodate.com/',
    description: 'Evidence-based clinical decision support resource',
    type: 'web',
    endpoints: {
      search: 'https://www.uptodate.com/contents/search',
      details: 'https://www.uptodate.com/contents/',
      references: 'https://www.uptodate.com/contents/'
    }
  },
  pubmed: {
    name: 'PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    description: 'Medical research database',
    type: 'api',
    endpoints: {
      search: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
      details: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi',
      references: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi'
    }
  },
  msd: {
    name: 'MSD Manuals',
    url: 'https://www.msdmanuals.com/',
    description: 'Professional medical reference',
    type: 'web',
    endpoints: {
      search: 'https://www.msdmanuals.com/professional/search',
      details: 'https://www.msdmanuals.com/professional/',
      references: 'https://www.msdmanuals.com/professional/'
    }
  },
  medscape: {
    name: 'Medscape',
    url: 'https://reference.medscape.com/',
    description: 'Medical reference and news',
    type: 'web',
    endpoints: {
      search: 'https://reference.medscape.com/search',
      details: 'https://reference.medscape.com/',
      references: 'https://reference.medscape.com/'
    }
  },
  rucml: {
    name: 'RUCLM',
    url: 'https://rucml.ru/',
    description: 'Russian clinical laboratory standards',
    type: 'web',
    endpoints: {
      search: 'https://rucml.ru/search',
      details: 'https://rucml.ru/',
      references: 'https://rucml.ru/'
    }
  }
};

// AI система для извлечения знаний
export class MedicalKnowledgeExtractor {
  private openai: OpenAI;

  constructor() {
    this.openai = openai;
  }

  // Извлечение знаний из текста с помощью AI
  async extractKnowledgeFromText(
    text: string, 
    source: MedicalSource,
    query: string
  ): Promise<ExtractedKnowledge> {
    try {
      const prompt = this.buildExtractionPrompt(text, source, query);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Ты - медицинский эксперт, специализирующийся на извлечении структурированных данных из медицинских текстов. Твоя задача - анализировать медицинскую информацию и извлекать данные о типах исследований, показателях и референсных диапазонах."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const extractedData = response.choices[0]?.message?.content;
      if (!extractedData) {
        throw new Error('No data extracted from AI response');
      }

      return this.parseExtractedData(extractedData, source);
    } catch (error) {
      console.error('Error extracting knowledge:', error);
      throw error;
    }
  }

  // Построение промпта для AI
  private buildExtractionPrompt(text: string, source: MedicalSource, query: string): string {
    return `
Проанализируй следующий медицинский текст и извлеки структурированные данные:

ИСТОЧНИК: ${source.name} (${source.url})
ЗАПРОС: ${query}

ТЕКСТ:
${text}

Извлеки следующую информацию в формате JSON:

1. studyType (если применимо):
   - name: название исследования на русском
   - nameEn: название на английском
   - code: код исследования (LOINC, если есть)
   - category: категория (гематология, биохимия, и т.д.)
   - description: описание исследования
   - clinicalSignificance: клиническое значение
   - preparation: подготовка к исследованию
   - biomaterial: биоматериал

2. indicators (массив показателей):
   - name: название показателя
   - nameEn: английское название
   - code: код показателя
   - shortName: краткое название
   - unit: единица измерения
   - description: описание
   - clinicalSignificance: клиническое значение
   - increasedMeaning: что означает повышение
   - decreasedMeaning: что означает понижение
   - relatedConditions: связанные состояния
   - synonyms: синонимы

3. referenceRanges (массив нормативных диапазонов):
   - methodology: методология
   - ageGroupMin/Max: возрастная группа
   - gender: пол
   - minValue/maxValue: нормальные значения
   - optimalMin/optimalMax: оптимальные значения
   - criticalLow/criticalHigh: критические значения
   - note: примечания

Верни только валидный JSON без дополнительных комментариев.
    `;
  }

  // Парсинг извлеченных данных
  private parseExtractedData(data: string, source: MedicalSource): ExtractedKnowledge {
    try {
      const parsed = JSON.parse(data);
      
      return {
        ...parsed,
        sources: {
          primary: source,
          references: [source], // Пока только основной источник
          lastChecked: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error parsing extracted data:', error);
      throw new Error('Failed to parse extracted medical data');
    }
  }

  // Поиск информации в источнике
  async searchInSource(source: MedicalSource, query: string): Promise<string> {
    switch (source.type) {
      case 'api':
        return await this.searchAPI(source, query);
      case 'web':
        return await this.searchWeb(source, query);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  // Поиск через API
  private async searchAPI(source: MedicalSource, query: string): Promise<string> {
    if (!source.endpoints?.search) {
      throw new Error(`No search endpoint for ${source.name}`);
    }

    try {
      const response = await fetch(source.endpoints.search, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(source.apiKey && { 'Authorization': `Bearer ${source.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error searching in ${source.name}:`, error);
      throw error;
    }
  }

  // Поиск в веб-источниках (симуляция)
  private async searchWeb(source: MedicalSource, query: string): Promise<string> {
    // В реальной реализации здесь был бы веб-скрапинг
    // Пока возвращаем симулированные данные
    return this.getSimulatedData(source, query);
  }

  // Симулированные данные для демонстрации
  private getSimulatedData(source: MedicalSource, query: string): string {
    const data = {
      uptodate: `
        Complete Blood Count (CBC) is a common blood test that provides important information about the types and numbers of cells in the blood.
        
        Normal ranges:
        - Hemoglobin: 12-16 g/dL (women), 14-18 g/dL (men)
        - Red blood cells: 4.0-5.2 million/μL (women), 4.5-5.9 million/μL (men)
        - White blood cells: 4,500-11,000/μL
        
        Clinical significance: CBC helps diagnose anemia, infections, and blood disorders.
        Preparation: No special preparation required, but fasting may be preferred.
        Biomaterial: Venous blood with EDTA.
      `,
      pubmed: `
        Research shows that hemoglobin levels below 12 g/dL in women and 14 g/dL in men indicate anemia.
        Elevated white blood cell count (>11,000/μL) may indicate infection or inflammation.
        Low platelet count (<150,000/μL) increases bleeding risk.
      `,
      msd: `
        MSD Manuals recommend CBC for routine health screening and diagnosis of blood disorders.
        Reference ranges may vary by laboratory and population.
        Critical values require immediate medical attention.
      `
    };

    return data[source.name.toLowerCase() as keyof typeof data] || 'No data available';
  }
}

// Основной класс для управления источниками
export class MedicalSourcesManager {
  private extractor: MedicalKnowledgeExtractor;

  constructor() {
    this.extractor = new MedicalKnowledgeExtractor();
  }

  // Поиск знаний по запросу
  async searchKnowledge(query: string, sources: string[] = ['uptodate', 'pubmed']): Promise<ExtractedKnowledge[]> {
    const results: ExtractedKnowledge[] = [];

    for (const sourceName of sources) {
      const source = MEDICAL_SOURCES[sourceName];
      if (!source) {
        console.warn(`Source ${sourceName} not found`);
        continue;
      }

      try {
        console.log(`Searching in ${source.name}...`);
        const text = await this.extractor.searchInSource(source, query);
        const knowledge = await this.extractor.extractKnowledgeFromText(text, source, query);
        results.push(knowledge);
      } catch (error) {
        console.error(`Error searching in ${source.name}:`, error);
      }
    }

    return results;
  }

  // Обновление базы знаний
  async updateKnowledgeBase(query: string): Promise<void> {
    const extractedKnowledge = await this.searchKnowledge(query);
    
    // Здесь будет логика сохранения в базу данных
    console.log('Extracted knowledge:', extractedKnowledge);
    
    // TODO: Сохранение в Prisma
    // await this.saveToDatabase(extractedKnowledge);
  }

  // Получение всех доступных источников
  getAvailableSources(): MedicalSource[] {
    return Object.values(MEDICAL_SOURCES);
  }
}

export default MedicalSourcesManager;
