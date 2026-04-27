import { Wrapper } from "@/components/global/wrapper-content"
import { ROUTES } from "@/lib/routes"
import { Metadata } from "next"
import { LinkAcounts } from "./link-acounts"

export const metadata: Metadata = ROUTES.links.metadata

export default function AccountsPage() {
  return (
    <Wrapper className="space-y-6">
      <LinkAcounts />
    </Wrapper>
  )
}
