// src/lib/sendGameKey.ts
import nodemailer from "nodemailer";
import { renderGameKeyEmail } from "@/templates/GameKeyEmail"; // Убедитесь, что этот файл существует

interface SendGameKeyEmailParams {
    to: string;
    userName: string;
    gameName: string;
    gameKey: string;
    purchaseDate: Date;
    price: number;
}

/**
 * Создает транспорт для отправки email
 * Поддерживает различные SMTP провайдеры
 */
function createEmailTransport() {
    // Получаем конфигурацию из переменных окружения
    // Поддержка как новых (SMTP_*), так и старых (MAIL_*) переменных
    const emailService = process.env.EMAIL_SERVICE; // 'gmail', 'smtp', 'sendgrid', etc.
    const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || "587");
    const smtpSecure = process.env.SMTP_SECURE === "true"; // true для порта 465
    const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.MAIL_PASS;

    // Конфигурация для Gmail
    if (emailService === "gmail") {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpUser,
                pass: smtpPassword, // Используйте App Password для Gmail
            },
        });
    }

    // Конфигурация для SendGrid
    if (emailService === "sendgrid") {
        return nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            port: 587,
            auth: {
                user: "apikey",
                pass: smtpPassword, // SendGrid API Key
            },
        });
    }

    // Конфигурация для Mailgun
    if (emailService === "mailgun") {
        return nodemailer.createTransport({
            host: "smtp.mailgun.org",
            port: 587,
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });
    }

    // Общая SMTP конфигурация
    if (smtpHost && smtpUser && smtpPassword) {
        return nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });
    }

    throw new Error("Email configuration is missing. Please set EMAIL_SERVICE or SMTP credentials.");
}

/**
 * Отправляет email с игровым ключом пользователю
 */
export async function sendGameKeyEmail(params: SendGameKeyEmailParams): Promise<void> {
    const { to, userName, gameName, gameKey, purchaseDate, price } = params;

    try {
        const transporter = createEmailTransport();

        // Генерируем HTML-содержимое письма
        const htmlContent = renderGameKeyEmail({
            userName,
            gameName,
            gameKey,
            purchaseDate,
            price,
        });

        // Текстовая версия письма (для клиентов без поддержки HTML)
        const textContent = `
Здравствуйте, ${userName}!

Спасибо за покупку в SMILESHOP!

Детали вашей покупки:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Игра: ${gameName}
Ваш ключ активации: ${gameKey}
Цена: ${price.toFixed(2)} ₽
Дата покупки: ${purchaseDate.toLocaleDateString('ru-RU')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Инструкция по активации:
1. Откройте клиент Steam/Epic Games/Origin (в зависимости от платформы)
2. Перейдите в раздел "Активировать продукт"
3. Введите ваш ключ: ${gameKey}
4. Следуйте инструкциям на экране

Важно: Сохраните это письмо! Ключ активации можно использовать только один раз.

Если у вас возникли проблемы с активацией, пожалуйста, свяжитесь с нашей службой поддержки.

С уважением,
Команда SMILESHOP
    `.trim();

        // Получаем smtpUser *вне* функции createEmailTransport, чтобы использовать в mailOptions
        const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER;

        // Настройки письма
        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || "SMILESHOP",
                // Используем smtpUser, полученное из process.env в текущей области видимости
                address: process.env.EMAIL_FROM || smtpUser || "noreply@smileshop.com",
            },
            to,
            subject: `Ваш ключ для игры ${gameName} - SMILESHOP`,
            text: textContent,
            html: htmlContent,
        };

        // Отправляем письмо
        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", {
            messageId: info.messageId,
            to,
            gameName,
        });

    } catch (error) {
        console.error("Error sending game key email:", error);

        // Логируем детали ошибки
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
            });
        }

        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Проверяет конфигурацию email (для тестирования)
 */
export async function verifyEmailConfiguration(): Promise<boolean> {
    try {
        const transporter = createEmailTransport();
        await transporter.verify();
        console.log("Email configuration is valid");
        return true;
    } catch (error) {
        console.error("Email configuration is invalid:", error);
        return false;
    }
}