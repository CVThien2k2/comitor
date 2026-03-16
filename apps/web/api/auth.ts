import { api } from "@/lib/axios"
import { LoginSchema } from "@/lib/schema"
import type { ApiResponse, AuthResponse } from "@workspace/shared"

export const auth = {
  login: (payload: LoginSchema) => api.post<ApiResponse<AuthResponse>>("/auth/login", payload),
  logout: () => api.post<ApiResponse<null>>("/auth/logout"),
}
