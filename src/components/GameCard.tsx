"use client";

import { Card, Button, Popconfirm, message } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { Game } from "@prisma/client";
import { useState } from "react";

interface GameCardProps {
  game: Game;
  onBuy: (game: Game) => void;
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: number) => Promise<void>;
}

export default function GameCard({ game, onBuy, onEdit, onDelete }: GameCardProps) {
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const hasKeys = (game.keys as string[]).length > 0;
  const isAdmin = session?.isAdmin;

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setDeleting(true);
      await onDelete(game.id);
      message.success("Игра успешно удалена");
    } catch (error) {
      message.error("Ошибка при удалении игры");
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        hoverable
        style={{ width: 240, position: "relative" }}
        cover={<img alt={game.title} src={game.imageUrl} />}
      >
        {/* Админские кнопки */}
        {isAdmin && isHovered && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 4,
            }}
            onMouseEnter={() => setIsHovered(true)}
          >
            <Popconfirm
              title="Удалить игру?"
              description="Это действие нельзя отменить"
              onConfirm={handleDelete}
              okText="Да"
              cancelText="Нет"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
                size="small"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #ff4d4f",
                }}
              />
            </Popconfirm>
            
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit?.(game)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #1890ff",
              }}
            />
          </div>
        )}

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
    </div>
  );
}
