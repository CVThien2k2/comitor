'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { Table } from '@tanstack/react-table';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';

import { Icons } from '../global/icons';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';

interface DataTableToolbarProps {
  table: Table<any>;
  right?: ReactNode;
  toggleFilter?: () => void;
  onGlobalSearchChange?: (value: string) => void;
  globalSearch?: string;
  enableI18n?: boolean;
  toolbarLeft?: ReactNode;
  viewOptions?: boolean;
}

export function DataTableToolbar({
  table,
  right,
  toggleFilter,
  onGlobalSearchChange,
  globalSearch,
  toolbarLeft,
  viewOptions = true,
}: DataTableToolbarProps) {
  const [searchInput, setSearchInput] = useState(globalSearch || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onGlobalSearchChange?.(searchInput);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <div className="flex items-center gap-2">
        {onGlobalSearchChange && (
          <div className="relative flex-1 md:w-72">
            <Icons.search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm"
              className="pl-10"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
        )}
        {toggleFilter && (
          <Button onClick={toggleFilter}>
            <Icons.filter />
            <span className="ml-2 hidden md:block">
              Bộ lọc
            </span>
          </Button>
        )}
        {viewOptions && (
          <DataTableViewOptions table={table} />
        )}
        {toolbarLeft && (
          <div className="flex items-center gap-2">{toolbarLeft}</div>
        )}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}