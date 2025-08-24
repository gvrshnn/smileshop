import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const { userId, gameId } = await req.json();
  if (!userId || !gameId) {
    return NextResponse.json({ error: "Отсутствуют userId или gameId" }, { status: 400 });
  }

  if (parseInt(session.user.id) !== userId) {
    return NextResponse.json({ error: "Несанкционированный доступ" }, { status: 403 });
  }

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