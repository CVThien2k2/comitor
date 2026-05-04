"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"

import type { Table } from "@tanstack/react-table"
import { DataTableViewOptions } from "@/components/table/data-table-view-options"
import { useOptionalDataTableContext } from "@/components/table/data-table-context"

import { Icons } from "../global/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

interface DataTableToolbarProps {
  table?: Table<any>
  right?: ReactNode
  toggleFilter?: () => void
  onGlobalSearchChange?: (value: string) => void
  globalSearch?: string
  toolbarLeft?: ReactNode
  viewOptions?: boolean
}

export function DataTableToolbar({
  table: tableProp,
  right: rightProp,
  toggleFilter: toggleFilterProp,
  onGlobalSearchChange: onGlobalSearchChangeProp,
  globalSearch: globalSearchProp,
  toolbarLeft: toolbarLeftProp,
  viewOptions: viewOptionsProp,
}: DataTableToolbarProps) {
  const context = useOptionalDataTableContext()

  const table = tableProp ?? context?.table
  const right = rightProp ?? context?.toolbarRight
  const toggleFilter = toggleFilterProp ?? context?.toggleFilter
  const onGlobalSearchChange = onGlobalSearchChangeProp ?? context?.onGlobalSearchChange
  const globalSearch = globalSearchProp ?? context?.globalSearch
  const toolbarLeft = toolbarLeftProp ?? context?.toolbarLeft
  const viewOptions = viewOptionsProp ?? context?.viewOptions ?? true

  if (!table) {
    throw new Error("DataTableToolbar requires `table` prop or DataTable context")
  }

  const [searchInput, setSearchInput] = useState(globalSearch ?? "")

  useEffect(() => {
    setSearchInput(globalSearch ?? "")
  }, [globalSearch])

  useEffect(() => {
    if (!onGlobalSearchChange) return

    const timer = setTimeout(() => {
      if (searchInput !== (globalSearch ?? "")) {
        onGlobalSearchChange(searchInput)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [globalSearch, onGlobalSearchChange, searchInput])

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {onGlobalSearchChange && (
          <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
            <Icons.search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo từ khóa"
              className="h-9 border-border/70 bg-background pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        )}

        {toggleFilter && (
          <Button variant="outline" className="h-9 border-border/70 bg-background" onClick={toggleFilter}>
            <Icons.filter className="size-4" />
            <span className="ml-2">Bộ lọc</span>
          </Button>
        )}

        {viewOptions && <DataTableViewOptions />}

        {toolbarLeft && <div className="flex items-center gap-2">{toolbarLeft}</div>}
      </div>

      <div className="flex items-center gap-2">{right}</div>
    </div>
  )
}
