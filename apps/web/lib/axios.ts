import axios from "axios"
import type { AxiosRequestConfig } from "axios"
import { useAuthStore } from "@/stores/auth-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

// Request: auto attach access token
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Routes that should not redirect to login on 401
const SKIP_401_REDIRECT = ["/auth/login", "/auth/refresh"]

// Response: unwrap response.data, handle 401
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const requestUrl = error.config?.url ?? ""
    const shouldRedirect =
      error.response?.status === 401 && !SKIP_401_REDIRECT.some((route) => requestUrl.includes(route))

    if (shouldRedirect) {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error.response?.data ?? error)
  }
)

// Override types so return type matches interceptor (unwrapped response.data)
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => instance.get(url, config) as Promise<T>,
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.post(url, data, config) as Promise<T>,
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.put(url, data, config) as Promise<T>,
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.patch(url, data, config) as Promise<T>,
  delete: <T>(url: string, config?: AxiosRequestConfig) => instance.delete(url, config) as Promise<T>,
}
