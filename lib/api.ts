const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export interface ApiClient {
  auth: {
    register: (email: string, password: string, name?: string) => Promise<{ token: string; user: { id: string; email: string; name: string } }>
    login: (email: string, password: string) => Promise<{ token: string; user: { id: string; email: string; name: string } }>
    me: () => Promise<{ user: { id: string; email: string; name: string } }>
  }
  capital: {
    get: () => Promise<{ monthlyIncome: number; savings: number; target: number }>
    update: (data: { monthlyIncome?: number; savings?: number; target?: number }) => Promise<{ monthlyIncome: number; savings: number; target: number }>
    addIncome: (amount: number) => Promise<{ monthlyIncome: number; savings: number; target: number }>
  }
  study: { get: () => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }>; addSession: (hours: number, topic?: string) => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }>; updateSession: (id: string, data: { hours?: number; topic?: string; date?: string }) => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }>; deleteSession: (id: string) => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }> }
  market: { get: () => Promise<{ stores: { id: string; name: string; category: string; notes: string }[]; competitors: { id: string; name: string; category: string; notes: string }[]; suppliers: { id: string; name: string; category: string; notes: string }[] }>; addItem: (name: string, category: 'store' | 'competitor' | 'supplier', notes?: string) => Promise<unknown>; updateItem: (category: 'store' | 'competitor' | 'supplier', id: string, data: { name?: string; notes?: string; category?: 'store' | 'competitor' | 'supplier' }) => Promise<unknown>; deleteItem: (category: 'store' | 'competitor' | 'supplier', id: string) => Promise<unknown> }
  financial: { get: () => Promise<{ costPerUnit: number; sellingPrice: number; monthlyFixedCosts: number; unitsSoldPerMonth: number }>; update: (data: { costPerUnit: number; sellingPrice: number; monthlyFixedCosts: number; unitsSoldPerMonth: number }) => Promise<unknown> }
  discipline: { get: () => Promise<{ habits: { id: string; name: string; checkedDays: boolean[]; startDate: string; habitFormed: boolean }[] }>; addHabit: (name: string) => Promise<unknown>; updateHabit: (id: string, data: { checkedDays?: boolean[]; habitFormed?: boolean; name?: string }) => Promise<unknown>; deleteHabit: (id: string) => Promise<unknown> }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data.message as string) || 'Request failed')
  }
  return data as T
}

export const api: ApiClient = {
  auth: {
    register: (email: string, password: string, name?: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () =>
      request<{ user: { id: string; email: string; name: string } }>('/auth/me'),
  },
  capital: {
    get: () => request<{ monthlyIncome: number; savings: number; target: number }>('/capital'),
    update: (data: { monthlyIncome?: number; savings?: number; target?: number }) =>
      request<{ monthlyIncome: number; savings: number; target: number }>('/capital', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    addIncome: (amount: number) =>
      request<{ monthlyIncome: number; savings: number; target: number }>('/capital/add-income', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
  },
  study: {
    get: () =>
      request<{
        dailyHours: number
        topics: { id: string; hours: number; topic: string; date: string }[]
      }>('/study'),
    addSession: (hours: number, topic?: string) =>
      request<{
        dailyHours: number
        topics: { id: string; hours: number; topic: string; date: string }[]
      }>('/study/session', {
        method: 'POST',
        body: JSON.stringify({ hours, topic }),
      }),
    updateSession: (id: string, data: { hours?: number; topic?: string; date?: string }) =>
      request<{
        dailyHours: number
        topics: { id: string; hours: number; topic: string; date: string }[]
      }>(`/study/session/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteSession: (id: string) =>
      request<{
        dailyHours: number
        topics: { id: string; hours: number; topic: string; date: string }[]
      }>(`/study/session/${id}`, { method: 'DELETE' }),
  },
  market: {
    get: () =>
      request<{
        stores: { id: string; name: string; category: string; notes: string }[]
        competitors: { id: string; name: string; category: string; notes: string }[]
        suppliers: { id: string; name: string; category: string; notes: string }[]
      }>('/market'),
    addItem: (name: string, category: 'store' | 'competitor' | 'supplier', notes?: string) =>
      request('/market/item', {
        method: 'POST',
        body: JSON.stringify({ name, category, notes }),
      }),
    updateItem: (
      category: 'store' | 'competitor' | 'supplier',
      id: string,
      data: { name?: string; notes?: string; category?: 'store' | 'competitor' | 'supplier' }
    ) =>
      request(`/market/item/${category}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteItem: (category: 'store' | 'competitor' | 'supplier', id: string) =>
      request(`/market/item/${category}/${id}`, { method: 'DELETE' }),
  },
  financial: {
    get: () =>
      request<{
        costPerUnit: number
        sellingPrice: number
        monthlyFixedCosts: number
        unitsSoldPerMonth: number
      }>('/financial'),
    update: (data: {
      costPerUnit: number
      sellingPrice: number
      monthlyFixedCosts: number
      unitsSoldPerMonth: number
    }) =>
      request('/financial', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  discipline: {
    get: () =>
      request<{
        habits: {
          id: string
          name: string
          checkedDays: boolean[]
          startDate: string
          habitFormed: boolean
        }[]
      }>('/discipline'),
    addHabit: (name: string) =>
      request('/discipline/habit', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    updateHabit: (id: string, data: { checkedDays?: boolean[]; habitFormed?: boolean; name?: string }) =>
      request(`/discipline/habit/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteHabit: (id: string) =>
      request(`/discipline/habit/${id}`, { method: 'DELETE' }),
  },
}
