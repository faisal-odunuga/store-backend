const prisma = require("../src/config/prismaClient");

async function main() {
  console.log('🌱 Seeding products...');

  const products = [
    // Electronics
    {
      name: 'Apple iPhone 15 Pro',
      description: 'Latest iPhone model with A17 Pro chip.',
      price: 1200,
      stock: 20,
      imageUrl: 'https://example.com/iphone15pro.jpg',
      category: 'Electronics'
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Flagship Android smartphone with 200MP camera.',
      price: 1100,
      stock: 25,
      imageUrl: 'https://example.com/s24ultra.jpg',
      category: 'Electronics'
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Noise-cancelling wireless headphones.',
      price: 350,
      stock: 40,
      imageUrl: 'https://example.com/sonywh1000xm5.jpg',
      category: 'Electronics'
    },
    {
      name: 'Dell XPS 15 Laptop',
      description: 'High-performance laptop with Intel i9 processor.',
      price: 1800,
      stock: 10,
      imageUrl: 'https://example.com/dellxps15.jpg',
      category: 'Computers'
    },
    {
      name: 'Apple MacBook Air M3',
      description: 'Lightweight laptop with M3 chip.',
      price: 1400,
      stock: 12,
      imageUrl: 'https://example.com/macbookairm3.jpg',
      category: 'Computers'
    },
    {
      name: 'LG 65-inch 4K OLED TV',
      description: 'Cinematic smart TV with webOS.',
      price: 2000,
      stock: 5,
      imageUrl: 'https://example.com/lg65oled.jpg',
      category: 'Electronics'
    },
    {
      name: 'Canon EOS R10 Camera',
      description: 'Mirrorless camera with advanced autofocus.',
      price: 999,
      stock: 15,
      imageUrl: 'https://example.com/canoneosr10.jpg',
      category: 'Electronics'
    },
    {
      name: 'Apple Watch Ultra 2',
      description: 'Premium smartwatch for fitness and adventure.',
      price: 799,
      stock: 18,
      imageUrl: 'https://example.com/applewatchultra2.jpg',
      category: 'Electronics'
    },
    {
      name: 'PlayStation 5 Console',
      description: 'Next-gen gaming console from Sony.',
      price: 499,
      stock: 30,
      imageUrl: 'https://example.com/ps5.jpg',
      category: 'Gaming'
    },
    {
      name: 'Xbox Series X',
      description: 'Powerful gaming console with 1TB SSD.',
      price: 499,
      stock: 25,
      imageUrl: 'https://example.com/xboxseriesx.jpg',
      category: 'Gaming'
    },

    // Fashion
    {
      name: 'Nike Air Max 270',
      description: 'Stylish sneakers with air cushioning.',
      price: 150,
      stock: 50,
      imageUrl: 'https://example.com/nike270.jpg',
      category: 'Fashion'
    },
    {
      name: 'Adidas Ultraboost 23',
      description: 'Performance running shoes with great comfort.',
      price: 160,
      stock: 35,
      imageUrl: 'https://example.com/ultraboost.jpg',
      category: 'Fashion'
    },
    {
      name: 'Levi’s 511 Slim Jeans',
      description: 'Classic slim-fit jeans for men.',
      price: 60,
      stock: 60,
      imageUrl: 'https://example.com/levis511.jpg',
      category: 'Fashion'
    },
    {
      name: 'Zara Men’s Cotton Shirt',
      description: 'Smart casual shirt for any occasion.',
      price: 35,
      stock: 45,
      imageUrl: 'https://example.com/zarashirt.jpg',
      category: 'Fashion'
    },
    {
      name: 'H&M Women’s Hoodie',
      description: 'Comfortable hoodie for casual wear.',
      price: 40,
      stock: 40,
      imageUrl: 'https://example.com/hmhoodie.jpg',
      category: 'Fashion'
    },
    {
      name: 'Rolex Submariner Watch',
      description: 'Luxury wristwatch for men.',
      price: 9500,
      stock: 3,
      imageUrl: 'https://example.com/rolexsubmariner.jpg',
      category: 'Fashion'
    },
    {
      name: 'Ray-Ban Aviator Sunglasses',
      description: 'Classic aviator design sunglasses.',
      price: 150,
      stock: 25,
      imageUrl: 'https://example.com/raybanaviator.jpg',
      category: 'Fashion'
    },
    {
      name: 'Gucci Leather Belt',
      description: 'Designer belt made from genuine leather.',
      price: 300,
      stock: 10,
      imageUrl: 'https://example.com/guccibelt.jpg',
      category: 'Fashion'
    },
    {
      name: 'Nike Sports Cap',
      description: 'Lightweight and breathable cap.',
      price: 25,
      stock: 80,
      imageUrl: 'https://example.com/nikecap.jpg',
      category: 'Fashion'
    },
    {
      name: 'Adidas Backpack',
      description: 'Durable backpack with laptop compartment.',
      price: 60,
      stock: 40,
      imageUrl: 'https://example.com/adidasbackpack.jpg',
      category: 'Fashion'
    },

    // Groceries
    {
      name: 'Royal Stallion Rice 50kg',
      description: 'Premium parboiled rice for family meals.',
      price: 45,
      stock: 100,
      imageUrl: 'https://example.com/rice.jpg',
      category: 'Groceries'
    },
    {
      name: 'Mama Gold Vegetable Oil 5L',
      description: 'Healthy vegetable oil for cooking.',
      price: 25,
      stock: 60,
      imageUrl: 'https://example.com/vegoil.jpg',
      category: 'Groceries'
    },
    {
      name: 'Honeywell Wheat Flour 10kg',
      description: 'Quality wheat flour for baking.',
      price: 20,
      stock: 80,
      imageUrl: 'https://example.com/wheatflour.jpg',
      category: 'Groceries'
    },
    {
      name: 'Golden Penny Spaghetti 500g',
      description: 'High-quality durum wheat spaghetti.',
      price: 3,
      stock: 200,
      imageUrl: 'https://example.com/spaghetti.jpg',
      category: 'Groceries'
    },
    {
      name: 'Nestle Milo 400g',
      description: 'Chocolate malt drink powder.',
      price: 5,
      stock: 150,
      imageUrl: 'https://example.com/milo.jpg',
      category: 'Groceries'
    },
    {
      name: 'Peak Milk Tin 400g',
      description: 'Full cream milk powder.',
      price: 6,
      stock: 120,
      imageUrl: 'https://example.com/peakmilk.jpg',
      category: 'Groceries'
    },
    {
      name: 'Lipton Yellow Label Tea 100 Bags',
      description: 'Refreshing black tea bags.',
      price: 7,
      stock: 90,
      imageUrl: 'https://example.com/lipton.jpg',
      category: 'Groceries'
    },
    {
      name: 'Indomie Noodles Chicken Flavor (40 pack)',
      description: 'Instant noodles loved by all.',
      price: 12,
      stock: 70,
      imageUrl: 'https://example.com/indomie.jpg',
      category: 'Groceries'
    },
    {
      name: 'Dangote Sugar 1kg',
      description: 'Refined granulated sugar.',
      price: 4,
      stock: 150,
      imageUrl: 'https://example.com/sugar.jpg',
      category: 'Groceries'
    },
    {
      name: 'Omo Detergent 1kg',
      description: 'Powerful cleaning detergent.',
      price: 8,
      stock: 100,
      imageUrl: 'https://example.com/omo.jpg',
      category: 'Groceries'
    },

    // Furniture
    {
      name: 'Wooden Dining Table Set',
      description: 'Modern dining table with 6 chairs.',
      price: 700,
      stock: 5,
      imageUrl: 'https://example.com/diningtable.jpg',
      category: 'Furniture'
    },
    {
      name: 'Leather Sofa 3-Seater',
      description: 'Comfortable leather sofa for living room.',
      price: 1200,
      stock: 6,
      imageUrl: 'https://example.com/leathersofa.jpg',
      category: 'Furniture'
    },
    {
      name: 'Office Chair Ergonomic',
      description: 'Adjustable chair for home office setup.',
      price: 150,
      stock: 20,
      imageUrl: 'https://example.com/officechair.jpg',
      category: 'Furniture'
    },
    {
      name: 'Queen Size Bed Frame',
      description: 'Sturdy and elegant wooden bed frame.',
      price: 800,
      stock: 7,
      imageUrl: 'https://example.com/bedframe.jpg',
      category: 'Furniture'
    },
    {
      name: 'Bookshelf 5-Tier',
      description: 'Spacious wooden bookshelf.',
      price: 250,
      stock: 15,
      imageUrl: 'https://example.com/bookshelf.jpg',
      category: 'Furniture'
    },
    {
      name: 'Study Table with Drawers',
      description: 'Compact table ideal for study or work.',
      price: 180,
      stock: 12,
      imageUrl: 'https://example.com/studytable.jpg',
      category: 'Furniture'
    },
    {
      name: 'Kitchen Cabinet Set',
      description: 'Modular kitchen storage cabinets.',
      price: 950,
      stock: 4,
      imageUrl: 'https://example.com/kitchencabinet.jpg',
      category: 'Furniture'
    },
    {
      name: 'TV Stand 60-inch',
      description: 'Stylish TV stand with storage shelves.',
      price: 220,
      stock: 10,
      imageUrl: 'https://example.com/tvstand.jpg',
      category: 'Furniture'
    },
    {
      name: 'Recliner Chair',
      description: 'Soft reclining chair for relaxation.',
      price: 600,
      stock: 8,
      imageUrl: 'https://example.com/recliner.jpg',
      category: 'Furniture'
    },
    {
      name: 'Wardrobe 3-Door',
      description: 'Spacious wardrobe with mirror door.',
      price: 850,
      stock: 5,
      imageUrl: 'https://example.com/wardrobe.jpg',
      category: 'Furniture'
    }
  ];

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true
  });

  console.log('✅ 40 products seeded successfully!');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
