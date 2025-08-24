"use client";

import { Row, Col, message } from "antd";
import { useFilter } from "@/context/FilterContext";
import GameCard from "./GameCard";
import GameEditModal from "./GameEditModal";
import { Game } from "@prisma/client";
import { useState } from "react";

interface Props {
  games: Game[];
  onBuy: (game: Game) => void;
  onGamesUpdate?: () => void;
}

export default function GameCardsRegistry({ games, onBuy, onGamesUpdate }: Props) {
  const { selectedFilter } = useFilter();
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const filtered = selectedFilter ? games.filter((g) => g.platform === selectedFilter) : games;

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setEditModalOpen(true);
  };

  const handleDelete = async (gameId: number) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Ошибка при удалении игры");
      }

      // Обновляем список игр
      onGamesUpdate?.();
    } catch (error) {
      throw error;
    }
  };

  const handleSaveEdit = async (updatedGame: Partial<Game>) => {
    if (!editingGame) return;

    try {
      const response = await fetch(`/api/games/${editingGame.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedGame),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении игры");
      }

      // Обновляем список игр
      onGamesUpdate?.();
    } catch (error) {
      throw error;
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingGame(null);
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {filtered.map((game) => (
          <Col key={game.id} xs={24} sm={12} md={8} lg={6}>
            <GameCard 
              game={game} 
              onBuy={onBuy}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>

      <GameEditModal
        game={editingGame}
        open={editModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />
    </>
  );
}
