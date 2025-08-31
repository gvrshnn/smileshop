"use client";

import { Button, Space } from "antd";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useFilter } from "@/context/FilterContext";
import { Game } from "@prisma/client";
import LoginModal from "@/components/LoginModal";
import SignUpModal from "@/components/SignUpModal";
import Header from "@/components/Header";
import GameCardsRegistry from "@/components/GameCardsRegistry";
import GameCardModal from "@/components/GameCardModal";
import GameEditModal from "@/components/GameEditModal";
import { PlusOutlined } from "@ant-design/icons";

export default function Home() {
  const { data: session } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false)
  const { selectedFilter } = useFilter();

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchGames = () => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data));
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleBuy = (order: { key: string }) => {
    alert(`Спасибо за покупку! Ваш ключ: ${order.key}`);
    setModalOpen(false);
  };  

  const handleCreateGame = async (gameData: Partial<Game>) => {
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании игры");
      }

      // Обновляем список игр
      fetchGames();
      setCreateModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const switchToSignUp = () => {
    setLoginOpen(false);
    setSignUpOpen(true);
  };

  const switchToLogin = () => {
    setSignUpOpen(false);
    setLoginOpen(true);
  };

  return (
    <>
      <Header />
      <main style={{ padding: 20 }}>
        {session ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p>
                Вы вошли как: {session.user?.email} {session.isAdmin && "(admin)"}
              </p>
              <Space>
                {session.isAdmin && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Добавить игру
                  </Button>
                )}
                <Button onClick={() => signOut()}>Выйти</Button>
              </Space>
            </div>
          </>
        ) : (
          <Space style={{ marginBottom: 20 }}>
            <Button type="primary" onClick={() => setLoginOpen(true)}>
              Войти
            </Button>
            <Button type="default" onClick={() => setSignUpOpen(true)}>
              Регистрация
            </Button>
          </Space>
        )}

        <p style={{ marginTop: 20 }}>
          Текущий фильтр: <b>{selectedFilter || "Все платформы"}</b>
        </p>

        <GameCardsRegistry
          games={games}
          onBuy={(game) => {
            setSelectedGame(game);
            setModalOpen(true);
          }}
          onGamesUpdate={fetchGames}
        />

        <GameCardModal
          game={selectedGame}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onBuy={handleBuy}
        />

        <GameEditModal
          game={null}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleCreateGame}
          isCreating={true}
        />

        {/* Модальные окна авторизации */}
        <LoginModal 
          open={loginOpen} 
          onClose={() => setLoginOpen(false)}
          onSwitchToSignUp={switchToSignUp}
        />
        
        <SignUpModal 
          open={signUpOpen} 
          onClose={() => setSignUpOpen(false)}
        />

      </main>
    </>
  );
}
