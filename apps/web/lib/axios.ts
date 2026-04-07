import axios from "axios"
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/stores/auth-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

// Request: auto attach access token
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Routes that should not attempt refresh on 401
const SKIP_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout"]

let refreshPromise: Promise<string> | null = null

function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = axios
    .post<{ data: { accessToken: string } }>(`${API_URL}/auth/refresh`, null, {
      withCredentials: true,
    })
    .then((res) => {
      const newToken = res.data.data.accessToken
      useAuthStore.setState({ accessToken: newToken })
      return newToken
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

// Response: unwrap response.data, handle 401 with refresh
instance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retried?: boolean }
    const requestUrl = originalRequest?.url ?? ""
    const is401 = error.response?.status === 401
    const shouldRefresh = is401 && !originalRequest._retried && !SKIP_REFRESH.some((r) => requestUrl.includes(r))

    if (shouldRefresh) {
      originalRequest._retried = true
      try {
        const newToken = await doRefresh()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return instance(originalRequest).then((res) => res)
      } catch {
        useAuthStore.getState().clearAuth()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        return Promise.reject(error.response?.data ?? error)
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
