// src/app/api/webhook-tbank/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGameKeyEmail } from "@/lib/sendGameKey";
import * as crypto from "crypto";

interface TBankWebhookPayload {
  TerminalKey: string;
  OrderId: string;
  Success: boolean;
  Status: string;
  PaymentId: string;
  ErrorCode: string;
  Amount: number;
  CardId?: string;
  Pan?: string;
  ExpDate?: string;
  Token: string;
  [key: string]: unknown;
}

/**
 * Проверка подписи вебхука от T-Bank
 */
function verifyWebhookSignature(
  payload: TBankWebhookPayload,
  secret: string
): boolean {
  const receivedToken = payload.Token;
  
  // Создаем объект для генерации подписи (исключаем Token)
  const paramsForToken: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(payload)) {
    if (key !== 'Token' && value !== undefined && value !== null && value !== '') {
      paramsForToken[key] = value;
    }
  }
  
  // Добавляем Password
  paramsForToken['Password'] = secret;
  
  // Сортируем ключи
  const sortedKeys = Object.keys(paramsForToken).sort();
  
  // Объединяем значения
  const signString = sortedKeys.map(key => {
    const value = paramsForToken[key];
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }).join('');
  
  // Генерируем токен
  const calculatedToken = crypto
    .createHash('sha256')
    .update(signString, 'utf8')
    .digest('hex');
  
  console.log("Webhook signature verification:", {
    received: receivedToken,
    calculated: calculatedToken,
    match: receivedToken === calculatedToken
  });
  
  return receivedToken === calculatedToken;
}

export async function POST(req: NextRequest) {
  try {
    const payload: TBankWebhookPayload = await req.json();
    
    console.log("T-Bank webhook received:", JSON.stringify(payload, null, 2));
    
    // Проверяем наличие необходимых полей
    if (!payload.OrderId || !payload.Status) {
      console.error("Invalid webhook payload: missing OrderId or Status");
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }
    
    // Получаем секретный ключ
    const terminalPassword = (process.env.TINKOFF_TERMINAL_PASSWORD || '')
      .trim()
      .replace(/^"(.*)"$/, '$1');
    
    if (!terminalPassword) {
      console.error("TINKOFF_TERMINAL_PASSWORD is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // Проверяем подпись
    const isValidSignature = verifyWebhookSignature(payload, terminalPassword);
    
    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }
    
    // Обрабатываем только успешные платежи со статусом CONFIRMED
    if (payload.Success && payload.Status === "CONFIRMED") {
      console.log(`Payment confirmed for order: ${payload.OrderId}`);
      
      // Извлекаем данные из OrderId (формат: timestamp-userId-gameId)
      const orderIdParts = payload.OrderId.split('-');
      
      if (orderIdParts.length < 3) {
        console.error("Invalid OrderId format:", payload.OrderId);
        return NextResponse.json({ ok: true }); // Возвращаем OK, чтобы не повторять вебхук
      }
      
      const userId = parseInt(orderIdParts[1]);
      const gameId = parseInt(orderIdParts[2]);
      
      // Получаем информацию о заказе из БД
      const order = await prisma.order.findFirst({
        where: {
          userId,
          gameId,
        },
        include: {
          user: true,
          game: true,
        },
        orderBy: {
          purchaseDate: 'desc',
        },
      });
      
      if (!order) {
        console.error(`Order not found for userId: ${userId}, gameId: ${gameId}`);
        return NextResponse.json({ ok: true });
      }
      
      // Проверяем, что у нас есть необходимые данные
      if (!order.user.email || !order.key) {
        console.error("Missing email or key in order:", order.id);
        return NextResponse.json({ ok: true });
      }
      
      // Отправляем email с игровым ключом
      try {
        await sendGameKeyEmail({
          to: order.user.email,
          userName: order.user.email.split('@')[0], // Используем часть email как имя
          gameName: order.game.title,
          gameKey: order.key,
          purchaseDate: order.purchaseDate,
          price: order.price,
        });
        
        console.log(`Game key email sent successfully to ${order.user.email}`);
        
        // Опционально: обновляем статус заказа
        await prisma.order.update({
          where: { id: order.id },
          data: {
            // Можно добавить поле emailSent: true, если нужно
            // emailSent: true,
          },
        });
        
      } catch (emailError) {
        console.error("Failed to send game key email:", emailError);
        // Не возвращаем ошибку, чтобы T-Bank не повторял вебхук
        // В продакшене можно добавить систему повторных попыток
      }
    } else {
      console.log(`Payment status: ${payload.Status}, Success: ${payload.Success}`);
    }
    
    // Всегда возвращаем OK для T-Bank
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Error processing T-Bank webhook:", error);
    
    // Возвращаем 200, чтобы T-Bank не повторял запрос
    return NextResponse.json({ ok: true });
  }
}

// Разрешаем только POST запросы
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}