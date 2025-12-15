import type { Prescription } from '@prisma/client'

export function prescriptionsToMarkdown(params: {
  patientName: string
  doctorName: string
  generatedAtIso: string
  prescriptions: Array<Pick<Prescription, 'medication' | 'dosage' | 'frequency' | 'duration' | 'instructions' | 'prescribedAt' | 'expiresAt' | 'isActive'>>
}) {
  const lines: string[] = []
  lines.push(`# Лист назначений`)
  lines.push(``)
  lines.push(`**Пациент:** ${params.patientName}`)
  lines.push(`**Врач:** ${params.doctorName}`)
  lines.push(`**Сформировано:** ${new Date(params.generatedAtIso).toLocaleString('ru-RU')}`)
  lines.push(``)

  const active = params.prescriptions.filter((p) => p.isActive)
  const inactive = params.prescriptions.filter((p) => !p.isActive)

  lines.push(`## Активные назначения (${active.length})`)
  lines.push(``)
  if (active.length === 0) {
    lines.push(`—`)
    lines.push(``)
  } else {
    active.forEach((p, idx) => {
      lines.push(`${idx + 1}. **${p.medication}**`)
      lines.push(`   - Дозировка: ${p.dosage}`)
      lines.push(`   - Частота: ${p.frequency}`)
      lines.push(`   - Длительность: ${p.duration}`)
      if (p.instructions) lines.push(`   - Инструкция: ${p.instructions}`)
      if (p.expiresAt) lines.push(`   - Срок до: ${new Date(p.expiresAt).toLocaleDateString('ru-RU')}`)
      lines.push(``)
    })
  }

  lines.push(`## История (${inactive.length})`)
  lines.push(``)
  if (inactive.length === 0) {
    lines.push(`—`)
    lines.push(``)
  } else {
    inactive.slice(0, 10).forEach((p, idx) => {
      lines.push(`${idx + 1}. ${p.medication} — ${p.dosage} • ${p.frequency} • ${p.duration}`)
      if (p.expiresAt) lines.push(`   - Срок до: ${new Date(p.expiresAt).toLocaleDateString('ru-RU')}`)
      lines.push(``)
    })
    if (inactive.length > 10) {
      lines.push(`_(показаны последние 10 из ${inactive.length})_`)
      lines.push(``)
    }
  }

  lines.push(`---`)
  lines.push(`_Этот лист носит информационный характер. При любых сомнениях уточняйте у лечащего врача._`)
  lines.push(``)
  return lines.join('\n')
}


