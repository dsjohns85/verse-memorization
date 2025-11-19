import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log('Created user:', user);

  // Create sample verses
  const verses = [
    {
      reference: 'John 3:16',
      text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      translation: 'NIV',
      userId: user.id,
    },
    {
      reference: 'Philippians 4:13',
      text: 'I can do all this through him who gives me strength.',
      translation: 'NIV',
      userId: user.id,
    },
    {
      reference: 'Proverbs 3:5-6',
      text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
      translation: 'NIV',
      userId: user.id,
    },
  ];

  for (const verseData of verses) {
    const verse = await prisma.verse.create({
      data: {
        ...verseData,
        reviews: {
          create: {
            userId: user.id,
            quality: 0,
            nextReviewAt: new Date(),
          },
        },
      },
    });
    console.log('Created verse:', verse.reference);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
