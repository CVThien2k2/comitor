import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { linkAccounts, type LinkAccountQuery } from "@/api/link-accounts"

const KEYS = {
  all: ["link-accounts"] as const,
  list: (query?: LinkAccountQuery) => [...KEYS.all, "list", query] as const,
  detail: (id: string) => [...KEYS.all, "detail", id] as const,
}

export function useLinkAccounts(query?: LinkAccountQuery) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn: () => linkAccounts.getAll(query),
    select: (res) => res.data,
  })
}

export function useLinkAccountDetail(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => linkAccounts.getById(id),
    enabled: !!id,
    select: (res) => res.data,
  })
}

export function useDeleteLinkAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => linkAccounts.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useLinkZaloOa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: linkAccounts.linkZaloOa,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useLinkMeta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: linkAccounts.linkMeta,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}
