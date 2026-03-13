#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, imageUrl: true, images: true } });
  let updated = 0;
  for (const p of products) {
    const imgs = Array.isArray(p.images) ? [...p.images] : [];
    const primary = p.imageUrl;
    if (primary && !imgs.includes(primary)) {
      imgs.unshift(primary);
    }
    if (imgs.length === 0) continue; // nothing to set
    await prisma.product.update({ where: { id: p.id }, data: { images: imgs } });
    updated++;
  }
  console.log(`Updated ${updated} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
