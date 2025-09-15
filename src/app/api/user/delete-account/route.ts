// src/app/api/user/delete-account/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import bcrypt from "bcrypt"; // Понадобится, если потребуется подтверждение паролем

export async function POST(req: NextRequest) { // Или DELETE, если хотите RESTful
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
    }

    const body = await req.json();
    // const { password } = body; // Опционально: запросить пароль для подтверждения

    const userId = parseInt(session.user.id, 10);

    // Опционально: проверить пароль перед удалением
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (!user || !(await bcrypt.compare(password, user.password))) {
    //   return NextResponse.json({ error: "Неверный пароль для подтверждения" }, { status: 400 });
    // }

    // Удаление пользователя. Это также удалит связанные записи благодаря onDelete: Cascade
    // в вашей схеме Prisma (User -> Order).
    await prisma.user.delete({
      where: { id: userId },
    });

    // NextAuth автоматически инвалидирует сессию после удаления пользователя,
    // так как пользователь больше не существует в БД.
    // Клиентская часть должна обработать редирект или выход.

    return NextResponse.json({ message: "Аккаунт успешно удален" }, { status: 200 });

  } catch (error) {
    console.error("Ошибка при удалении аккаунта:", error);
    // Проверьте, не является ли ошибка связанной с тем, что пользователя уже нет
    // if (error.code === 'P2025') { // Prisma error code for record not found
    //    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    // }
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}