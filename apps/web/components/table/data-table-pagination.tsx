import type { Table } from "@tanstack/react-table"

import { useOptionalDataTableContext } from "@/components/table/data-table-context"
import { Button } from "@workspace/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Icons } from "@/components/global/icons"

interface DataTablePaginationProps<TData> {
  table?: Table<TData>
}

export function DataTablePagination<TData>({ table: tableProp }: DataTablePaginationProps<TData>) {
  const context = useOptionalDataTableContext()
  const table = tableProp ?? (context?.table as Table<TData> | undefined)

  if (!table) {
    throw new Error("DataTablePagination requires `table` prop or DataTable context")
  }

  const pageIndex = table.getState().pagination.pageIndex + 1
  const pageCount = Math.max(1, table.getPageCount())
  const pageSize = table.getState().pagination.pageSize

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Số hàng trên trang</span>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-[82px] border-border/70 bg-background">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="text-xs font-medium text-muted-foreground">{`Trang ${pageIndex} / ${pageCount}`}</div>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 border-border/70 bg-background p-0 md:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Đi đến trang đầu</span>
          <Icons.chevronsDown className="size-4 rotate-90" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 border-border/70 bg-background p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Đi đến trang trước</span>
          <Icons.chevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 border-border/70 bg-background p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Đi đến trang tiếp theo</span>
          <Icons.chevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 border-border/70 bg-background p-0 md:flex"
          onClick={() => table.setPageIndex(Math.max(0, pageCount - 1))}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Đi đến trang cuối</span>
          <Icons.chevronsDown className="size-4 -rotate-90" />
        </Button>
      </div>
    </div>
  )
}
