const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

type MarketItem = { id: string; name: string; category: 'store' | 'competitor' | 'supplier'; notes: string }
type MarketResponse = { stores: MarketItem[]; competitors: MarketItem[]; suppliers: MarketItem[] }

export type DisciplineResponse = {
  habits: { id: string; name: string; checkedDays: boolean[]; startDate: string; habitFormed: boolean }[]
}

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
  study: { get: () => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }>; addSession: (hours: number, topic?: string) => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }>; updateSession: (id: string, data: { hours?: number; topic?: string; date?: string }) => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }>; deleteSession: (id: string) => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }>; deleteAll: () => Promise<{ dailyHours: number; topics: { id: string; hours: number; topic: string; date: string }[] }> }
  market: { get: () => Promise<MarketResponse>; addItem: (name: string, category: 'store' | 'competitor' | 'supplier', notes?: string) => Promise<MarketResponse>; updateItem: (category: 'store' | 'competitor' | 'supplier', id: string, data: { name?: string; notes?: string; category?: 'store' | 'competitor' | 'supplier' }) => Promise<MarketResponse>; deleteItem: (category: 'store' | 'competitor' | 'supplier', id: string) => Promise<MarketResponse>; deleteAll: () => Promise<MarketResponse> }
  financial: { get: () => Promise<{ costPerUnit: number; sellingPrice: number; monthlyFixedCosts: number; unitsSoldPerMonth: number }>; update: (data: { costPerUnit: number; sellingPrice: number; monthlyFixedCosts: number; unitsSoldPerMonth: number }) => Promise<unknown> }
  discipline: { get: () => Promise<DisciplineResponse>; addHabit: (name: string) => Promise<DisciplineResponse>; updateHabit: (id: string, data: { checkedDays?: boolean[]; habitFormed?: boolean; name?: string; startDate?: string }) => Promise<DisciplineResponse>; deleteHabit: (id: string) => Promise<DisciplineResponse>; deleteAll: () => Promise<DisciplineResponse> }
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
    deleteAll: () =>
      request<{
        dailyHours: number
        topics: { id: string; hours: number; topic: string; date: string }[]
      }>('/study', { method: 'DELETE' }),
  },
  market: {
    get: () => request<MarketResponse>('/market'),
    addItem: (name: string, category: 'store' | 'competitor' | 'supplier', notes?: string) =>
      request<MarketResponse>('/market/item', {
        method: 'POST',
        body: JSON.stringify({ name, category, notes }),
      }),
    updateItem: (
      category: 'store' | 'competitor' | 'supplier',
      id: string,
      data: { name?: string; notes?: string; category?: 'store' | 'competitor' | 'supplier' }
    ) =>
      request<MarketResponse>(`/market/item/${category}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteItem: (category: 'store' | 'competitor' | 'supplier', id: string) =>
      request<MarketResponse>(`/market/item/${category}/${id}`, { method: 'DELETE' }),
    deleteAll: () => request<MarketResponse>('/market', { method: 'DELETE' }),
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
    get: () => request<DisciplineResponse>('/discipline'),
    addHabit: (name: string) =>
      request<DisciplineResponse>('/discipline/habit', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    updateHabit: (id: string, data: { checkedDays?: boolean[]; habitFormed?: boolean; name?: string; startDate?: string }) =>
      request<DisciplineResponse>(`/discipline/habit/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteHabit: (id: string) =>
      request<DisciplineResponse>(`/discipline/habit/${id}`, { method: 'DELETE' }),
    deleteAll: () => request<DisciplineResponse>('/discipline', { method: 'DELETE' }),
  },
}
