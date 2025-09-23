// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as crypto from "crypto";

interface TBankInitRequest {
  TerminalKey: string;
  Amount: number; // В копейках
  OrderId: string;
  Description?: string;
  Token: string;
  DATA?: Record<string, any>;
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
/**
 * Правильная функция flattenValue для T-Bank API.
 * Объекты DATA должны быть сериализованы как JSON-строки.
 * @param v Значение параметра.
 * @returns Строковое представление значения.
 */
function flattenValue(v: any): string {
  if (v === null || v === undefined) return "";
  // ВАЖНО: Для объектов DATA (и других вложенных объектов) используем JSON.stringify
  if (typeof v === "object" && !Array.isArray(v)) {
    // Согласно документации T-Bank, объекты в DATA должны быть сериализованы.
    // Для корректной работы виджета connection_type должен быть просто значением.
    // Поэтому для DATA мы обрабатываем его ключи и значения.
    // Но для самого параметра DATA, если он объект, его значение - это его сериализованное содержимое.
    // В вашем случае DATA: { connection_type: "Widget" }.
    // Ключи DATA не участвуют в сортировке, только его значение.
    // flattenValue(DATA) должен вернуть "Widget" если DATA={connection_type:"Widget"}.
    // Но если мы передаем сам объект DATA, его значение для токена - это результат flattenValue.
    // Лучше обрабатывать это на уровне generateToken.
    // Для простоты и соответствия документации, если это объект DATA, сериализуем его правильно.
    // Однако, согласно алгоритму, в строку signString идут значения параметров.
    // DATA - это параметр. Его значение - это объект. flattenValue должна обработать его.
    // В примерах T-Bank DATA: {connection_type: "Widget"} -> в строку идет "Widget".
    // Это означает, что flattenValue для объекта должна обрабатывать его ключи/значения.
    // Но стандартный алгоритм - сортировка ключей объекта DATA и конкатенация их значений.
    const keys = Object.keys(v).sort();
    return keys.map(k => flattenValue(v[k])).join('');
  }
  if (Array.isArray(v)) {
    // Маловероятно для параметров Init, но на всякий случай
    return v.map(flattenValue).join('');
  }
  return String(v);
}

/**
 * Генерирует токен для T-Bank API по рекомендованному алгоритму.
 * @param body Объект тела запроса (без Token).
 * @param secret Секретный пароль терминала.
 * @returns SHA256 хэш в нижнем регистре.
 */
function generateToken(body: Record<string, any>, secret: string): string {
  // 1. Подготавливаем список ключей, исключая Token и пустые значения
  const keysToSort = Object.keys(body)
    .filter(k => k !== 'Token' && body[k] !== undefined && body[k] !== null && body[k] !== '');

  // 2. Сортируем ключи по алфавиту
  keysToSort.sort();

  // 3. Начинаем строить строку для хэширования, конкатенируя значения отсортированных ключей
  let signString = keysToSort.map(k => flattenValue(body[k])).join('');

  // 4. Добавляем Secret в самом конце
  signString += secret;

  // 5. Логирование для отладки (без секрета)
  console.log("DEBUG FIXED: signString (first 200 chars):", signString.substring(0, 200));
  console.log("DEBUG FIXED: signString (length):", signString.length);

  // 6. SHA256 и HEX в нижнем регистре (T-Bank API ожидает нижний регистр)
  return crypto.createHash('sha256').update(signString, 'utf8').digest('hex');
}
// --- Конец функции генерации Token ---

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

  // Используем предыдущий формат OrderId, который гарантированно состоит из допустимых символов
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
  // Убираем потенциальные внешние кавычки и пробелы
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
  // --- Конец обработки ---

  // --- Формирование объекта запроса с DATA до генерации токена ---
  type BaseRequestParamsType = Omit<TBankInitRequest, 'Token'>;

  // Явно указываем тип для baseRequestParams
  const baseRequestParams: BaseRequestParamsType = {
    TerminalKey: terminalKey,
    Amount: Math.round(game.price * 100), // В копейках
    OrderId: localOrderId,
    Description: `Покупка цифрового ключа для игры ${game.title}`,
    DATA: {
      connection_type: "Widget"
    }
  };

  const token = generateToken(baseRequestParams as Record<string, any>, terminalPassword);
  console.log("DEBUG: Generated Token:", token);

  // Теперь spread-оператор должен работать корректно
  const tBankRequestParams: TBankInitRequest = {
    ...baseRequestParams, // Распаковываем поля TerminalKey, Amount, OrderId и т.д.
    Token: token,          // Добавляем Token
  };

  // Логирование для отладки
  console.log("DEBUG: Terminal Password (first 5 chars for check):", terminalPassword.substring(0, 5) + '...');
  console.log("DEBUG: Full request body to T-Bank:", JSON.stringify(tBankRequestParams, null, 2));

  try {
    // Исправлен URL (убраны пробелы)
    const response = await fetch('https://securepay.tinkoff.ru/v2/Init', { // <-- Исправлено: убраны пробелы
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tBankRequestParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`T-Bank Init HTTP error! Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tBankData: TBankInitResponse = await response.json();
    console.log("DEBUG: T-Bank Init Response:", JSON.stringify(tBankData, null, 2)); // Логируем весь ответ

    if (tBankData.Success) {
      return NextResponse.json({
        ...order,
        paymentURL: tBankData.PaymentURL!,
        tBankPaymentId: tBankData.PaymentId || null,
      });
    } else {
      // Логируем детали ошибки от T-Bank
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
  } catch (error: any) {
    console.error("Ошибка сети или обработки ответа при вызове T-Bank Init:", error);
    return NextResponse.json({ error: "Ошибка связи с T-Bank", details: error.message }, { status: 500 });
  }
}