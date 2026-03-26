'use client';

import type React from 'react';
import type { Column } from '@tanstack/react-table';
import { Icons } from '@/components/global/icons';

import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent h-8 truncate"
          >
            <span className="">{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <Icons.chevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <Icons.chevronDown className="ml-2 h-4 w-4" />
            ) : (
              <Icons.chevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false, false)}>
            <Icons.chevronUp className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true, false)}>
            <Icons.chevronDown className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Giảm dần
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.clearSorting()}>
            <Icons.chevronsUpDown className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Bỏ sắp xếp
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <Icons.eyeOff className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Ẩn cột
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}