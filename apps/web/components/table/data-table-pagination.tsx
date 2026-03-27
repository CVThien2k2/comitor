import { Table } from '@tanstack/react-table';

import { Button } from '@workspace/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Icons } from '@/components/global/icons';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  enableI18n?: boolean;
}

export function DataTablePagination<TData>({
  table
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-start justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-muted-foreground text-xs font-medium hidden md:block">
          Số hàng trên trang
        </p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={value => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map(pageSize => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-muted-foreground   text-xs font-medium">
          {`Trang ${table.getState().pagination.pageIndex + 1} / ${table.getPageCount()}`}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 p-0 md:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">
            Đi đến trang đầu
          </span>
          <Icons.chevronsDown className="size-4 rotate-90" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">
            Đi đến trang trước
          </span>
          <Icons.chevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">
            Đi đến trang tiếp theo
          </span>
          <Icons.chevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 p-0 md:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">
            Đi đến trang cuối
          </span>
          <Icons.chevronsDown className="size-4 -rotate-90" />
        </Button>
      </div>
    </div>
  );
}