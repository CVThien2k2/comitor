"use client"

import { accountCustomers, type AccountCustomerListItem } from "@/api"
import DataTable from "@/components/table/data-table"
import { channelMeta, getAvatarColor, getInitials, getProviderLabel } from "@/lib/helper"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import Image from "next/image"
import { useMemo, useState } from "react"

export function AccountCustomerTable() {
  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const customersQuery = useQuery({
    queryKey: ["account-customers", "list", pagination.pageIndex, pagination.pageSize, globalSearch],
    queryFn: () =>
      accountCustomers.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const items = customersQuery.data?.data?.items ?? []
  const meta = customersQuery.data?.data?.meta
  const pageCount = Math.max(meta?.totalPages ?? 1, 1)

  const columns = useMemo<ColumnDef<AccountCustomerListItem>[]>(
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
        accessorKey: "accountId",
        enableSorting: false,
        header: "Tài khoản khách",
        cell: ({ row }) => {
          const customer = row.original
          const displayName = customer.goldenProfile?.fullName || customer.accountId

          return (
            <div className="flex min-w-64 items-center gap-3">
              <Avatar className="size-9 ring-1 ring-primary/30">
                {customer.avatarUrl ? <AvatarImage src={customer.avatarUrl} alt={displayName} /> : null}
                <AvatarFallback style={{ backgroundColor: getAvatarColor(customer.id), color: "#fff" }}>
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{customer.accountId}</span>
            </div>
          )
        },
      },
      {
        id: "customerName",
        enableSorting: false,
        header: "Khách hàng",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm text-foreground">{row.original.goldenProfile?.fullName || "Chưa liên kết hồ sơ"}</p>
            <p className="text-xs text-muted-foreground">{row.original.goldenProfile?.primaryPhone || "-"}</p>
          </div>
        ),
      },
      {
        id: "channel",
        enableSorting: false,
        header: "Kênh",
        cell: ({ row }) => {
          const provider = row.original.linkedAccount?.provider
          const providerMeta = provider ? channelMeta[provider] : undefined

          return (
            <div className="space-y-1">
              <Badge variant="outline" className="w-fit gap-1.5 pr-2 pl-1.5">
                <span className="flex size-5 items-center justify-center rounded-sm bg-muted/70">
                  <Image
                    src={providerMeta?.iconSrc ?? "/icon.png"}
                    alt={provider ? getProviderLabel(provider) : "Kênh"}
                    width={14}
                    height={14}
                    className="rounded-full object-contain"
                  />
                </span>
                <span>{provider ? getProviderLabel(provider) : "-"}</span>
              </Badge>
              <p className="text-xs text-muted-foreground">{row.original.linkedAccount?.displayName || "-"}</p>
            </div>
          )
        },
      },
      {
        id: "status",
        enableSorting: false,
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
              {row.original.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
            </Badge>
            <Badge variant={row.original.isOnline ? "default" : "outline"}>
              {row.original.isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        ),
      },
      // {
      //   id: "actions",
      //   enableSorting: false,
      //   enableHiding: false,
      //   header: () => <div className="text-right">Thao tác</div>,
      //   cell: ({ row }) => (
      //     <div className="flex justify-end">
      //       <DataTableRowAction onEdit={() => toast.info(`Chỉnh sửa tài khoản: ${row.original.accountId}`)} />
      //     </div>
      //   ),
      // },
    ],
    [pagination.pageIndex, pagination.pageSize]
  )

  return (
    <Card className="py-3">
      <CardContent className="px-3">
        <DataTable
          title="Danh sách tài khoản khách hàng"
          description="Danh sách tài khoản khách theo từng kênh, trạng thái kết nối và liên kết với hồ sơ khách hàng."
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
          isLoading={customersQuery.isFetching}
          viewOptions
        />
      </CardContent>
    </Card>
  )
}
