"use client"

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import type { Table } from "@tanstack/react-table"

import { useOptionalDataTableContext } from "@/components/table/data-table-context"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu"
import { Icons } from "@/components/global/icons"

type DataTableViewOptionsProps = {
  table?: Table<Record<string, unknown>>
}

function formatColumnLabel(id: string) {
  return id.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

export function DataTableViewOptions({ table: tableProp }: DataTableViewOptionsProps) {
  const context = useOptionalDataTableContext()
  const table = tableProp ?? (context?.table as Table<Record<string, unknown>> | undefined)

  if (!table) {
    throw new Error("DataTableViewOptions requires `table` prop or DataTable context")
  }

  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 border-border/70 bg-background">
          <Icons.slidersHorizontal className="size-4" />
          <span className="ml-2">Hiển thị</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-2" align="start">
        <DropdownMenuLabel>Chọn cột hiển thị</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
            onSelect={(e) => e.preventDefault()}
          >
            {formatColumnLabel(column.id)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
