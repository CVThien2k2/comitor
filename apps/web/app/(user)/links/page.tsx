import { ChannelsPage } from "@/components/channels/channels-page"
import { Metadata } from "next"
import { ROUTES } from "@/lib/routes"

export const metadata: Metadata = ROUTES.links.metadata

export default function AccountsPage() {
  return <ChannelsPage />
}
