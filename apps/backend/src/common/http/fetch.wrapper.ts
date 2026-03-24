import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common"

type Primitive = string | number | boolean
type QueryValue = Primitive | null | undefined

type RequestOptions<TBody = unknown> = {
  query?: Record<string, QueryValue>
  body?: TBody
  timeoutMs?: number
}

@Injectable()
export class FetchWrapper {
  constructor(
    private readonly baseURL = "",
    private readonly defaultTimeoutMs = 10000
  ) {}

  async get<TResponse>(url: string, options?: RequestOptions, headers?: Record<string, string>): Promise<TResponse> {
    return this.request<TResponse>("GET", url, options, headers)
  }

  async post<TResponse, TBody = unknown>(
    url: string,
    options?: RequestOptions<TBody>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>("POST", url, options, headers)
  }

  async put<TResponse, TBody = unknown>(
    url: string,
    options?: RequestOptions<TBody>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>("PUT", url, options, headers)
  }

  async patch<TResponse, TBody = unknown>(
    url: string,
    options?: RequestOptions<TBody>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>("PATCH", url, options, headers)
  }

  async delete<TResponse>(url: string, options?: RequestOptions, headers?: Record<string, string>): Promise<TResponse> {
    return this.request<TResponse>("DELETE", url, options, headers)
  }

  private async request<TResponse, TBody = unknown>(
    method: string,
    url: string,
    options?: RequestOptions<TBody>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? this.defaultTimeoutMs)

    try {
      const finalUrl = this.buildUrl(url, options?.query)
      const hasBody = options?.body !== undefined && method !== "GET" && method !== "DELETE"
      const isFormDataBody = options?.body instanceof FormData
      const isUrlEncodedBody = options?.body instanceof URLSearchParams

      const response = await fetch(finalUrl, {
        method,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(hasBody && !isFormDataBody && !isUrlEncodedBody ? { "Content-Type": "application/json" } : {}),
          ...(headers ?? {}),
        },
        body: hasBody
          ? isFormDataBody || isUrlEncodedBody
            ? (options?.body as FormData | URLSearchParams)
            : JSON.stringify(options?.body)
          : undefined,
      })

      const data = await this.parseResponse(response)

      if (!response.ok) {
        throw this.mapHttpError(response.status, data)
      }

      return data as TResponse
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new GatewayTimeoutException("Request timed out")
      }

      if (
        error instanceof BadGatewayException ||
        error instanceof GatewayTimeoutException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error
      }

      throw new ServiceUnavailableException("Upstream service is unavailable")
    } finally {
      clearTimeout(timeout)
    }
  }

  private buildUrl(url: string, query?: Record<string, QueryValue>): string {
    const target = new URL(url, this.baseURL || undefined)

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          target.searchParams.set(key, String(value))
        }
      }
    }

    return target.toString()
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? ""
    const allowedReturnJson = ["application/json", "application/www-form-urlencoded", "text/json"]

    if (allowedReturnJson.includes(contentType.split(";")[0].trim())) {
      return response.json()
    }

    const text = await response.text()
    return text || null
  }

  private mapHttpError(status: number, payload: unknown) {
    const message = this.extractMessage(payload)

    if (status === 408 || status === 504) {
      return new GatewayTimeoutException(message ?? "Request timed out")
    }

    if (status === 429 || status === 503) {
      return new ServiceUnavailableException(message ?? "Service temporarily unavailable")
    }

    return new BadGatewayException(message ?? "Upstream request failed")
  }

  private extractMessage(payload: unknown): string | undefined {
    if (typeof payload === "string" && payload.trim()) {
      return payload
    }

    if (!payload || typeof payload !== "object") {
      return undefined
    }

    if ("message" in payload) {
      const value = (payload as { message?: unknown }).message
      if (typeof value === "string" && value.trim()) return value
      if (Array.isArray(value) && typeof value[0] === "string") return value[0]
    }

    if ("error" in payload) {
      const value = (payload as { error?: unknown }).error
      if (typeof value === "string" && value.trim()) return value
    }

    return undefined
  }
}
