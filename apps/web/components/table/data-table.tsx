"use client"

import { flexRender, getCoreRowModel, RowSelectionState, Updater, useReactTable } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"

import { DataTableProvider } from "@/components/table/data-table-context"
import { DataTablePagination } from "@/components/table/data-table-pagination"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import { Icons } from "@/components/global/icons"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[] | undefined
  pagination: PaginationState
  pageCount: number
  sorting: SortingState
  globalSearch?: string
  onSortingChange: (value: Updater<SortingState>) => void
  onPaginationChange?: (updaterOrValue: Updater<PaginationState>) => void
  onRowSelectionChange?: (updaterOrValue: Updater<RowSelectionState>) => void
  selectedRowIds?: RowSelectionState
  toolbarRight?: ReactNode
  onGlobalSearchChange?: (value: string) => void
  title?: string
  isLoading?: boolean
  toggleFilter?: () => void
  onRowClick?: (row: TData) => void
  toolbarLeft?: ReactNode
  viewOptions?: boolean
}

export default function DataTable<TData>({
  columns,
  data,
  pagination,
  pageCount,
  globalSearch,
  sorting,
  onSortingChange,
  onPaginationChange,
  title,
  toolbarRight,
  onGlobalSearchChange,
  isLoading = false,
  onRowSelectionChange,
  selectedRowIds,
  toggleFilter,
  onRowClick,
  toolbarLeft,
  viewOptions = true,
}: DataTableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table instance intentionally drives table UI controls.
  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      pagination,
      globalFilter: globalSearch,
      ...(selectedRowIds ? { rowSelection: selectedRowIds } : {}),
    },
    enableMultiSort: false,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange,
    onPaginationChange,
    ...(onRowSelectionChange ? { onRowSelectionChange } : {}),
    manualSorting: true,
    manualPagination: true,
    pageCount,
  })

  const colCount = table.getAllColumns().filter((col) => col.getIsVisible()).length || columns.length
  const rows = table.getRowModel().rows
  const hasRows = rows.length > 0
  const loadingSkeletonRows = 5
  const hasLoadedDataRef = useRef(false)

  useEffect(() => {
    if (hasRows) {
      hasLoadedDataRef.current = true
    }
  }, [hasRows])

  const isInitialLoading = isLoading && !hasLoadedDataRef.current && !hasRows
  const isRefreshLoading = isLoading && !isInitialLoading

  return (
    <DataTableProvider
      value={{
        table,
        globalSearch,
        onGlobalSearchChange,
        toggleFilter,
        toolbarLeft,
        toolbarRight,
        viewOptions,
        isLoading,
        rowCount: rows.length,
      }}
    >
      <div className="space-y-4">
        {title && (
          <div className="flex flex-wrap items-end justify-between gap-2 px-1">
            <h2 className="text-xl font-semibold tracking-tight text-primary">{title}</h2>
            <p className="text-xs font-semibold text-primary/80">{rows.length} kết quả trên trang hiện tại</p>
          </div>
        )}

        <DataTableToolbar />

        <div className="relative overflow-hidden rounded-2xl">
          <Table className="border-separate border-spacing-y-2 px-3 pb-3 [border-spacing-x:0]">
            {(hasRows || isLoading) && (
              <TableHeader className="[&_tr]:border-none">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-10 bg-primary text-[11px] font-bold tracking-wide text-primary-foreground uppercase first:rounded-l-lg last:rounded-r-lg"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            )}

            <TableBody className="isolate overflow-visible [&_tr]:border-0">
              {hasRows ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "group relative rounded-xl border border-primary/35 bg-card shadow-[0_2px_10px_rgb(2_6_23/0.05)] ring-1 ring-primary/20 transition-[transform,border-color,box-shadow,background-color,ring-color] duration-250",
                      "hover:-translate-y-0.5 hover:border-primary/55 hover:bg-card hover:shadow-[0_8px_22px_rgb(2_6_23/0.12)] hover:ring-primary/35",
                      "data-[state=selected]:translate-x-1 data-[state=selected]:border-primary/70 data-[state=selected]:bg-primary/14 data-[state=selected]:shadow-[0_10px_24px_rgba(2,132,199,0.18)] data-[state=selected]:ring-primary/55",
                      onRowClick && "cursor-pointer",
                      "[&_td]:p-3"
                    )}
                    onClick={() => {
                      onRowClick?.(row.original)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="first:rounded-l-xl last:rounded-r-xl">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isInitialLoading ? (
                Array.from({ length: loadingSkeletonRows }).map((_, index) => (
                  <TableRow key={`loading-skeleton-${index}`} className="border-0">
                    <TableCell colSpan={colCount} className="p-0">
                      <div className="mx-1 min-h-[84px] w-full animate-pulse rounded-xl border border-border bg-muted/45" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={colCount} className="h-48" />
                </TableRow>
              )}
            </TableBody>
          </Table>

          {isRefreshLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/30 bg-background/75 backdrop-blur-sm">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-primary">Đang tải dữ liệu</p>
            </div>
          )}

          {!hasRows && !isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-background/35">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/80">
                <Icons.inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Không có kết quả</p>
              <p className="text-xs text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc để xem thêm dữ liệu.</p>
            </div>
          )}
        </div>

        <DataTablePagination />
      </div>
    </DataTableProvider>
  )
}
