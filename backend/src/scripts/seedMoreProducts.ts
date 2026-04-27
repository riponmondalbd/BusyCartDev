import { prisma } from "../prisma/prisma";

type ProductSeed = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
};

const productSeeds: ProductSeed[] = [
  {
    name: "Aurora Smart Hub",
    description: "Centralized smart control unit for connected home setups.",
    price: 129.99,
    stock: 34,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Nova Street Jacket",
    description: "Lightweight all-season jacket with urban tactical fit.",
    price: 89.5,
    stock: 52,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Chefline Pro Pan Set",
    description: "Non-stick cookware set designed for daily heavy cooking.",
    price: 149.0,
    stock: 21,
    image:
      "https://images.unsplash.com/photo-1584990347449-a47f5f5b7f8f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Radiant Glow Serum",
    description: "Hydrating vitamin blend serum for daily skin routine.",
    price: 39.99,
    stock: 64,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Titan Flex Mat",
    description: "High-density workout mat with anti-slip surface.",
    price: 44.0,
    stock: 70,
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Pixel Quest Board",
    description: "Family strategy game with modular adventure boards.",
    price: 34.75,
    stock: 46,
    image:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Focus Depth Journal",
    description: "Guided productivity notebook for weekly planning.",
    price: 18.0,
    stock: 83,
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Harvest Grain Pack",
    description: "Mixed whole grains suitable for meal prep recipes.",
    price: 14.5,
    stock: 95,
    image:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "DriveMax Cleaner Kit",
    description: "Complete interior and exterior detailing kit.",
    price: 28.99,
    stock: 57,
    image:
      "https://images.unsplash.com/photo-1607861716497-e65ab29fc7ac?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Vital Balance Bottle",
    description: "Insulated hydration bottle for daily wellness goals.",
    price: 24.99,
    stock: 78,
    image:
      "https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Quantum Desk Light",
    description: "Adaptive brightness lamp for focus and comfort.",
    price: 56.49,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Urban Motion Sneakers",
    description: "Breathable daily wear sneakers with cushioned sole.",
    price: 72.0,
    stock: 49,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Eco Fresh Containers",
    description: "Reusable food storage set for kitchen organization.",
    price: 32.25,
    stock: 58,
    image:
      "https://images.unsplash.com/photo-1470549638415-0a0755be0619?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Pure Care Cleanser",
    description: "Daily gentle cleanser suitable for all skin types.",
    price: 21.5,
    stock: 67,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Peak Runner Rope",
    description: "Weighted jump rope for cardio training sessions.",
    price: 26.0,
    stock: 42,
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Logic Cube Set",
    description: "Puzzle cube collection for memory and logic practice.",
    price: 19.25,
    stock: 73,
    image:
      "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Atlas Reading Lamp",
    description: "Compact reading lamp with warm and cool tone modes.",
    price: 27.8,
    stock: 51,
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Nature Seed Mix",
    description: "Healthy mixed seeds with high protein content.",
    price: 12.99,
    stock: 88,
    image:
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Turbo Dash Mount",
    description: "Universal dashboard mount with vibration lock.",
    price: 17.5,
    stock: 61,
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Zen Pulse Massager",
    description: "Portable deep tissue massager with adjustable heads.",
    price: 64.99,
    stock: 36,
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
  },
];

async function main() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (categories.length === 0) {
    throw new Error("No active categories found. Seed categories first.");
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (let index = 0; index < productSeeds.length; index += 1) {
    const seed = productSeeds[index];
    const category = categories[index % categories.length];

    const uniqueName = `${seed.name} ${index + 1}`;

    const existingProduct = await prisma.product.findFirst({
      where: {
        name: uniqueName,
        categoryId: category.id,
      },
    });

    if (existingProduct) {
      skippedCount += 1;
      continue;
    }

    await prisma.product.create({
      data: {
        name: uniqueName,
        description: `${seed.description} Category: ${category.name}.`,
        price: seed.price,
        stock: seed.stock,
        categoryId: category.id,
        images: [seed.image],
        numReviews: 0,
        averageRating: 0,
      },
    });

    createdCount += 1;
    console.log(`Created: ${uniqueName} -> ${category.name}`);
  }

  console.log(
    `Done. Added ${createdCount} products across ${categories.length} categories, skipped ${skippedCount} existing.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed additional products:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
