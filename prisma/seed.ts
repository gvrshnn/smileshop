import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.game.createMany({
    data: [
      {
        title: "Cyberpunk 2077",
        description: "RPG в будущем мире",
        price: 1999,
        imageUrl: "https://placehold.co/600x400",
        platform: "PC",
        keys: JSON.stringify(["CP-123", "CP-456"]),
      },
      {
        title: "The Witcher 3",
        description: "Фэнтези RPG",
        price: 999,
        imageUrl: "https://placehold.co/600x400",
        platform: "PC",
        keys: JSON.stringify(["W3-001"]),
      },
    ],
  });
}

main()
  .then(() => console.log("База заполнена"))
  .catch((e) => console.error(e))
  .finally(() => process.exit());
