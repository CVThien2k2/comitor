import { api } from "@/lib/axios"
import { LoginSchema } from "@/lib/schema"
import type { ApiResponse, AuthResponse } from "@workspace/shared"
import type { ForgotPasswordSchema } from "@/lib/schema/auth"

export const auth = {
  login: (payload: LoginSchema) => api.post<ApiResponse<AuthResponse>>("/auth/login", payload),
  logout: () => api.post<ApiResponse<null>>("/auth/logout"),
  forgotPassword: (payload: ForgotPasswordSchema) =>
    api.post<ApiResponse<string>>("/auth/forgot-password", payload),
  resetPassword: (payload: { token: string; password: string }) =>
    api.post<ApiResponse<string>>("/auth/reset-password", payload),
}
