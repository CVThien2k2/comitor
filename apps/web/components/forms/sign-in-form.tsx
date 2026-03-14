"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ROUTES } from "@/lib/routes"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? "Đăng nhập thất bại")
        return
      }

      if (data.accessToken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.accessToken)
        }
        router.push("/")
      }
    } catch {
      setError("Không thể kết nối đến server. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Đăng nhập
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Nhập thông tin để truy cập hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-neutral-300 text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 pl-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-neutral-300 text-sm font-medium">
                Mật khẩu
              </label>
              <Link
                href={ROUTES["forgot-password"].path}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 pl-10 pr-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-white focus:ring-neutral-500"
            />
            <label
              htmlFor="remember"
              className="text-sm font-normal text-neutral-400 cursor-pointer"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-white text-neutral-900 hover:bg-neutral-200"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-400">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/register"
            className="text-white hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
