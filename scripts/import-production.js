// Скрипт для импорта данных из продакшена в локальную БД
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function main() {
  // Находим последний файл экспорта
  const exportDir = path.join(process.cwd(), 'export')
  if (!fs.existsSync(exportDir)) {
    console.error('❌ Папка export не найдена!')
    console.log('\n💡 Сначала выполни экспорт:')
    console.log('   node scripts/export-production.js')
    process.exit(1)
  }
  
  const files = fs.readdirSync(exportDir)
    .filter(f => f.startsWith('production-data-') && f.endsWith('.json'))
    .sort()
    .reverse()
  
  if (files.length === 0) {
    console.error('❌ Файлы экспорта не найдены!')
    console.log('\n💡 Сначала выполни экспорт:')
    console.log('   node scripts/export-production.js')
    process.exit(1)
  }
  
  const latestFile = path.join(exportDir, files[0])
  console.log(`📥 Импорт данных из: ${files[0]}\n`)
  
  const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'))
  
  const prisma = new PrismaClient()
  
  try {
    // Импортируем в правильном порядке (с учетом зависимостей)
    async function safeImport(items, name, handler) {
      if (!Array.isArray(items) || items.length === 0) {
        console.log(`⏭️  ${name}: пропущено (нет данных)`)
        return
      }
      
      console.log(`📥 Импорт ${name}...`)
      let success = 0
      let errors = 0
      
      for (const item of items) {
        try {
          await handler(item)
          success++
        } catch (e) {
          errors++
          if (errors <= 3) {
            console.warn(`   ⚠️ Ошибка при импорте ${name}:`, e.message)
          }
        }
      }
      
      console.log(`   ✅ ${success} записей, ❌ ${errors} ошибок`)
    }
    
    // 1. Пользователи (базовая таблица)
    await safeImport(data.users, 'users', (x) => prisma.user.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        email: x.email,
        password: x.password,
        name: x.name,
        role: x.role,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        email: x.email,
        password: x.password,
        name: x.name,
        role: x.role
      }
    }))
    
    // 2. Профили врачей
    await safeImport(data.doctorProfiles, 'doctorProfiles', (x) => prisma.doctorProfile.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        userId: x.userId,
        licenseNumber: x.licenseNumber,
        specialization: x.specialization,
        experience: x.experience,
        education: x.education,
        certifications: x.certifications,
        phone: x.phone,
        clinic: x.clinic,
        address: x.address,
        workingHours: x.workingHours,
        consultationFee: x.consultationFee,
        isVerified: x.isVerified ?? false,
        isActive: x.isActive ?? true,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        licenseNumber: x.licenseNumber,
        specialization: x.specialization,
        experience: x.experience,
        education: x.education,
        certifications: x.certifications,
        phone: x.phone,
        clinic: x.clinic,
        address: x.address,
        workingHours: x.workingHours,
        consultationFee: x.consultationFee,
        isVerified: x.isVerified ?? false,
        isActive: x.isActive ?? true
      }
    }))
    
    // 3. Записи пациентов
    await safeImport(data.patientRecords, 'patientRecords', (x) => prisma.patientRecord.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        patientId: x.patientId || x.userId,
        doctorId: x.doctorId,
        recordType: x.recordType || 'consultation',
        diagnosis: x.diagnosis,
        symptoms: x.symptoms,
        treatment: x.treatment,
        medications: x.medications,
        nextVisit: x.nextVisit ? new Date(x.nextVisit) : null,
        status: x.status || 'active'
      },
      update: {
        recordType: x.recordType || 'consultation',
        diagnosis: x.diagnosis,
        symptoms: x.symptoms,
        treatment: x.treatment,
        medications: x.medications,
        nextVisit: x.nextVisit ? new Date(x.nextVisit) : null,
        status: x.status || 'active'
      }
    }))
    
    // 4. Документы
    await safeImport(data.documents, 'documents', (x) => prisma.document.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        userId: x.userId,
        fileName: x.fileName,
        fileType: x.fileType,
        fileSize: x.fileSize,
        fileUrl: x.fileUrl,
        parsed: x.parsed ?? false,
        category: x.category,
        indicators: x.indicators,
        uploadDate: x.uploadDate ? new Date(x.uploadDate) : new Date(),
        studyDate: x.studyDate ? new Date(x.studyDate) : null,
        studyType: x.studyType,
        laboratory: x.laboratory,
        doctor: x.doctor,
        findings: x.findings,
        rawText: x.rawText,
        ocrConfidence: x.ocrConfidence,
        tags: x.tags,
        notes: x.notes
      },
      update: {
        fileName: x.fileName,
        fileType: x.fileType,
        fileSize: x.fileSize,
        fileUrl: x.fileUrl,
        parsed: x.parsed ?? false,
        category: x.category,
        indicators: x.indicators,
        studyDate: x.studyDate ? new Date(x.studyDate) : null,
        studyType: x.studyType,
        laboratory: x.laboratory,
        doctor: x.doctor,
        findings: x.findings,
        rawText: x.rawText,
        ocrConfidence: x.ocrConfidence,
        tags: x.tags,
        notes: x.notes
      }
    }))
    
    // 5. Анализы
    await safeImport(data.analyses, 'analyses', (x) => prisma.analysis.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        userId: x.userId,
        documentId: x.documentId,
        title: x.title,
        type: x.type,
        date: x.date ? new Date(x.date) : new Date(),
        status: x.status,
        results: x.results,
        notes: x.notes,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        title: x.title,
        type: x.type,
        date: x.date ? new Date(x.date) : new Date(),
        status: x.status,
        results: x.results,
        notes: x.notes
      }
    }))
    
    // 6. Показатели
    await safeImport(data.indicators, 'indicators', (x) => prisma.indicator.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        analysisId: x.analysisId,
        name: x.name,
        value: x.value,
        unit: x.unit,
        referenceMin: x.referenceMin,
        referenceMax: x.referenceMax,
        isNormal: x.isNormal ?? true
      },
      update: {
        name: x.name,
        value: x.value,
        unit: x.unit,
        referenceMin: x.referenceMin,
        referenceMax: x.referenceMax,
        isNormal: x.isNormal ?? true
      }
    }))
    
    // 7. Напоминания
    await safeImport(data.reminders, 'reminders', (x) => prisma.reminder.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        userId: x.userId,
        analysisId: x.analysisId,
        documentId: x.documentId,
        title: x.title,
        description: x.description,
        dueAt: x.dueAt ? new Date(x.dueAt) : (x.reminderDate ? new Date(x.reminderDate) : new Date()),
        recurrence: x.recurrence || 'NONE',
        channels: x.channels || ['EMAIL']
      },
      update: {
        title: x.title,
        description: x.description,
        dueAt: x.dueAt ? new Date(x.dueAt) : (x.reminderDate ? new Date(x.reminderDate) : new Date()),
        recurrence: x.recurrence || 'NONE',
        channels: x.channels || ['EMAIL']
      }
    }))
    
    // 8. Настройки напоминаний
    await safeImport(data.reminderPreferences, 'reminderPreferences', (x) => prisma.reminderPreference.upsert({
      where: { userId: x.userId },
      create: {
        userId: x.userId,
        email: x.email ?? true,
        push: x.push ?? true,
        sms: x.sms ?? false,
        timezone: x.timezone || 'Europe/Moscow',
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        email: x.email ?? true,
        push: x.push ?? true,
        sms: x.sms ?? false,
        timezone: x.timezone || 'Europe/Moscow'
      }
    }))
    
    // 9. Доставки напоминаний
    await safeImport(data.reminderDeliveries, 'reminderDeliveries', (x) => prisma.reminderDelivery.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        reminderId: x.reminderId,
        channel: x.channel,
        status: x.status || 'PENDING',
        sentAt: x.sentAt ? new Date(x.sentAt) : null,
        error: x.error
      },
      update: {
        channel: x.channel,
        status: x.status || 'PENDING',
        sentAt: x.sentAt ? new Date(x.sentAt) : null,
        error: x.error
      }
    }))
    
    // 10. Рекомендации
    await safeImport(data.recommendations, 'recommendations', (x) => prisma.recommendation.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        userId: x.userId,
        type: x.type,
        title: x.title,
        description: x.description,
        reason: x.reason,
        priority: x.priority ?? 1,
        status: x.status || 'ACTIVE',
        companyId: x.companyId,
        productId: x.productId,
        analysisId: x.analysisId,
        metadata: x.metadata,
        expiresAt: x.expiresAt ? new Date(x.expiresAt) : null
      },
      update: {
        type: x.type,
        title: x.title,
        description: x.description,
        reason: x.reason,
        priority: x.priority ?? 1,
        status: x.status || 'ACTIVE',
        companyId: x.companyId,
        productId: x.productId,
        analysisId: x.analysisId,
        metadata: x.metadata,
        expiresAt: x.expiresAt ? new Date(x.expiresAt) : null
      }
    }))
    
    // 11. Взаимодействия с рекомендациями
    await safeImport(data.recommendationInteractions, 'recommendationInteractions', async (x) => {
      // Проверяем, существует ли уже такая запись
      const existing = await prisma.recommendationInteraction.findFirst({
        where: {
          id: x.id
        }
      })
      if (!existing) {
        await prisma.recommendationInteraction.create({
          data: {
            id: x.id,
            recommendationId: x.recommendationId,
            action: x.action,
            metadata: x.metadata
          }
        })
      }
    })
    
    // 12. Записи на прием
    await safeImport(data.appointments, 'appointments', (x) => prisma.appointment.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        doctorId: x.doctorId,
        patientId: x.patientId || x.userId,
        patientName: x.patientName,
        patientPhone: x.patientPhone,
        patientEmail: x.patientEmail,
        appointmentType: x.appointmentType || 'consultation',
        scheduledAt: x.scheduledAt ? new Date(x.scheduledAt) : (x.date ? new Date(x.date) : new Date()),
        duration: x.duration || 30,
        status: x.status || 'scheduled',
        notes: x.notes
      },
      update: {
        patientName: x.patientName,
        patientPhone: x.patientPhone,
        patientEmail: x.patientEmail,
        appointmentType: x.appointmentType || 'consultation',
        scheduledAt: x.scheduledAt ? new Date(x.scheduledAt) : (x.date ? new Date(x.date) : new Date()),
        duration: x.duration || 30,
        status: x.status || 'scheduled',
        notes: x.notes
      }
    }))
    
    // 13. Рецепты
    await safeImport(data.prescriptions, 'prescriptions', (x) => prisma.prescription.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        doctorId: x.doctorId,
        patientRecordId: x.patientRecordId,
        medication: x.medication,
        dosage: x.dosage,
        frequency: x.frequency,
        duration: x.duration,
        instructions: x.instructions,
        isActive: x.isActive ?? true,
        prescribedAt: x.prescribedAt ? new Date(x.prescribedAt) : (x.prescribedDate ? new Date(x.prescribedDate) : new Date()),
        expiresAt: x.expiresAt ? new Date(x.expiresAt) : null
      },
      update: {
        medication: x.medication,
        dosage: x.dosage,
        frequency: x.frequency,
        duration: x.duration,
        instructions: x.instructions,
        isActive: x.isActive ?? true,
        prescribedAt: x.prescribedAt ? new Date(x.prescribedAt) : (x.prescribedDate ? new Date(x.prescribedDate) : new Date()),
        expiresAt: x.expiresAt ? new Date(x.expiresAt) : null
      }
    }))
    
    // 14. Медицинские записи
    await safeImport(data.medicalNotes, 'medicalNotes', (x) => prisma.medicalNote.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        doctorId: x.doctorId,
        patientRecordId: x.patientRecordId,
        title: x.title,
        content: x.content,
        noteType: x.noteType || 'observation',
        priority: x.priority || 'normal',
        isPrivate: x.isPrivate ?? false
      },
      update: {
        title: x.title,
        content: x.content,
        noteType: x.noteType || 'observation',
        priority: x.priority || 'normal',
        isPrivate: x.isPrivate ?? false
      }
    }))
    
    // 15. Компании
    await safeImport(data.companies, 'companies', (x) => prisma.company.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        name: x.name,
        type: x.type,
        description: x.description,
        address: x.address,
        city: x.city,
        phone: x.phone,
        email: x.email,
        website: x.website,
        rating: x.rating,
        reviewCount: x.reviewCount ?? 0,
        imageUrl: x.imageUrl,
        services: x.services,
        workingHours: x.workingHours,
        coordinates: x.coordinates,
        isVerified: x.isVerified ?? false,
        isActive: x.isActive ?? true,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        name: x.name,
        type: x.type,
        description: x.description,
        address: x.address,
        city: x.city,
        phone: x.phone,
        email: x.email,
        website: x.website,
        rating: x.rating,
        reviewCount: x.reviewCount ?? 0,
        imageUrl: x.imageUrl,
        services: x.services,
        workingHours: x.workingHours,
        coordinates: x.coordinates,
        isVerified: x.isVerified ?? false,
        isActive: x.isActive ?? true
      }
    }))
    
    // 16. Продукты
    await safeImport(data.products, 'products', (x) => prisma.product.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        companyId: x.companyId,
        name: x.name,
        description: x.description,
        category: x.category,
        price: x.price,
        currency: x.currency || 'RUB',
        imageUrl: x.imageUrl,
        isAvailable: x.isAvailable ?? true,
        tags: x.tags,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        name: x.name,
        description: x.description,
        category: x.category,
        price: x.price,
        currency: x.currency || 'RUB',
        imageUrl: x.imageUrl,
        isAvailable: x.isAvailable ?? true,
        tags: x.tags
      }
    }))
    
    // 17. Записи дневника здоровья
    await safeImport(data.healthDiaryEntries, 'healthDiaryEntries', (x) => prisma.healthDiaryEntry.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        userId: x.userId,
        date: x.date ? new Date(x.date) : new Date(),
        mood: x.mood,
        symptoms: x.symptoms,
        notes: x.notes,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        date: x.date ? new Date(x.date) : new Date(),
        mood: x.mood,
        symptoms: x.symptoms,
        notes: x.notes
      }
    }))
    
    // 18. Теги дневника
    await safeImport(data.diaryTags, 'diaryTags', (x) => prisma.diaryTag.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        userId: x.userId,
        name: x.name,
        color: x.color,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        name: x.name,
        color: x.color
      }
    }))
    
    // 19. Связи тегов с записями
    await safeImport(data.diaryTagOnEntries, 'diaryTagOnEntries', (x) => prisma.diaryTagOnEntry.upsert({
      where: {
        entryId_tagId: {
          entryId: x.entryId,
          tagId: x.tagId
        }
      },
      create: {
        entryId: x.entryId,
        tagId: x.tagId
      },
      update: {}
    }))
    
    // 20. Типы исследований
    await safeImport(data.studyTypes, 'studyTypes', (x) => prisma.studyType.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        name: x.name,
        description: x.description,
        category: x.category,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        name: x.name,
        description: x.description,
        category: x.category
      }
    }))
    
    // 21. Методологии
    await safeImport(data.methodologies, 'methodologies', (x) => prisma.methodology.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        studyTypeId: x.studyTypeId,
        name: x.name,
        description: x.description,
        type: x.type,
        source: x.source,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        name: x.name,
        description: x.description,
        type: x.type,
        source: x.source
      }
    }))
    
    // 22. Референсные диапазоны
    await safeImport(data.referenceRanges, 'referenceRanges', (x) => prisma.referenceRange.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        indicatorId: x.indicatorId,
        studyTypeId: x.studyTypeId,
        methodologyId: x.methodologyId,
        min: x.min,
        max: x.max,
        unit: x.unit,
        ageMin: x.ageMin,
        ageMax: x.ageMax,
        gender: x.gender,
        conditions: x.conditions,
        createdAt: x.createdAt ? new Date(x.createdAt) : new Date()
      },
      update: {
        min: x.min,
        max: x.max,
        unit: x.unit,
        ageMin: x.ageMin,
        ageMax: x.ageMax,
        gender: x.gender,
        conditions: x.conditions
      }
    }))
    
    console.log('\n✅ Импорт завершен!')
    console.log('\n📊 Статистика:')
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`   ${key}: ${value.length} записей`)
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('❌ Ошибка импорта:', e)
  process.exit(1)
})

