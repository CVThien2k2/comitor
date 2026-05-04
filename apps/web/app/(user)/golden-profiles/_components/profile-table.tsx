"use client"

import { type GoldenProfileRecord, goldenProfiles } from "@/api"
import DataTable from "@/components/table/data-table"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { useMemo, useState } from "react"

export function ProfileTable() {
  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const profilesQuery = useQuery({
    queryKey: ["golden-profiles", "list", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      goldenProfiles.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const items = profilesQuery.data?.data?.items ?? []
  const meta = profilesQuery.data?.data?.meta
  const pageCount = Math.max(meta?.totalPages ?? 1, 1)

  const columns = useMemo<ColumnDef<GoldenProfileRecord>[]>(
    () => [
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
        accessorKey: "fullName",
        enableSorting: false,
        header: "Họ tên",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.fullName || "Chưa cập nhật"}</span>
        ),
      },
      {
        accessorKey: "primaryPhone",
        enableSorting: false,
        header: "Số điện thoại",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.primaryPhone || "-"}</span>,
      },
      {
        accessorKey: "primaryEmail",
        enableSorting: false,
        header: "Email",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.primaryEmail || "-"}</span>,
      },
      {
        id: "customerType",
        enableSorting: false,
        header: "Loại khách",
        cell: ({ row }) => <Badge variant="outline">{row.original.customerType}</Badge>,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
          const profile = row.original

          return (
            <div className="flex justify-end">
              <DataTableRowAction onEdit={() => toast.info(`Chỉnh sửa hồ sơ: ${profile.fullName || profile.id}`)} />
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
          title="Danh sách hồ sơ khách hàng"
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
          isLoading={profilesQuery.isFetching}
          viewOptions
        />
      </CardContent>
    </Card>
  )
}
