// src/app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Получаем сессию пользователя
    const session = await getServerSession(authOptions);

    // 2. Проверяем, авторизован ли пользователь
    if (!session || !session.user?.id) { // Используем ID из сессии для большей безопасности
      return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
    }

    // 3. Получаем данные из тела запроса
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    // 4. Базовая валидация
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Старый и новый пароли обязательны" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Новый пароль должен содержать минимум 6 символов" }, { status: 400 });
    }

    // 5. Находим пользователя в базе данных по ID из сессии
    // Это предпочтительнее, чем искать по email из body запроса
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id, 10) }, // Убедитесь, что ID в сессии - число
    });

    if (!user) {
      // Это маловероятно, если сессия активна, но проверим
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // 6. Проверяем старый пароль
    // Убедитесь, что в БД поле называется `password`. В предоставленном коде для register оно так называется.
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return NextResponse.json({ error: "Неверный старый пароль" }, { status: 400 });
    }

    // 7. Хэшируем новый пароль
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 8. Обновляем пароль в базе данных
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    // 9. Возвращаем успешный ответ
    return NextResponse.json({ message: "Пароль успешно изменен" }, { status: 200 });

  } catch (error) {
    console.error("Ошибка при изменении пароля:", error);
    // Всегда возвращайте JSON в Next.js API Routes
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}