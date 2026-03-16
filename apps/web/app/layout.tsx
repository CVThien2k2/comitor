import { Nunito, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { AppProvider } from "@/components/providers/app-provider"
import { SocketProvider } from "@/components/providers/socket-provider"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/sonner"

const fontSans = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", fontSans.variable)}
    >
      <body>
        <QueryProvider>
          <Toaster position="bottom-right" richColors />
          <ThemeProvider>
            <AppProvider>
              <SocketProvider>{children}</SocketProvider>
            </AppProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
