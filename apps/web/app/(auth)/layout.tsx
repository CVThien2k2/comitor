import { GuestWrapper } from "@/components/providers/guest-wrapper"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <GuestWrapper>{children}</GuestWrapper>
}
