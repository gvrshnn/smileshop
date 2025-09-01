"use client";
import { Button, Space, Input } from "antd";
import { SmileOutlined, SearchOutlined } from "@ant-design/icons";
import { useFilter } from "@/context/FilterContext";
import { useSession } from "next-auth/react"; // Импортируем useSession
import { useState, useEffect } from "react";

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const filters = ["STEAM", "XBOX", "PS"];

export default function Header({ onLoginClick, onSignUpClick }: HeaderProps) {
  const { data: session } = useSession(); // Получаем данные сессии
  const { selectedFilter, setSelectedFilter, searchTerm, setSearchTerm } = useFilter();
  const [inputValue, setInputValue] = useState(searchTerm);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm && selectedFilter) {
      setSelectedFilter("");
    }
  }, [searchTerm, selectedFilter, setSelectedFilter]);

  const handleResetFilter = () => {
    setSelectedFilter("");
    setSearchTerm("");
    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setInputValue("");
  };

  const handleSignOut = () => {
    alert("Функция выхода должна быть реализована в основном компоненте или передана как пропс.");
  };

  return (
    <header style={{ padding: 20, borderBottom: "1px solid #01f501" }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>
          <Space>
            <Button
              type={(selectedFilter === "" && !searchTerm) ? "primary" : "default"}
              icon={<SmileOutlined />}
              onClick={handleResetFilter}
              style={{
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            {filters.map((f) => (
              <Button
                key={f}
                type={selectedFilter === f ? "primary" : "default"}
                onClick={() => {
                  setSearchTerm("");
                  setInputValue("");
                  setSelectedFilter(f);
                }}
                disabled={!!searchTerm}
              >
                {f}
              </Button>
            ))}
          </Space>
        </div>

        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', margin: '0 20px' }}>
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 400 }}>
            <Input
              placeholder="Поиск игр..."
              value={inputValue}
              onChange={handleInputChange}
              suffix={
                inputValue ? (
                  <Button
                    type="text"
                    icon={<span style={{ cursor: 'pointer' }}>✕</span>}
                    onClick={handleClearSearch}
                    size="small"
                    style={{ padding: 0, width: 20, height: 20 }}
                  />
                ) : (
                  <SearchOutlined />
                )
              }
              style={{ width: '100%' }}
            />
          </form>
        </div>

        <div>
          {session ? (
            <Space>
              <span>Привет, {session.user?.email}</span>
              <Button onClick={handleSignOut}>Выйти</Button>
            </Space>
          ) : (
            <Space>
              <Button type="primary" onClick={onLoginClick}>
                Войти
              </Button>
              <Button type="default" onClick={onSignUpClick}>
                Регистрация
              </Button>
            </Space>
          )}
        </div>
      </div>
    </header>
  );
}