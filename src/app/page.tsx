"use client";

import { Button } from "antd";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useFilter } from "@/context/FilterContext";
import { Game } from "@prisma/client";
import LoginModal from "@/components/LoginModal";
import Header from "@/components/Header";
import GameCardsRegistry from "@/components/GameCardsRegistry";
import GameCardModal from "@/components/GameCardModal";

export default function Home() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const { selectedFilter } = useFilter();

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchGames = () => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data));
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleBuy = (order: any) => {
    alert(`Спасибо за покупку! Ваш ключ: ${order.key}`);
    setModalOpen(false);
  };  

  return (
    <>
      <Header />
      <main style={{ padding: 20 }}>
        {session ? (
          <>
            <p>
              Вы вошли как: {session.user?.email} {session.isAdmin && "(admin)"}
            </p>
            <Button onClick={() => signOut()}>Выйти</Button>
          </>
        ) : (
          <>
            <Button type="primary" onClick={() => setOpen(true)}>
              Войти
            </Button>
            <LoginModal open={open} onClose={() => setOpen(false)} />
          </>
        )}

        <p style={{ marginTop: 20 }}>
          Текущий фильтр: <b>{selectedFilter}</b>
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
      </main>
    </>
  );
}
