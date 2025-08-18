"use client";

import { Modal, Button } from "antd";
import { Game } from "@prisma/client";

interface Props {
  game: Game | null;
  open: boolean;
  onClose: () => void;
  onBuy: (game: Game) => void;
}

export default function GameCardModal({ game, open, onClose, onBuy }: Props) {
  if (!game) return null;

  const handleBuy = async () => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: 1, gameId: game.id }), // пока userId = 1 для теста
    });
    const data = await res.json();
    onBuy(data);
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
        disabled={!hasKeys}
        onClick={handleBuy}
        block
      >
        {hasKeys ? "Купить" : "Нет в наличии"}
      </Button>
    </Modal>
  );
}
