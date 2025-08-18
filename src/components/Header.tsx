"use client";

import { Button, Space } from "antd";
import { useFilter } from "@/context/FilterContext";

const filters = ["STEAM", "XBOX", "PS"];

export default function Header() {
  const { selectedFilter, setSelectedFilter } = useFilter();

  return (
    <header style={{ padding: 20, borderBottom: "1px solid #ddd" }}>
      <Space>
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
