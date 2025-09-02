// ./Header.tsx
"use client";
import { Button, Space, Input } from "antd";
import { SmileOutlined, SearchOutlined } from "@ant-design/icons";
import { useFilter } from "@/context/FilterContext";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from './Header.module.css'; // Импорт CSS модуля

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const filters = ["STEAM", "XBOX", "PS"];

export default function Header({ onLoginClick, onSignUpClick }: HeaderProps) {
  const { data: session } = useSession();
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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header style={{ padding: 20, borderBottom: "1px solid #01f501" }}>
      {/* Используем класс из модуля CSS для основного контейнера */}
      <div className={styles.headerContent}>
        {/* Контейнер фильтров */}
        <div className={styles.filtersContainer}>
          <Space wrap>
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

        {/* Контейнер поиска */}
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <Input
              placeholder="Поиск игр..."
              value={inputValue}
              onChange={handleInputChange}
              className={styles.searchInput}
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
            />
          </form>
        </div>

        {/* Контейнер авторизации */}
        <div className={styles.authContainer}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}> {/* Добавлен alignItems: 'center' */}
            {session ? (
              <Space size="middle"> {/* Добавлен size="small" */}
                <span style={{ whiteSpace: 'nowrap', fontSize: '0.9em' }}> {/* Уменьшен шрифт */}
                  Привет, {session.user?.email?.split('@')[0]} {/* Сокращаем email до имени */}
                </span>
                <Button onClick={handleSignOut}> {/* size="small" для кнопки */}
                  Выйти
                </Button>
              </Space>
            ) : (
              <Space size="middle"> {/* Добавлен size="small" */}
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
      </div>
    </header>
  );
}