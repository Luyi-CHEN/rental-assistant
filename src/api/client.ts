const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'
const API_KEY = import.meta.env.VITE_API_KEY || ''

interface ApiResponse<T> {
  ok: boolean
  data?: T
  error?: { code: string; message: string }
}

class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}/api${path}`
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
  }

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })

    const json: ApiResponse<T> = await res.json()

    if (!json.ok) {
      throw new ApiError(
        json.error?.code || 'UNKNOWN',
        json.error?.message || '请求失败',
        res.status,
      )
    }

    return json.data as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    if ((err as Error).name === 'AbortError') {
      throw new ApiError('TIMEOUT', '请求超时，请检查网络', 408)
    }
    throw new ApiError('NETWORK', '网络连接失败', 0)
  } finally {
    clearTimeout(timeout)
  }
}

export async function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  })
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}

export { ApiError }
