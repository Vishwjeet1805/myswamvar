const path = require('path');
const { config } = require('dotenv');

// Load .env from monorepo root so "npm run db:seed" from root works with a single .env
config({ path: path.resolve(__dirname, '../../../../.env') });
config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  firstNamesMale,
  firstNamesFemale,
  surnames,
} from './seed-data/names';

function env(key: string, alt?: string): string {
  const v = process.env[key] ?? process.env[` ${key}`] ?? alt ?? '';
  return typeof v === 'string' ? v.trim() : '';
}

const BCRYPT_ROUNDS = 12;
const SEED_USER_EMAIL_DOMAIN = 'seed.myswayamvar.local';
const SEED_USER_PASSWORD = 'SeedUser123!';
const SUPER_ADMIN_EMAIL = env('SUPER_ADMIN_EMAIL') || 'admin@myswayamvar.local';
const SUPER_ADMIN_PASSWORD = env('SUPER_ADMIN_PASSWORD') || 'SuperAdmin123!';
const DEMO_USER_EMAIL = env('DEMO_USER_EMAIL') || 'demo@myswayamvar.local';
const DEMO_USER_PASSWORD = env('DEMO_USER_PASSWORD') || 'DemoUser123!';
const SEED_RANDOM = env('SEED_RANDOM');

const prisma = new PrismaClient();

/** Simple seeded RNG for reproducible names when SEED_RANDOM is set */
let seed = 0;
function random(): number {
  if (SEED_RANDOM != null && SEED_RANDOM !== '') {
    const x = Math.sin(Number(SEED_RANDOM) + seed++) * 10000;
    return x - Math.floor(x);
  }
  return Math.random();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)]!;
}

function randomDobYearsAgo(minAge: number, maxAge: number): Date {
  const age = minAge + Math.floor(random() * (maxAge - minAge + 1));
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setMonth(Math.floor(random() * 12));
  d.setDate(1 + Math.floor(random() * 28));
  d.setHours(0, 0, 0, 0);
  return d;
}

const religions = ['Hindu', 'Buddhist', 'Jain', 'Sikh', 'Christian', 'Muslim'];
const cities = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { city: 'Pune', state: 'Maharashtra', country: 'India' },
  { city: 'Nagpur', state: 'Maharashtra', country: 'India' },
  { city: 'Thane', state: 'Maharashtra', country: 'India' },
  { city: 'Nashik', state: 'Maharashtra', country: 'India' },
  { city: 'Aurangabad', state: 'Maharashtra', country: 'India' },
  { city: 'Kolhapur', state: 'Maharashtra', country: 'India' },
  { city: 'Solapur', state: 'Maharashtra', country: 'India' },
  { city: 'Delhi', state: 'Delhi', country: 'India' },
  { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
];
const education = [
  'B.E.', 'B.Tech', 'M.B.A.', 'B.Com', 'M.Com', 'B.A.', 'M.A.', 'B.Sc.', 'M.Sc.',
  'B.Pharm', 'M.B.B.S.', 'B.Ed.', 'M.C.A.', 'B.C.A.', 'Diploma', 'Ph.D.',
];
const occupation = [
  'Software Engineer', 'Teacher', 'Doctor', 'Accountant', 'Business Owner',
  'Government Employee', 'Bank Officer', 'Architect', 'Lawyer', 'Nurse',
  'Pharmacist', 'Designer', 'Marketing Manager', 'Civil Engineer', 'Professor',
];

async function ensureSuperAdmin(): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });
  if (existing) {
    console.log('Super admin already exists:', SUPER_ADMIN_EMAIL);
    return;
  }
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, BCRYPT_ROUNDS);
  await prisma.user.create({
    data: {
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      status: 'approved',
      emailVerified: true,
    },
  });
  console.log('Super admin created:', SUPER_ADMIN_EMAIL);
}

async function seedUsersAndProfiles(): Promise<void> {
  const existingCount = await prisma.user.count({
    where: {
      email: { startsWith: 'seed.user.', endsWith: `@${SEED_USER_EMAIL_DOMAIN}` },
    },
  });
  if (existingCount >= 500) {
    console.log('Seed users already present (500). Skip creating.');
    return;
  }

  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, BCRYPT_ROUNDS);
  const usedDisplayNames = new Set<string>();

  for (let i = 1; i <= 500; i++) {
    const email = `seed.user.${i}@${SEED_USER_EMAIL_DOMAIN}`;
    const phone = `+9198765432${String(i).padStart(3, '0')}`;

    let displayName: string;
    let gender: string;
    do {
      const isMale = random() < 0.5;
      const first = isMale ? pick(firstNamesMale) : pick(firstNamesFemale);
      const last = pick(surnames);
      displayName = `${first} ${last}`;
      gender = isMale ? 'male' : 'female';
    } while (usedDisplayNames.has(displayName));
    usedDisplayNames.add(displayName);

    const dob = randomDobYearsAgo(22, 45);
    const location = pick(cities);
    const religion = pick(religions);
    const education_ = pick(education);
    const occupation_ = pick(occupation);

    await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          role: 'user',
          status: 'approved',
        },
      });
      await tx.profile.create({
        data: {
          userId: user.id,
          displayName,
          dob,
          gender,
          religion,
          location,
          education: education_,
          occupation: occupation_,
          bio: null,
          privacyContactVisibleTo: 'all',
        },
      });
    });

    if (i % 100 === 0) {
      console.log(`Created ${i} / 500 seed users...`);
    }
  }

  console.log('500 seed users with profiles created.');
}

