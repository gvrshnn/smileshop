import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, gameId } = await req.json();

  // Находим игру
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });

  // Берём первый свободный ключ
  const keys = game.keys as string[];
  if (!keys || keys.length === 0) {
    return NextResponse.json({ error: "Нет доступных ключей" }, { status: 400 });
  }
  const key = keys[0];

  // Создаём заказ
  const order = await prisma.order.create({
    data: {
      userId,
      gameId,
      key,
      price: game.price,
    },
  });

  // Удаляем использованный ключ из массива
  await prisma.game.update({
    where: { id: gameId },
    data: {
      keys: keys.slice(1),
    },
  });

  return NextResponse.json(order);
}
