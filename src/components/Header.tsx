"use client";

import { Button, Space, Tooltip } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { useFilter } from "@/context/FilterContext";

const filters = ["STEAM", "XBOX", "PS"];

export default function Header() {
  const { selectedFilter, setSelectedFilter } = useFilter();

  const handleResetFilter = () => {
    setSelectedFilter(""); // Пустая строка означает "все платформы"
  };

  return (
    <header style={{ padding: 20, borderBottom: "1px solid #01f501" }}>
      <Space>
          <Button
            type={selectedFilter === "" ? "primary" : "default"}
            icon={<SmileOutlined />}
            onClick={handleResetFilter}
            style={{ 
              borderRadius: "50%", 
              width: 40, 
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          />
        
        {filters.map((f) => (
          <Button
            key={f}
            type={selectedFilter === f ? "primary" : "default"}
            onClick={() => setSelectedFilter(f)}
          >
            {f}
          </Button>
        ))}
      </Space>
    </header>
  );
}
