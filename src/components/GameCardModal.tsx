// ./src/components/GameCardModal.tsx
"use client";
import { Modal, Button, message } from "antd";
import { useSession } from "next-auth/react";
import { Game } from "@prisma/client";

interface Props {
  game: Game | null;
  open: boolean;
  onClose: () => void;
  // onBuy убран, так как логика покупки теперь через T-Bank
}

export default function GameCardModal({ game, open, onClose }: Props) {
  const { data: session } = useSession();

  if (!game) return null;

  // Функция для обработки покупки через T-Bank
  const handleBuy = async () => {
    if (!session) {
      message.error("Пожалуйста, войдите в систему");
      return;
    }

    // Добавьте эти строки:
    const userEmail = session.user.email;

    if (!userEmail) {
      message.error("Для оплаты требуется email или телефон пользователя");
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(session.user.id),
          gameId: game.id,
          email: userEmail,     // ← ДОБАВИТЬ
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const orderData = await res.json();
      // 2. Проверяем, есть ли PaymentURL в ответе
      if (orderData.paymentURL) {
        // 3. Открываем PaymentURL в новой вкладке или в модальном окне
        // Опция 1: Открыть в новой вкладке
        window.open(orderData.paymentURL, '_blank');
        // Опция 2: Если хотите показать в модальном окне внутри приложения
        // (требует больше настройки, например, iframe или встроенного компонента)
        // window.location.href = orderData.paymentURL;
        // Закрываем модалку с игрой
        onClose();
      } else {
        throw new Error("Payment URL not received from the server.");
      }
    } catch (error: unknown) { // Исправлен тип any на unknown
      console.error("Payment initiation error:", error);
      // Проверка типа перед использованием message
      if (error instanceof Error) {
        message.error(error.message || "Ошибка при инициализации оплаты. Попробуйте позже.");
      } else {
        message.error("Ошибка при инициализации оплаты. Попробуйте позже.");
      }
    }
  };

  const hasKeys = (game.keys as string[]).length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={game.title}
    >
      {/* Заменено img на Image */}
      <div style={{ position: 'relative', height: '300px', width: '100%', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
        <img
          src={game.imageUrl}
          alt={game.title}
          style={{
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            borderRadius: 8
          }}
        />
      </div>
      <p><b>Платформа:</b> {game.platform}</p>
      <p><b>Описание:</b> {game.description}</p>
      <p><b>Цена:</b> {game.price} ₽</p>
      {/* Контейнер для кнопок T-Pay / QR, если бы использовался напрямую из скрипта в модалке */}
      {/* <div id="paymentContainer" ref={paymentContainerRef} style={{ display: 'none', marginTop: '20px' }}></div> */}
      <Button
        type="primary"
        disabled={!hasKeys || !session}
        onClick={handleBuy} // Используем новую функцию handleBuy
        block
      >
        {hasKeys ? "Купить через T-Bank" : "Нет в наличии"} {/* Обновлен текст кнопки */}
      </Button>
      <p style={{ marginTop: 16, fontSize: '12px', color: '#888' }}>
        {/* Обновлен текст примечания */}
        После оплаты промокод к игре придёт на e-mail. Проверьте папку «Входящие» и «Спам».
        {/* Оплата осуществляется через T-Bank Acquiring. */}
      </p>
    </Modal>
  );
}