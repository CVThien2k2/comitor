"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
import { type RoleListItem, roles } from "@/api"
import { Icons } from "@/components/global/icons"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import DataTable from "@/components/table/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { toast } from "@workspace/ui/components/sonner"

export function RoleTable() {
  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const rolesQuery = useQuery({
    queryKey: ["roles", "list", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      roles.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const items = rolesQuery.data?.data?.items ?? []
  const meta = rolesQuery.data?.data?.meta
  const pageCount = Math.max(meta?.totalPages ?? 1, 1)

  const columns = useMemo<ColumnDef<RoleListItem>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Chọn tất cả"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Chọn dòng"
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },
      {
        id: "index",
        enableSorting: false,
        header: () => <div className="text-center">STT</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
            {pagination.pageIndex * pagination.pageSize + row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        enableSorting: false,
        header: "Vai trò",
        cell: ({ row }) => (
          <div className="min-w-64">
            <Badge variant="secondary">{row.original.name}</Badge>
          </div>
        ),
      },
      {
        accessorKey: "description",
        enableSorting: false,
        header: "Mô tả",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.description || "-"}</span>,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
          const role = row.original

          return (
            <div className="flex justify-end">
              <DataTableRowAction
                onEdit={() => toast.info(`Chỉnh sửa vai trò: ${role.name}`)}
                onDelete={() => toast.info(`Xóa vai trò: ${role.name}`)}
              />
            </div>
          )
        },
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  )

  return (
    <Card className="py-3">
      <CardContent className="px-3">
        <DataTable
          title="Danh sách vai trò"
          columns={columns}
          data={items}
          pagination={pagination}
          pageCount={pageCount}
          sorting={sorting}
          globalSearch={globalSearch}
          onGlobalSearchChange={(value) => {
            setGlobalSearch(value)
            setPagination((prev) => ({ ...prev, pageIndex: 0 }))
          }}
          onSortingChange={(updater: Updater<SortingState>) => {
            setSorting((prev) => (typeof updater === "function" ? updater(prev) : updater))
          }}
          onPaginationChange={(updater: Updater<PaginationState>) => {
            setPagination((prev) => (typeof updater === "function" ? updater(prev) : updater))
          }}
          toolbarRight={
            <Button type="button" className="gap-2" onClick={() => toast.info("Chức năng thêm vai trò đang được cập nhật")}>
              <Icons.plus className="size-4" />
              Thêm mới
            </Button>
          }
          isLoading={rolesQuery.isFetching}
          viewOptions
        />
      </CardContent>
    </Card>
  )
}
