import { GuestWrapper } from "@/components/providers/guest-wrapper"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestWrapper>
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {children}
      </div>
    </GuestWrapper>
  )
}
