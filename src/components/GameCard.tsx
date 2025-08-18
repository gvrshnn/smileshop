"use client";

import { Card, Button } from "antd";
import { Game } from "@prisma/client";

interface GameCardProps {
  game: Game;
  onBuy: (game: Game) => void;
}

export default function GameCard({ game, onBuy }: GameCardProps) {
  const hasKeys = (game.keys as string[]).length > 0;

  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={<img alt={game.title} src={game.imageUrl} />}
    >
      <Card.Meta title={game.title} description={`${game.price} ₽`} />
      <div style={{ marginTop: 12 }}>
        <Button
          type="primary"
          disabled={!hasKeys}
          onClick={() => onBuy(game)}
          block
        >
          {hasKeys ? "Купить" : "Нет в наличии"}
        </Button>
      </div>
    </Card>
  );
}
