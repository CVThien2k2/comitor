"use client"

import { useQuery } from "@tanstack/react-query"
import { linkAccounts } from "@/api/link-accounts"

export function LinkAcountTable() {
  const linkAccountsQuery = useQuery({
    queryKey: ["link-accounts"],
    queryFn: () => linkAccounts.getAll(),
  })

  return <pre>{JSON.stringify(linkAccountsQuery.data?.data, null, 2)}</pre>
}
