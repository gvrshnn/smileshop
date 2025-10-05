// src/templates/GameKeyEmail.tsx

interface GameKeyEmailProps {
  userName: string;
  gameName: string;
  gameKey: string;
  purchaseDate: Date;
  price: number;
}

/**
 * Генерирует HTML-шаблон письма с игровым ключом
 * Использует инлайновые стили для совместимости с почтовыми клиентами
 */
export function renderGameKeyEmail(props: GameKeyEmailProps): string {
  const { userName, gameName, gameKey, purchaseDate, price } = props;
  
  const formattedDate = purchaseDate.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const formattedPrice = price.toFixed(2);
  
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ваш игровой ключ - SMILESHOP</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🎮 SMILESHOP
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Спасибо за вашу покупку!
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Здравствуйте, <strong>${escapeHtml(userName)}</strong>!
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                Ваш заказ успешно обработан. Ниже вы найдете ваш игровой ключ активации.
              </p>
              
              <!-- Game Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 16px; color: #333333; font-size: 20px; font-weight: 600;">
                  ${escapeHtml(gameName)}
                </h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">
                      Дата покупки:
                    </td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right; font-weight: 500;">
                      ${formattedDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">
                      Цена:
                    </td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right; font-weight: 500;">
                      ${formattedPrice} ₽
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Activation Key -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0 0 12px; color: rgba(255, 255, 255, 0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Ваш ключ активации
                </p>
                <div style="background-color: rgba(255, 255, 255, 0.15); border: 2px dashed rgba(255, 255, 255, 0.3); border-radius: 6px; padding: 16px; margin-bottom: 12px;">
                  <code style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace; word-break: break-all;">
                    ${escapeHtml(gameKey)}
                  </code>
                </div>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 13px;">
                  ⚠️ Сохраните этот ключ! Он может быть использован только один раз.
                </p>
              </div>
              
              <!-- Instructions -->
              <div style="background-color: #fff9e6; border-left: 4px solid #ffc107; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 12px; color: #333333; font-size: 16px; font-weight: 600;">
                  📋 Как активировать ключ:
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Откройте клиент вашей игровой платформы (Steam, Epic Games, Origin и т.д.)</li>
                  <li style="margin-bottom: 8px;">Найдите раздел "Активировать продукт" или "Добавить игру"</li>
                  <li style="margin-bottom: 8px;">Введите ваш ключ активации</li>
                  <li style="margin-bottom: 0;">Следуйте инструкциям на экране для завершения активации</li>
                </ol>
              </div>
              
              <!-- Support -->
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <p style="margin: 0 0 12px; color: #666666; font-size: 14px;">
                  Возникли проблемы с активацией?
                </p>
                <a href="mailto:support@smileshop.com" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                  Связаться с поддержкой
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px; color: #999999; font-size: 13px;">
                Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
              </p>
              <p style="margin: 0; color: #999999; font-size: 13px;">
                © ${new Date().getFullYear()} SMILESHOP. Все права защищены.
              </p>
              <div style="margin-top: 20px;">
                <a href="https://smileshop.com" style="color: #667eea; text-decoration: none; font-size: 13px; margin: 0 10px;">
                  Сайт
                </a>
                <span style="color: #cccccc;">|</span>
                <a href="https://smileshop.com/terms" style="color: #667eea; text-decoration: none; font-size: 13px; margin: 0 10px;">
                  Условия
                </a>
                <span style="color: #cccccc;">|</span>
                <a href="https://smileshop.com/privacy" style="color: #667eea; text-decoration: none; font-size: 13px; margin: 0 10px;">
                  Конфиденциальность
                </a>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Экранирует HTML-специальные символы
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}