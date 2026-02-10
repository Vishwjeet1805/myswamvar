const path = require('path');
const { config } = require('dotenv');

config({ path: path.resolve(__dirname, '../../../../.env') });
config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

function env(key: string, alt?: string): string {
  const v = process.env[key] ?? process.env[` ${key}`] ?? alt ?? '';
  return typeof v === 'string' ? v.trim() : '';
}

const SEED_USER_EMAIL_PREFIX = 'seed.user.';
const SEED_USER_EMAIL_SUFFIX = '@seed.myswayamvar.local';
const CLEANUP_INCLUDE_SUPER_ADMIN = env('CLEANUP_INCLUDE_SUPER_ADMIN') === 'true';
const SUPER_ADMIN_EMAIL = env('SUPER_ADMIN_EMAIL') || 'admin@myswayamvar.local';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const seedUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: SEED_USER_EMAIL_PREFIX,
        endsWith: SEED_USER_EMAIL_SUFFIX,
      },
    },
    select: { id: true, email: true },
  });

  if (seedUsers.length === 0) {
    console.log('No seed users found. Nothing to clean up.');
  } else {
    const userIds = seedUsers.map((u: { id: string }) => u.id);
    await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
    const deleted = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
    console.log(`Deleted ${deleted.count} seed users (and their profiles).`);
  }

  if (CLEANUP_INCLUDE_SUPER_ADMIN) {
    const admin = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
    });
    if (admin) {
      await prisma.profile.deleteMany({ where: { userId: admin.id } });
      await prisma.user.delete({ where: { id: admin.id } });
      console.log('Deleted super admin user:', SUPER_ADMIN_EMAIL);
    } else {
      console.log('Super admin not found:', SUPER_ADMIN_EMAIL);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
