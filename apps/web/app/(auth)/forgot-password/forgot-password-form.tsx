"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icons } from "@/components/global/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldLabel, FieldError, FieldGroup } from "@workspace/ui/components/field"
import { ROUTES } from "@/lib/routes"
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/schema/auth"

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (values: ForgotPasswordSchema) => {
    // TODO: gọi API forgot password
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubmittedEmail(values.email)
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
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{" "}
            <span className="font-medium">{submittedEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 text-sm">
            <p>Không nhận được email? Kiểm tra thư mục spam hoặc thử lại với địa chỉ email khác.</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSubmitted(false)
              form.reset()
            }}
          >
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <div className="relative">
                    <Icons.mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      aria-invalid={fieldState.invalid}
                      className="h-10 pl-10"
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Đang gửi..." : "Gửi hướng dẫn đặt lại"}
            </Button>
          </FieldGroup>
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
