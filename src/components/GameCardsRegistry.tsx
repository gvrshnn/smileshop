"use client";

import { Row, Col } from "antd";
import { useFilter } from "@/context/FilterContext";
import GameCard from "./GameCard";
import { Game } from "@prisma/client";

interface Props {
  games: Game[];
  onBuy: (game: Game) => void;
}

export default function GameCardsRegistry({ games, onBuy }: Props) {
  const { selectedFilter } = useFilter();

  const filtered = games.filter((g) => g.platform === selectedFilter);

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
      {filtered.map((game) => (
        <Col key={game.id} xs={24} sm={12} md={8} lg={6}>
          <GameCard game={game} onBuy={onBuy} />
        </Col>
      ))}
    </Row>
  );
}
