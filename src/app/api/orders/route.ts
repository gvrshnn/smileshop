// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as crypto from "crypto";

interface ReceiptItem {
  Name: string;
  Price: number;
  Quantity: number;
  Amount: number;
  Tax: string;
  Ean13?: string;
}

// Делаем Phone необязательным в Receipt
interface Receipt {
  Email: string;
  Phone?: string; // Теперь необязательный
  Taxation: string;
  Items: ReceiptItem[];
}

interface TBankInitRequest {
  TerminalKey: string;
  Amount: number; // В копейках
  OrderId: string;
  Description?: string;
  Token: string;
  DATA?: Record<string, unknown>;
  Receipt?: Receipt;
}

interface TBankInitResponse {
  Success: boolean;
  ErrorCode: string;
  Message?: string;
  Details?: string;
  PaymentURL?: string;
  PaymentId?: string;
  TerminalKey?: string;
  OrderId?: string;
}

// --- Функция для генерации Token ---
function flattenValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  
  if (typeof v === "object" && !Array.isArray(v)) {
    const obj = v as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return keys.map(k => flattenValue(obj[k])).join('');
  }
  
  if (Array.isArray(v)) {
    const arr = v as unknown[];
    return arr.map(flattenValue).join('');
  }
  
  return String(v);
}

function generateToken(body: Record<string, unknown>, secret: string): string {
  const keysToSort = Object.keys(body)
    .filter(k => k !== 'Token' && body[k] !== undefined && body[k] !== null && body[k] !== '');

  keysToSort.sort();

  let signString = keysToSort.map(k => flattenValue(body[k])).join('');
  signString += secret;

  console.log("DEBUG FIXED: signString (first 200 chars):", signString.substring(0, 200));
  console.log("DEBUG FIXED: signString (length):", signString.length);

  return crypto.createHash('sha256').update(signString, 'utf8').digest('hex');
}
// --- Конец функции генерации Token ---

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const { userId, gameId, email, phone } = await req.json();
  
  if (!userId || !gameId) {
    return NextResponse.json({ error: "Отсутствуют userId или gameId" }, { status: 400 });
  }
  
  // Делаем phone необязательным, проверяем только email
  if (!email) {
    return NextResponse.json({ error: "Отсутствует email" }, { status: 400 });
  }
  
  if (parseInt(session.user.id) !== userId) {
    return NextResponse.json({ error: "Несанкционированный доступ" }, { status: 403 });
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });
  
  if (game.price == null || game.price <= 0) {
    return NextResponse.json({ error: "Некорректная цена игры." }, { status: 400 });
  }

  const keys = game.keys as string[];
  if (!keys || keys.length === 0) {
    return NextResponse.json({ error: "Нет доступных ключей" }, { status: 400 });
  }
  const key = keys[0];

  const localOrderId = `${Date.now()}-${userId}-${gameId}`;

  const order = await prisma.order.create({
    data: {
      userId,
      gameId,
      key,
      price: game.price,
    },
  });

  await prisma.game.update({
    where: { id: gameId },
    data: { keys: keys.slice(1) },
  });

  // --- Безопасное чтение и обрезка переменных окружения ---
  const terminalKey = (process.env.TINKOFF_TERMINAL_KEY || "").trim();
  const terminalPasswordRaw = process.env.TINKOFF_TERMINAL_PASSWORD || '';
  const terminalPassword = terminalPasswordRaw.trim().replace(/^"(.*)"$/, '$1');

  console.log("DEBUG: Raw TINKOFF_TERMINAL_PASSWORD from env:", JSON.stringify(terminalPasswordRaw));
  console.log("DEBUG: Processed TINKOFF_TERMINAL_PASSWORD:", JSON.stringify(terminalPassword));
  console.log("DEBUG: TINKOFF_TERMINAL_KEY from env:", terminalKey);

  if (!terminalKey || !terminalPassword) {
    console.error("TINKOFF_TERMINAL_KEY or TINKOFF_TERMINAL_PASSWORD is missing or empty after processing.");
    return NextResponse.json(
      { error: "Ошибка конфигурации: нет TerminalKey или Password" },
      { status: 500 }
    );
  }

  // --- Формирование полного payload согласно документации ---
  const amountInKopecks = Math.round(game.price * 100);
  
  // Формируем данные для чека
  const receiptItems: ReceiptItem[] = [
    {
      Name: `Цифровой ключ: ${game.title}`,
      Price: amountInKopecks,
      Quantity: 1,
      Amount: amountInKopecks,
      Tax: "vat20", // НДС 20% - уточните нужную ставку для вашего случая
      // Ean13 можно не указывать для цифровых товаров
    }
  ];

  // Создаем Receipt с опциональным phone
  const receipt: Receipt = {
    Email: email,
    // Добавляем Phone только если он есть и не пустой
    ...(phone && { Phone: phone.replace(/[^\d+]/g, '') }),
    Taxation: "osn",
    Items: receiptItems
  };

  type BaseRequestParamsType = Omit<TBankInitRequest, 'Token'>;

  // Формируем DATA с опциональным phone
  const baseRequestParams: BaseRequestParamsType = {
    TerminalKey: terminalKey,
    Amount: amountInKopecks,
    OrderId: localOrderId,
    Description: `Покупка цифрового ключа для игры ${game.title}`,
    DATA: {
      connection_type: "Widget",
      Email: email,
      // Добавляем Phone только если он есть
      ...(phone && { Phone: phone })
    },
    Receipt: receipt
  };

  const token = generateToken(baseRequestParams as Record<string, unknown>, terminalPassword);
  console.log("DEBUG: Generated Token:", token);

  const tBankRequestParams: TBankInitRequest = {
    ...baseRequestParams,
    Token: token,
  };

  // Логирование для отладки
  console.log("DEBUG: Terminal Password (first 5 chars for check):", terminalPassword.substring(0, 5) + '...');
  console.log("DEBUG: Full request body to T-Bank:", JSON.stringify(tBankRequestParams, null, 2));

  // https://securepay.tinkoff.ru/v2/Init
  // https://rest-api-test.tinkoff.ru/v2/Init

  try {
    const response = await fetch('https://rest-api-test.tinkoff.ru/v2/Init', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'YourApp/1.0'
      },
      body: JSON.stringify(tBankRequestParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`T-Bank Init HTTP error! Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tBankData: TBankInitResponse = await response.json();
    console.log("DEBUG: T-Bank Init Response:", JSON.stringify(tBankData, null, 2));

    if (tBankData.Success) {
      return NextResponse.json({
        ...order,
        paymentURL: tBankData.PaymentURL!,
        tBankPaymentId: tBankData.PaymentId || null,
      });
    } else {
      console.error("T-Bank Init API Error:", tBankData);
      return NextResponse.json(
        {
          error: "Ошибка создания платежа",
          details: tBankData.Message || tBankData.Details || "Неизвестная ошибка от T-Bank",
          errorCode: tBankData.ErrorCode
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Ошибка сети или обработки ответа при вызове T-Bank Init:", error);
    return NextResponse.json({ error: "Ошибка связи с T-Bank", details: errorMessage }, { status: 500 });
  }
}