import { Wrapper } from "@/components/global/wrapper-content"
import { LinkedAccountsGridSkeleton } from "@/app/(user)/links/_components/linked-accounts-grid-skeleton"
import { Metadata } from "next"
import { ROUTES } from "@/lib/routes"
import { LinkAcounts } from "./link-acounts"
import { Suspense } from "react"

export const metadata: Metadata = ROUTES.links.metadata

export default function AccountsPage() {
  return (
    <Wrapper className="space-y-6">
      <Suspense fallback={<LinkedAccountsGridSkeleton />}>
        <LinkAcounts />
      </Suspense>
    </Wrapper>
  )
}
