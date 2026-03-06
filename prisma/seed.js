import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products from backup...');

  const backupPath = path.resolve(__dirname, 'products-backup.json');
  const rawData = await fs.readFile(backupPath, 'utf8');
  const products = JSON.parse(rawData);

  // Make sure dates are parsed to ensure Prisma compatibility
  const preparedProducts = products.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt)
  }));

  await prisma.product.createMany({
    data: preparedProducts,
    skipDuplicates: true
  });

  console.log(`✅ ${preparedProducts.length} products seeded successfully!`);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
