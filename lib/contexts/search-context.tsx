"use client"

import React, { createContext, useContext } from "react"

interface SearchContextType {
  searchTerm: string
}

const SearchContext = createContext<SearchContextType>({ searchTerm: "" })

export function SearchProvider({
  children,
  searchTerm,
}: {
  children: React.ReactNode
  searchTerm: string
}) {
  return <SearchContext.Provider value={{ searchTerm }}>{children}</SearchContext.Provider>
}

export function useSearch() {
  return useContext(SearchContext)
}