/** Demo user with shortlist, mutual interest, chat conversation, and saved search for recording the demo video. */
async function seedDemoUser(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, BCRYPT_ROUNDS);
  const location = { city: 'Mumbai', state: 'Maharashtra', country: 'India' };

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    create: {
      email: DEMO_USER_EMAIL,
      phone: '+919876543210',
      passwordHash,
      role: 'user',
      status: 'approved',
    },
    update: {},
  });

  const demoProfile = await prisma.profile.upsert({
    where: { userId: demoUser.id },
    create: {
      userId: demoUser.id,
      displayName: 'Demo User',
      dob: randomDobYearsAgo(28, 32),
      gender: 'male',
      religion: 'Hindu',
      location,
      education: 'B.Tech',
      occupation: 'Software Engineer',
      bio: 'Demo profile for the matrimony platform video.',
      privacyContactVisibleTo: 'all',
    },
    update: {},
  });

  // Get a few other seed profiles for shortlist and one for mutual interest + chat
  const otherProfiles = await prisma.profile.findMany({
    where: { userId: { not: demoUser.id } },
    include: { user: true },
    take: 5,
    orderBy: { createdAt: 'asc' },
  });
  if (otherProfiles.length === 0) {
    console.log('No other profiles found; run seedUsersAndProfiles first. Skipping demo shortlist/interest/chat.');
    return;
  }

  const [partnerProfile, ...shortlistProfiles] = otherProfiles;
  const partnerUser = partnerProfile.user;

  // Shortlist: add 2–3 profiles for demo user
  for (const p of shortlistProfiles.slice(0, 3)) {
    await prisma.shortlist.upsert({
      where: {
        userId_profileId: { userId: demoUser.id, profileId: p.id },
      },
      create: {
        userId: demoUser.id,
        profileId: p.id,
      },
      update: {},
    });
  }

  // Mutual interest: demo <-> partner (both accepted)
  await prisma.interest.upsert({
    where: {
      fromUserId_toUserId: { fromUserId: demoUser.id, toUserId: partnerUser.id },
    },
    create: { fromUserId: demoUser.id, toUserId: partnerUser.id, status: 'accepted' },
    update: { status: 'accepted' },
  });
  await prisma.interest.upsert({
    where: {
      fromUserId_toUserId: { fromUserId: partnerUser.id, toUserId: demoUser.id },
    },
    create: { fromUserId: partnerUser.id, toUserId: demoUser.id, status: 'accepted' },
    update: { status: 'accepted' },
  });

  // Conversation (normalized: user1Id < user2Id) and a few messages
  const [u1, u2] = demoUser.id < partnerUser.id
    ? [demoUser.id, partnerUser.id]
    : [partnerUser.id, demoUser.id];
  const conversation = await prisma.conversation.upsert({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    create: { user1Id: u1, user2Id: u2 },
    update: {},
  });

  const existingMessages = await prisma.message.count({
    where: { conversationId: conversation.id },
  });
  if (existingMessages === 0) {
    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, senderId: partnerUser.id, content: 'Hi! Thanks for connecting.' },
        { conversationId: conversation.id, senderId: demoUser.id, content: 'Hello! Glad we have mutual interest.' },
        { conversationId: conversation.id, senderId: partnerUser.id, content: 'Would love to know more about you.' },
      ],
    });
  }

  // One saved search for demo user
  const existingSearch = await prisma.savedSearch.findFirst({
    where: { userId: demoUser.id },
  });
  if (!existingSearch) {
    await prisma.savedSearch.create({
      data: {
        userId: demoUser.id,
        name: 'Mumbai, 25–35, Graduate',
        filters: {
          ageMin: 25,
          ageMax: 35,
          locationCity: 'Mumbai',
          locationState: 'Maharashtra',
          locationCountry: 'India',
          education: 'B.Tech',
        },
        notify: false,
      },
    });
  }

  console.log('Demo user created:', DEMO_USER_EMAIL, '(password:', DEMO_USER_PASSWORD + ')');
}

async function main(): Promise<void> {
  await ensureSuperAdmin();
  await seedUsersAndProfiles();
  await seedDemoUser();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
