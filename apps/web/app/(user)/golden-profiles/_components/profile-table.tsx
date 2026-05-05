"use client"

import { type GoldenProfileRecord, goldenProfiles } from "@/api"
import DataTable from "@/components/table/data-table"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { Card, CardContent } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { useMemo, useState } from "react"

const customerTypeMeta: Record<
  string,
  {
    label: string
    className: string
  }
> = {
  individual: {
    label: "Khách cá nhân",
    className: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  business: {
    label: "Khách doanh nghiệp",
    className: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  agent: {
    label: "Khách đại lý",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
}

export function ProfileTable() {
  const router = useRouter()
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

  const items = useMemo(
    () =>
      (profilesQuery.data?.data?.items ?? []).map((item) => {
        const fallbackId = (item as GoldenProfileRecord & { goldenProfileId?: string }).goldenProfileId
        return {
          ...item,
          id: item.id ?? fallbackId ?? "",
        }
      }),
    [profilesQuery.data?.data?.items]
  )
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
        cell: ({ row }) => {
          const meta = customerTypeMeta[row.original.customerType] ?? {
            label: row.original.customerType,
            className: "border-border bg-muted/40 text-foreground",
          }

          return (
            <Badge variant="outline" className={cn("font-medium", meta.className)}>
              {meta.label}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
          const profile = row.original
          const profileId = profile.id?.trim()

          return (
            <div className="flex justify-end">
              <DataTableRowAction
                onEdit={() => {
                  if (!profileId) {
                    toast.error("Không tìm thấy mã hồ sơ để chuyển trang chỉnh sửa.")
                    return
                  }
                  router.push(`/golden-profiles/${profileId}`)
                }}
              />
            </div>
          )
        },
      },
    ],
    [pagination.pageIndex, pagination.pageSize, router]
  )

  return (
    <Card className="py-3">
      <CardContent className="px-3">
        <DataTable
          title="Danh sách hồ sơ khách hàng"
          description="Theo dõi thông tin nhận diện và liên hệ chính của hồ sơ khách hàng (Golden Profile)."
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
