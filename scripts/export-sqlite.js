const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function main() {
	const prisma = new PrismaClient()
	try {
		const result = {}

		async function safeFetch(name, fn) {
			try {
				result[name] = await fn()
			} catch (e) {
				result[name] = { __error: String(e && e.message ? e.message : e) }
			}
		}

		await safeFetch('users', () => prisma.user.findMany())
		await safeFetch('documents', () => prisma.document.findMany())
		await safeFetch('analyses', () => prisma.analysis.findMany())
		await safeFetch('reminders', () => prisma.reminder.findMany())
		await safeFetch('reminderPreferences', () => prisma.reminderPreference.findMany())
		await safeFetch('recommendations', () => prisma.recommendation.findMany())
		await safeFetch('doctorProfiles', () => prisma.doctorProfile.findMany())
		await safeFetch('patientRecords', () => prisma.patientRecord.findMany())

		const outDir = path.join(process.cwd(), 'export')
		if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
		const outFile = path.join(outDir, 'data.json')
		fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8')
		console.log('✅ Exported to', outFile)
	} finally {
		await prisma.$disconnect()
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
