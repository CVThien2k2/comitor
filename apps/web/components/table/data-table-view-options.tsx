'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import type { Table } from '@tanstack/react-table';

import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@workspace/ui/components/dropdown-menu';
import { Icons } from '@/components/global/icons';

type DataTableViewOptionsProps = { table: Table<Record<string, unknown>>};

export function DataTableViewOptions({
  table,
}: DataTableViewOptionsProps) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Icons.slidersHorizontal />
          <span className="ml-2 hidden md:block">
            Hiển thị
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2">
        <DropdownMenuLabel>
          Chọn cột
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map(column => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={value => column.toggleVisibility(!!value)}
            onSelect={e => e.preventDefault()}
          >
            {column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}