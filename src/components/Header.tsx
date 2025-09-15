// ./Header.tsx
"use client";
import { Button, Space, Input } from "antd";
import { SmileOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useFilter } from "@/context/FilterContext";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from './Header.module.css'; 

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onProfileClick: () => void;
}

const filters = ["STEAM", "XBOX", "PS"];

export default function Header({ onLoginClick, onSignUpClick, onProfileClick }: HeaderProps) {
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
      <div className={styles.headerContent}>
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

        <div className={styles.authContainer}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}> 
            {session ? (
              <Space size="middle"> 
                <span style={{ whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                  Привет, {session.user?.email?.split('@')[0]} 
                </span>

                <Button                  
                  icon={<UserOutlined />} 
                  onClick={onProfileClick} 
                  aria-label="Личный кабинет"
                  style={{ 
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />

                <Button onClick={handleSignOut}> 
                  Выйти
                </Button>
              </Space>
            ) : (
              <Space size="middle"> 
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