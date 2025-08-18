import { prisma } from "../src/lib/prisma";

async function main() {
  // Удаляем существующие данные (опционально, для чистоты тестов)
  await prisma.order.deleteMany(); // Удаляем сначала заказы
  await prisma.game.deleteMany();  // Затем игры
  await prisma.user.deleteMany();  // И пользователей, если нужно

  console.log("Старые данные удалены.");

  // Создаем новые игры
  await prisma.game.createMany({
    data: [
      {
        title: "Hades",
        description: "Рогалик о побеге из подземного мира",
        price: 899,
        imageUrl: "https://placehold.co/600x400?text=Hades",
        platform: "STEAM",
        keys: ["HADES-ST-001", "HADES-ST-002", "HADES-ST-003"],
      },
      {
        title: "Stardew Valley",
        description: "Уютная ферма и жизнь в деревне",
        price: 499,
        imageUrl: "https://placehold.co/600x400?text=Stardew+Valley",
        platform: "STEAM",
        keys: ["SDV-ST-987", "SDV-ST-988"],
      },
      {
        title: "Halo Infinite",
        description: "Эпическое возвращение Master Chief",
        price: 1499,
        imageUrl: "https://placehold.co/600x400?text=Halo+Infinite",
        platform: "XBOX",
        keys: ["HALO-XB-555", "HALO-XB-556", "HALO-XB-557", "HALO-XB-558"],
      },
      {
        title: "Forza Horizon 5",
        description: "Гоночки по Мексике",
        price: 1999,
        imageUrl: "https://placehold.co/600x400?text=Forza+Horizon+5",
        platform: "XBOX",
        keys: ["FH5-XB-111", "FH5-XB-112"],
      },
      {
        title: "Spider-Man Remastered",
        description: "Веб-качели Нью-Йорка",
        price: 1799,
        imageUrl: "https://placehold.co/600x400?text=Spider-Man",
        platform: "PS",
        keys: ["SPDR-PS-777", "SPDR-PS-778", "SPDR-PS-779"],
      },
      {
        title: "God of War: Ragnarok",
        description: "Сага о Кратосе и Атреусе",
        price: 2499,
        imageUrl: "https://placehold.co/600x400?text=GOW+Ragnarok",
        platform: "PS",
        keys: ["GOWR-PS-321", "GOWR-PS-322"],
      },
      {
        title: "Elden Ring (No Keys)",
        description: "Игра года без ключей для теста",
        price: 1999,
        imageUrl: "https://placehold.co/600x400?text=Elden+Ring",
        platform: "STEAM",
        keys: [], // Пустой массив ключей
      },
    ],
  });

  console.log("Новые игры добавлены.");

  // Создаем тестовых пользователей
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: await hashPassword("password123"), // Предполагается, что функция hashPassword существует или используется bcrypt напрямую
      isAdmin: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: await hashPassword("password123"),
      isAdmin: false,
    },
  });

  console.log("Тестовые пользователи созданы:", adminUser.email, regularUser.email);

  // Создаем тестовый заказ (опционально)
  // Найдем игру и пользователя для заказа
  const gameForOrder = await prisma.game.findFirst({
    where: {
      title: "Hades"
    }
  });

  if (gameForOrder) {
    const testOrder = await prisma.order.create({
      data: {
        userId: regularUser.id,
        gameId: gameForOrder.id,
        key: "HADES-ST-001", // Ключ, который был у игры
        price: gameForOrder.price,
      },
    });
    console.log("Тестовый заказ создан:", testOrder.id);

    // Обновим игру, убрав использованный ключ (имитация покупки)
    const updatedKeys = (gameForOrder.keys as string[]).filter(k => k !== "HADES-ST-001");
    await prisma.game.update({
      where: { id: gameForOrder.id },
      data: { keys: updatedKeys }
    });
    console.log("Ключ удален из инвентаря игры.");
  }

  console.log("База данных успешно заполнена новыми тестовыми данными!");
}

// Простая функция хеширования (в реальном приложении используйте bcrypt напрямую как в auth/route.ts)
async function hashPassword(password: string): Promise<string> {
  // В целях упрощения seed скрипта, можно использовать простую замену.
  // В реальном приложении ВСЕГДА используйте bcrypt.
  // return require('crypto').createHash('sha256').update(password).digest('hex');
  // Для совместимости с bcrypt, как в основном приложении:
  const bcrypt = (await import('bcrypt')).default; // Динамический импорт внутри функции
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}


main()
  .catch((e) => {
    console.error("Ошибка при заполнении базы данных:", e);
    process.exit(1); // Выход с кодом ошибки
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
