import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Начало заполнения базы данных играми...");

  // Создаем новые игры
  await prisma.game.createMany({
    data: [
      {
        title: "Cyberpunk 2077",
        description: "Игра в жанре action-RPG с открытым миром в антиутопичном Найт-Сити",
        price: 1999,
        imageUrl: "https://images.ctfassets.net/rporu91m20dc/5VHcKLa9jF5cHYzcBQk8v2/9c92c5cffc0c86e0d3e3d36e6e4c4e2f/Cyberpunk-2077-box-art.jpg",
        platform: "STEAM",
        keys: ["CP2077-ST-001", "CP2077-ST-002", "CP2077-ST-003"],
      },
      {
        title: "Hogwarts Legacy",
        description: "Игра в мире Гарри Поттера с открытым миром и магическими приключениями",
        price: 2499,
        imageUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202011/0919/c0u2N9FbB1APRrrtu91MkNd7.png",
        platform: "STEAM",
        keys: ["HWL-ST-987", "HWL-ST-988"],
      },
      {
        title: "Elden Ring",
        description: "Фэнтезийная action-RPG с открытым миром от создателей Dark Souls",
        price: 2999,
        imageUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202107/0712/4f0hJpRfJpYqJg5U4GtTtX7w.png",
        platform: "XBOX",
        keys: ["ELDEN-XB-555", "ELDEN-XB-556", "ELDEN-XB-557", "ELDEN-XB-558"],
      },
      {
        title: "Starfield",
        description: "Эпичная космическая RPG от создателей Skyrim и Fallout",
        price: 3499,
        imageUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202202/2322/8Q8fQ4Wf4q2Q4Q4Q4Q4Q4Q4Q.png",
        platform: "XBOX",
        keys: ["STAR-XB-111", "STAR-XB-112"],
      },
      {
        title: "The Legend of Zelda: Tears of the Kingdom",
        description: "Приключение Линка в мире Хайрула с новыми способностями и локациями",
        price: 3999,
        imageUrl: "https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000063709/32b858cf6e1821b484d587c4aab5ea9b1b1af6c0cae6e7311b1b6e2c77d2c5f0",
        platform: "PS",
        keys: ["ZELDA-PS-777", "ZELDA-PS-778", "ZELDA-PS-779"],
      },
      {
        title: "God of War: Ragnarok",
        description: "Продолжение саги о Кратосе и Атреусе в скандинавской мифологии",
        price: 4499,
        imageUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202107/3109/4o0QPv7X8D5sQ5Q5Q5Q5Q5Q5Q.png",
        platform: "PS",
        keys: ["GOWR-PS-321", "GOWR-PS-322"],
      },
      {
        title: "Forza Horizon 5 (No Keys)",
        description: "Гоночная игра с открытым миром в Мексике без доступных ключей",
        price: 2799,
        imageUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202108/0419/4o0QPv7X8D5sQ5Q5Q5Q5Q5Q5Q.png",
        platform: "STEAM",
        keys: [], // Пустой массив ключей
      },
    ],
  });

  console.log("Игры успешно добавлены в базу данных!");
}

main()
  .catch((e) => {
    console.error("Ошибка при заполнении базы данных:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });