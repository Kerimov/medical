const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: 'seed@example.com' } });
    console.log('user exists:', !!user);
    if (user) {
      console.log('email:', user.email);
      console.log('name:', user.name);
      console.log('password hash length:', user.password.length);
      const ok = await bcrypt.compare('seed1234', user.password);
      console.log('bcrypt compare("seed1234"):', ok);
    }
  } catch (e) {
    console.error('error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();


