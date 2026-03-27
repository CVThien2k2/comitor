'use client';

import type { ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  Updater,
  useReactTable,
} from '@tanstack/react-table';

import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { Icons } from '@/components/global/icons';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { DataTableToolbar } from '@/components/table/data-table-toolbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[] | undefined;
  pagination: PaginationState;
  pageCount: number;
  sorting: SortingState;
  globalSearch?: string;
  onSortingChange: (value: Updater<SortingState>) => void;
  onPaginationChange?: (updaterOrValue: Updater<PaginationState>) => void;
  onRowSelectionChange?: (updaterOrValue: Updater<RowSelectionState>) => void;
  selectedRowIds?: RowSelectionState;
  toolbarRight?: ReactNode;
  onGlobalSearchChange?: (value: string) => void;
  title?: string;
  isLoading?: boolean;
  isRowCard?: boolean;
  toggleFilter?: () => void;
  onRowClick?: (row: TData) => void;
  toolbarLeft?: ReactNode;
  viewOptions?: boolean;
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
  isRowCard = false,
  onRowSelectionChange,
  selectedRowIds,
  toggleFilter,
  onRowClick,
  toolbarLeft,
  viewOptions = true,
}: DataTableProps<TData>) {
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
    onSortingChange: onSortingChange,
    onPaginationChange: onPaginationChange,
    ...(onRowSelectionChange
      ? { onRowSelectionChange: onRowSelectionChange }
      : {}),
    manualSorting: true,
    manualPagination: true,
    pageCount,
  });

  const colCount =
    table.getAllColumns().filter(col => col.getIsVisible()).length ||
    columns.length;
  const hasRows = table.getRowModel().rows?.length;

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <DataTableToolbar
        table={table}
        toolbarLeft={toolbarLeft}
        right={toolbarRight}
        toggleFilter={toggleFilter}
        onGlobalSearchChange={onGlobalSearchChange}
        globalSearch={globalSearch}
        viewOptions={viewOptions}
      />
      <div
        className={cn(
          !isRowCard
            ? 'overflow-hidden rounded-md border'
            : 'rounded-md border md:rounded-none md:border-none',
          'relative'
        )}
      >
        <Table
          className={cn(
            isRowCard &&
              'border-separate border-spacing-y-3 px-2 [border-spacing-x:0]'
          )}
        >
          {(hasRows || isLoading) && (
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow
                  key={headerGroup.id}
                  className={cn(
                    'hover:bg-transparent',
                    isRowCard && 'border-none'
                  )}
                >
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody
            className={
              isRowCard ? 'isolate overflow-visible [&_tr]:border-0' : undefined
            }
          >
            {hasRows ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={
                    isRowCard
                      ? 'hover:bg-primary/20 bg-secondary/80 relative transform-gpu rounded-2xl shadow-2xs inset-shadow-xs transition-transform duration-200 ease-out will-change-transform hover:z-10 hover:scale-[1.005] [&_td]:p-2'
                      : undefined
                  }
                  onClick={() => {
                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={
                        isRowCard
                          ? 'first:rounded-l-2xl last:rounded-r-2xl'
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={colCount || columns.length}
                  className="h-40"
                >
                  {/* giữ chiều cao để overlay không bị co khi chưa có dữ liệu */}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {isLoading && (
          <div className="bg-background/70 border-primary/50 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-md border backdrop-blur-sm">
            <Icons.spinner className="text-primary h-8 w-8 animate-spin" />
            <p className="text-primary text-sm">
              Đang tải dữ liệu
            </p>
          </div>
        )}
        {!hasRows && !isLoading && (
          <div className="border-primary/50 absolute inset-0 z-10 flex items-center justify-center rounded-md border">
            <p className="text-primary text-sm">
              Không có kết quả
            </p>
          </div>
        )}
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}