import { prisma } from "../prisma/prisma";

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
  { name: "Sports & Outdoors", slug: "sports-outdoors" },
  { name: "Toys & Games", slug: "toys-games" },
  { name: "Books", slug: "books" },
  { name: "Grocery", slug: "grocery" },
  { name: "Automotive", slug: "automotive" },
  { name: "Health & Wellness", slug: "health-wellness" },
];

const productPrefixes = {
  Electronics: ["Quantum", "Neo", "Cyber", "Apex", "Volt"],
  Fashion: ["Vogue", "Silk", "Neon", "Urban", "Glow"],
  "Home & Kitchen": ["Smart", "Chef", "Lux", "Eco", "Pure"],
  "Beauty & Personal Care": ["Aura", "Bio", "Luxe", "Dew", "Radiant"],
  "Sports & Outdoors": ["Titan", "Swift", "Rogue", "Peak", "Core"],
  "Toys & Games": ["Pixel", "Fun", "Logic", "Play", "Quest"],
  Books: ["Chronicle", "Atlas", "Sage", "Myth", "Focus"],
  Grocery: ["Prime", "Nature", "Zest", "Pure", "Harvest"],
  Automotive: ["Turbo", "Drive", "Shift", "Gear", "Velocity"],
  "Health & Wellness": ["Zen", "Vital", "Flow", "Balance", "Pulse"],
};

const imageMap: Record<string, string> = {
  Electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=500&q=60",
  Fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=60",
  "Home & Kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=60",
  "Beauty & Personal Care": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=60",
  "Sports & Outdoors": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=60",
  "Toys & Games": "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=500&q=60",
  Books: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=60",
  Grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=60",
  Automotive: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=60",
  "Health & Wellness": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=60",
};

async function main() {
  console.log("🚀 Starting extensive catalog seed...");

  for (const catData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: {
        name: catData.name,
        slug: catData.slug,
        image: imageMap[catData.name],
      },
    });

    console.log(`📂 Category: ${category.name}`);

    const productCount = Math.floor(Math.random() * 6) + 10; // 10 to 15
    const prefixes = productPrefixes[catData.name as keyof typeof productPrefixes];

    for (let i = 1; i <= productCount; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const name = `${prefix} ${catData.name.split(' ')[0]} ${i}`;
      const price = parseFloat((Math.random() * 200 + 20).toFixed(2));
      const stock = Math.floor(Math.random() * 100) + 10;

      await prisma.product.create({
        data: {
          name,
          description: `High-quality ${name} from our ${catData.name} collection. Engineered for excellence and durability.`,
          price,
          stock,
          categoryId: category.id,
          images: [imageMap[catData.name]],
        },
      });
    }
    console.log(`   ✅ Seeded ${productCount} products`);
  }

  console.log("✨ Catalog seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
