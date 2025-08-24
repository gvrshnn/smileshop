"use client";

import { Modal, Button, message } from "antd";
import { useSession } from "next-auth/react";
import { Game } from "@prisma/client";

interface Props {
  game: Game | null;
  open: boolean;
  onClose: () => void;
  onBuy: (order: { key: string }) => void;
}

export default function GameCardModal({ game, open, onClose }: Props) {
  const { data: session } = useSession();

  if (!game) return null;

  const handleBuy = async () => {
    if (!session) {
      message.error("Пожалуйста, войдите в систему");
      return;
    }

    try {
      // Формируем платежную ссылку ЮMoney
      const paymentUrl = `https://yoomoney.ru/quickpay/confirm.xml?receiver=${process.env.YOOMONEY_WALLET}&quickpay-form=shop&targets=Покупка ${encodeURIComponent(game.title)}&paymentType=PC&sum=${game.price}&label=${session.user.id}_${game.id}`;

      // Перенаправляем на страницу оплаты
      window.location.href = paymentUrl;
    } catch (error) {
      message.error("Ошибка при создании платежной ссылки");
      console.error("Payment error:", error);
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
      <img
        src={game.imageUrl}
        alt={game.title}
        style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
      />
      <p><b>Платформа:</b> {game.platform}</p>
      <p><b>Описание:</b> {game.description}</p>
      <p><b>Цена:</b> {game.price} ₽</p>

      <Button
        type="primary"
        disabled={!hasKeys || !session}
        onClick={handleBuy}
        block
      >
        {hasKeys ? "Купить" : "Нет в наличии"}
      </Button>
    </Modal>
  );
}