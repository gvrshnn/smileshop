// ./src/app/api/verify/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return new Response(`
        <html>
          <head>
            <title>Ошибка подтверждения</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #ff4444; }
              .button { background: #01f501; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1 class="error">Ошибка подтверждения</h1>
            <p>Токен подтверждения не найден в ссылке.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "/"}" class="button">Перейти на главную</a>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Ищем токен в базе данных
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return new Response(`
        <html>
          <head>
            <title>Недействительный токен</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #ff4444; }
              .button { background: #01f501; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1 class="error">Недействительный токен</h1>
            <p>Токен подтверждения не найден или уже был использован.</p>
            <p>Возможно, вы уже подтвердили регистрацию или токен устарел.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "/"}" class="button">Перейти на главную</a>
          </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Проверяем, не истек ли токен
    if (new Date() > verificationToken.expiresAt) {
      // Удаляем истекший токен
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return new Response(`
        <html>
          <head>
            <title>Токен истек</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #ff4444; }
              .button { background: #01f501; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1 class="error">Срок действия токена истек</h1>
            <p>Токен подтверждения истек (действителен в течение 1 часа).</p>
            <p>Пожалуйста, попробуйте зарегистрироваться снова.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "/"}" class="button">Перейти на главную</a>
          </body>
        </html>
      `, {
        status: 410,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (existingUser) {
      // Удаляем токен, так как пользователь уже существует
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return new Response(`
        <html>
          <head>
            <title>Пользователь уже существует</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .warning { color: #ff9900; }
              .button { background: #01f501; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1 class="warning">Пользователь уже зарегистрирован</h1>
            <p>Пользователь с таким email уже существует в системе.</p>
            <p>Вы можете войти в свой аккаунт.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "/"}" class="button">Перейти на главную</a>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Создаем пользователя
    const newUser = await prisma.user.create({
      data: {
        email: verificationToken.email,
        password: verificationToken.password,
        isAdmin: false,
      },
    });

    // Удаляем использованный токен
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Возвращаем страницу успеха
    return new Response(`
      <html>
        <head>
          <title>Регистрация подтверждена</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #01f501; }
            .button { background: #01f501; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            .email { background: #f5f5f5; padding: 8px; border-radius: 4px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1 class="success">Регистрация успешно подтверждена!</h1>
          <p>Добро пожаловать в <strong>SMILESHOP</strong>!</p>
          <div class="email">${verificationToken.email}</div>
          <p>Ваш аккаунт создан и активирован. Теперь вы можете войти в систему и начать покупку игр.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "/"}" class="button">Перейти в магазин</a>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error("Verification error:", error);
    
    // Типизируем ошибку
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(`
      <html>
        <head>
          <title>Ошибка сервера</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #ff4444; }
            .button { background: #01f501; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1 class="error">Произошла ошибка</h1>
          <p>Не удалось обработать запрос на подтверждение регистрации.</p>
          <p>Попробуйте позже или обратитесь в поддержку.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "/"}" class="button">Перейти на главную</a>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}