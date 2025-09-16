// ./page.tsx
"use client";
import { Button, Space, Spin } from "antd";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useFilter } from "@/context/FilterContext";
import { Game } from "@prisma/client";
import LoginModal from "@/components/LoginModal";
import SignUpModal from "@/components/SignUpModal";
import UserProfileModal from "@/components/UserProfileModal"; 
import Header from "@/components/Header";
import GameCardsRegistry from "@/components/GameCardsRegistry";
import GameCardModal from "@/components/GameCardModal";
import GameEditModal from "@/components/GameEditModal";
import { PlusOutlined } from "@ant-design/icons";
import Footer from "@/components/Footer";

export default function Home() {
  const { data: session } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false)
  const { selectedFilter } = useFilter();

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGames = () => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
         setGames(data);
         setLoading(false);
       })
      .catch((err) => {
        console.error("Ошибка загрузки игр:", err);
        setLoading(false);
      });
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

      fetchGames();
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Ошибка создания игры:", error);
      throw error;
    }
  };

  const switchToSignUp = () => {
    setLoginOpen(false);
    setSignUpOpen(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <Spin size="large" tip="Загрузка магазина..." />
      </div>
    );
  }

  return (
    // Добавляем обертку с минимальной высотой 100vh
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onLoginClick={() => setLoginOpen(true)}
        onSignUpClick={() => setSignUpOpen(true)}
        onProfileClick={() => setUserProfileOpen(true)}
      />
      
      {/* Основной контент с flex-grow для заполнения оставшегося пространства */}
      <main style={{ 
        flex: 1, 
        padding: 20, 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {session ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p>
                {session.isAdmin && "(Вы администратор)"}
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
              </Space>
            </div>
          </>
        ) : (
          <></>
        )}

        <p style={{ marginTop: 20 }}>
          Текущий фильтр: <b>{selectedFilter || "Все платформы"}</b>
        </p>

        {/* Контейнер для GameCardsRegistry с возможностью роста */}
        <div style={{ flex: 1 }}>
          <GameCardsRegistry
            games={games}
            onBuy={(game) => {
              setSelectedGame(game);
              setModalOpen(true);
            }}
            onGamesUpdate={fetchGames}
          />
        </div>

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

        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSwitchToSignUp={switchToSignUp}
        />

        <SignUpModal
          open={signUpOpen}
          onClose={() => setSignUpOpen(false)}
        />

        <UserProfileModal
          open={userProfileOpen}
          onClose={() => setUserProfileOpen(false)}
        />
      </main>
      
      <Footer />
    </div>
  );
}