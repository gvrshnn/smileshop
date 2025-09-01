"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type FilterContextType = {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>(""); 

  return (
    <FilterContext.Provider
      value={{
        selectedFilter,
        setSelectedFilter,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used inside FilterProvider");
  }
  return context;
}