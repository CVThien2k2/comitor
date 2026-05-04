/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type { ReactNode } from "react"
import { createContext, useContext } from "react"

import type { Table } from "@tanstack/react-table"

interface DataTableContextValue {
  table: Table<any>
  globalSearch?: string
  onGlobalSearchChange?: (value: string) => void
  toggleFilter?: () => void
  toolbarLeft?: ReactNode
  toolbarRight?: ReactNode
  viewOptions: boolean
  isLoading: boolean
  rowCount: number
}

const DataTableContext = createContext<DataTableContextValue | null>(null)

export function DataTableProvider({ value, children }: { value: DataTableContextValue; children: ReactNode }) {
  return <DataTableContext.Provider value={value}>{children}</DataTableContext.Provider>
}

export function useOptionalDataTableContext() {
  return useContext(DataTableContext)
}

export function useDataTableContext() {
  const context = useOptionalDataTableContext()

  if (!context) {
    throw new Error("DataTable components must be used inside DataTableProvider")
  }

  return context
}
