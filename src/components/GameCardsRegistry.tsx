"use client";
import { Row, Col } from "antd";
import { useFilter } from "@/context/FilterContext";
import GameCard from "./GameCard";
import GameEditModal from "./GameEditModal";
import { Game } from "@prisma/client";
import { useState, useMemo } from "react"; 

interface Props {
  games: Game[];
  onBuy: (game: Game) => void;
  onGamesUpdate?: () => void;
}

export default function GameCardsRegistry({ games, onBuy, onGamesUpdate }: Props) {
  const { selectedFilter, searchTerm } = useFilter(); 

  const filteredGames = useMemo(() => {
    if (searchTerm) {
      return games.filter((game) => {
        return (
          game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    else if (selectedFilter) {
      return games.filter((game) => game.platform === selectedFilter);
    }
    else {
      return games;
    }
  }, [games, selectedFilter, searchTerm]); 

  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

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
      <Row gutter={[16, 16]} style={{ marginTop: 20 }} justify="start">
        {filteredGames.map((game) => (
          <Col
            key={game.id}
            xs={24}
            sm={12}
            md={8}
            lg={6}
            xl={4}
            xxl={3}
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
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
