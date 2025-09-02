// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Валидация входных данных
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен содержать минимум 6 символов" },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    // Проверяем, есть ли уже неподтвержденная регистрация
    const existingToken = await prisma.emailVerificationToken.findFirst({
      where: { email },
    });

    if (existingToken) {
      // Удаляем старый токен
      await prisma.emailVerificationToken.delete({
        where: { id: existingToken.id },
      });
    }

    // Хешируем пароль
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создаем токен подтверждения
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1 час

    // Сохраняем токен в базу
    await prisma.emailVerificationToken.create({
      data: {
        token,
        email,
        password: hashedPassword,
        expiresAt,
      },
    });

    // Настраиваем nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Формируем ссылку подтверждения
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/api/verify?token=${token}`;

    // Отправляем письмо
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Подтверждение регистрации в SMILESHOP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #01f501;">Добро пожаловать в SMILESHOP!</h2>
          <p>Спасибо за регистрацию в нашем магазине игровых ключей.</p>
          <p>Для завершения регистрации перейдите по ссылке:</p>
          <a href="${verificationUrl}" 
             style="background-color: #01f501; color: black; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block; 
                    font-weight: bold; margin: 16px 0;">
            Подтвердить регистрацию
          </a>
          <p>Ссылка действительна в течение 1 часа.</p>
          <p>Если вы не регистрировались в SMILESHOP, просто игнорируйте это письмо.</p>
          <hr style="margin: 20px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Команда SMILESHOP<br>
            Магазин игровых ключей
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { 
        message: "Письмо с подтверждением отправлено на ваш email",
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}