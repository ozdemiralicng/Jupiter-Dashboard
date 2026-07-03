import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123456', 12);

  await prisma.user.upsert({
    where: { email: 'admin@tradingcopilot.local' },
    update: { name: 'Jupiter GSM Admin', passwordHash, role: Role.ADMIN, isActive: true },
    create: {
      email: 'admin@tradingcopilot.local',
      name: 'Jupiter GSM Admin',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.warehouse.upsert({
    where: { name: 'Dubai Main Store' },
    update: {},
    create: { name: 'Dubai Main Store', location: 'Dubai' },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
