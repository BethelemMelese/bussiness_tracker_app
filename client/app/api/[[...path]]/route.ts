/**
 * Next.js App Router catch-all: proxies /api/* requests to the deployed backend
 * using NEXT_PUBLIC_API_URL (e.g. https://your-server.vercel.app/api).
 */
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const RESPONSE_TIMEOUT_MS = 28000

// Headers we don't forward to the backend (host, connection, etc.)
const SKIP_HEADERS = new Set(['host', 'connection', 'keep-alive'])

function getBackendUrl(pathSegments: string[], search: string): string | null {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base || typeof base !== 'string') return null
  const path = pathSegments?.length ? pathSegments.join('/') : ''
  const url = path ? `${base.replace(/\/$/, '')}/${path}${search}` : `${base.replace(/\/$/, '')}${search}`
  return url
}

async function proxyToBackend(req: NextRequest, pathSegments: string[]) {
  const search = req.nextUrl.search || ''
  const backendUrl = getBackendUrl(pathSegments ?? [], search)
  if (!backendUrl) {
    return new NextResponse(
      JSON.stringify({ message: 'NEXT_PUBLIC_API_URL is not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => {
    if (!SKIP_HEADERS.has(k.toLowerCase())) headers[k] = v
  })

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.arrayBuffer().catch(() => null)
    : null

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), RESPONSE_TIMEOUT_MS)

  try {
    const res = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body ?? undefined,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const resHeaders = new Headers()
    res.headers.forEach((v, k) => {
      const lower = k.toLowerCase()
      if (lower !== 'transfer-encoding') resHeaders.set(k, v)
    })
    const resBody = await res.arrayBuffer()
    return new NextResponse(resBody, { status: res.status, headers: resHeaders })
  } catch (err) {
    clearTimeout(timeoutId)
    const message = err instanceof Error && err.name === 'AbortError'
      ? 'Request timeout. Try again.'
      : (err instanceof Error ? err.message : 'Backend request failed')
    return new NextResponse(
      JSON.stringify({ message }),
      { status: 504, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return proxyToBackend(req, path ?? [])
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return proxyToBackend(req, path ?? [])
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return proxyToBackend(req, path ?? [])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return proxyToBackend(req, path ?? [])
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return proxyToBackend(req, path ?? [])
}
