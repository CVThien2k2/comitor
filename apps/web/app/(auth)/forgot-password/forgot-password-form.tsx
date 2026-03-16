"use client"

import { useState } from "react"
import Link from "next/link"
import { Icons } from "@/components/global/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ROUTES } from "@/lib/routes"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full">
              <Icons.checkCircle className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Kiểm tra email của bạn</CardTitle>
          <CardDescription className="text-base">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 text-sm">
            <p>Không nhận được email? Kiểm tra thư mục spam hoặc thử lại với địa chỉ email khác.</p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
            Thử lại với email khác
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href={ROUTES["sign-in"].path}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Icons.arrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl">
            <span className="text-xl font-bold">C</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Quên mật khẩu?</CardTitle>
        <CardDescription>
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Icons.mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="h-10 pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href={ROUTES["sign-in"].path}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Icons.arrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>
      </CardFooter>
    </Card>
  )
}
