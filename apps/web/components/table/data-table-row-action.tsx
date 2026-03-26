'use client';

import { useState } from 'react';

import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Icons } from '@/components/global/icons';

interface DataTableRowActionProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  enableI18n?: boolean;
}

export function DataTableRowAction({
  onEdit,
  onDelete,
  onView,
}: DataTableRowActionProps) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icons.ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {onEdit && (
          <DropdownMenuItem
            className="flex justify-start gap-4  "
            onSelect={e => {
              e.preventDefault();
              setOpen(false);
              onEdit?.();
            }}
          >
            <Icons.edit />
            <span className="ml-2 hidden md:block">
              Chỉnh sửa
            </span>
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            className="flex justify-start gap-4  "
            onSelect={e => {
              e.preventDefault();
              setOpen(false);
              onDelete?.();
            }}
          >
            <Icons.trash />
            <span className="ml-2 hidden md:block">
              Xóa
            </span>
          </DropdownMenuItem>
        )}
        {onView && (
          <DropdownMenuItem
            className="flex justify-start gap-4  "
            onSelect={e => {
              e.preventDefault();
              setOpen(false);
              onView?.();
            }}
          >
            <Icons.eye />
            <span className="ml-2 hidden md:block">
              Xem chi tiết
            </span>
          </DropdownMenuItem>
        )}
        {!onView && !onEdit && !onDelete && (
          <DropdownMenuItem>
            <span className="ml-2 hidden md:block">
              Không có hành động
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}