"use client";

import { Modal, Button, message } from "antd";
import { useSession } from "next-auth/react";
import { Game } from "@prisma/client";
import { useEffect, useRef } from "react"; // Добавлены импорты

interface Props {
  game: Game | null;
  open: boolean;
  onClose: () => void;
  // onBuy убран, так как логика покупки теперь через T-Bank
}

export default function GameCardModal({ game, open, onClose }: Props) {
  const { data: session } = useSession();
  // Создаем ref для контейнера оплаты
  const paymentContainerRef = useRef<HTMLDivElement>(null);
  // Ref для отслеживания, инициализирована ли оплата
  const isPaymentInitialized = useRef(false);

  if (!game) return null;

  // Функция для обработки покупки через T-Bank
  const handleBuy = async () => {
    if (!session) {
      message.error("Пожалуйста, войдите в систему");
      return;
    }

    try {
      // 1. Вызываем ваш существующий API роут для создания заказа и получения PaymentURL
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(session.user.id), // Передаем userId
          gameId: game.id,                   // Передаем gameId
          // paymentType: 'tbank' // Можно добавить, если логика в API зависит от типа
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
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      message.error(error.message || "Ошибка при инициализации оплаты. Попробуйте позже.");
    }
  };

  // Эффект для инициализации PaymentIntegration при открытии модалки (если бы использовался контейнер)
  // useEffect(() => {
  //   if (open && paymentContainerRef.current && (window as any).PaymentIntegration && !isPaymentInitialized.current) {
  //     // Логика инициализации PaymentIntegration, если бы она управлялась отсюда
  //     // В текущем плане она инициализируется в layout.tsx, поэтому этот эффект может быть не нужен
  //     // или нужен для обновления orderId в callback'е
  //     isPaymentInitialized.current = true; // Помечаем как инициализированное
  //   }
  // }, [open]); // Зависимость от open

  const hasKeys = (game.keys as string[]).length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={game.title}
    >
      <img
        src={game.imageUrl}
        alt={game.title}
        style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
      />
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