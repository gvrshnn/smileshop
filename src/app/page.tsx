"use client";

import { Button } from "antd";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <main style={{ padding: 20 }}>
      {session ? (
        <>
          <p>
            Вы вошли как: {session.user?.email}{" "}
            {session.isAdmin && "(admin)"}
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
    </main>
  );
}
