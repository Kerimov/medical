const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function main() {
	const prisma = new PrismaClient()
	try {
		const file = path.join(process.cwd(), 'export', 'data.json')
		if (!fs.existsSync(file)) {
			console.error('Missing export/data.json. Run export first.')
			process.exit(1)
		}
		const data = JSON.parse(fs.readFileSync(file, 'utf8'))

		// Import order to satisfy FKs: users -> doctorProfiles -> patientRecords -> documents -> analyses -> reminders -> reminderPreferences -> recommendations
		async function safe(items, name, handler) {
			if (!Array.isArray(items)) return
			for (const item of items) {
				try {
					await handler(item)
				} catch (e) {
					console.warn(`[skip:${name}]`, e && e.message ? e.message : e)
				}
			}
		}

		await safe(data.users, 'user', (x) => prisma.user.upsert({
			where: { id: x.id },
			create: {
				id: x.id,
				email: x.email,
				password: x.password,
				name: x.name,
				role: x.role,
				createdAt: x.createdAt ? new Date(x.createdAt) : undefined
			},
			update: {
				email: x.email,
				password: x.password,
				name: x.name,
				role: x.role
			}
		}))

		await safe(data.doctorProfiles, 'doctorProfile', (x) => prisma.doctorProfile.upsert({
			where: { id: x.id },
			create: { ...x, id: x.id, userId: x.userId },
			update: { ...x }
		}))

		await safe(data.patientRecords, 'patientRecord', (x) => prisma.patientRecord.upsert({
			where: { id: x.id },
			create: { ...x, id: x.id, userId: x.userId },
			update: { ...x }
		}))

		await safe(data.documents, 'document', (x) => prisma.document.upsert({
			where: { id: x.id },
			create: { ...x, id: x.id, userId: x.userId, createdAt: x.createdAt ? new Date(x.createdAt) : undefined },
			update: { ...x }
		}))

		await safe(data.analyses, 'analysis', (x) => prisma.analysis.upsert({
			where: { id: x.id },
			create: { ...x, id: x.id, userId: x.userId, createdAt: x.createdAt ? new Date(x.createdAt) : undefined },
			update: { ...x }
		}))

		await safe(data.reminders, 'reminder', (x) => prisma.reminder.upsert({
			where: { id: x.id },
			create: { ...x, id: x.id, userId: x.userId, createdAt: x.createdAt ? new Date(x.createdAt) : undefined },
			update: { ...x }
		}))

		await safe(data.reminderPreferences, 'reminderPreference', (x) => prisma.reminderPreference.upsert({
			where: { id: x.id },
			create: { ...x, id: x.id, userId: x.userId },
			update: { ...x }
		}))

		await safe(data.recommendations, 'recommendation', (x) => prisma.recommendation.upsert({
			where: { id: x.id },
			create: { ...x, id: x.id, userId: x.userId, createdAt: x.createdAt ? new Date(x.createdAt) : undefined },
			update: { ...x }
		}))

		console.log('✅ Import completed')
	} finally {
		await prisma.$disconnect()
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
