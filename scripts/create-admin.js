/* Helper script: create or update an ADMIN user in the current database.
 *
 * Usage (PowerShell, with your DATABASE_URL pointing to Postgres on Vercel):
 *   $env:DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
 *   node scripts/create-admin.js admin@medical.com Admin123!
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email =
    process.argv[2] || process.env.ADMIN_EMAIL || 'admin@medical.com';
  const plainPassword =
    process.argv[3] || process.env.ADMIN_PASSWORD || 'Admin123!';

  console.log('Creating/updating ADMIN user...');
  console.log('  Email:', email);

  const password = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password,
      name: 'Администратор',
      role: 'ADMIN',
    },
    update: {
      password,
      name: 'Администратор',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user ready:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Password:', plainPassword);
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


