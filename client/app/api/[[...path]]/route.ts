/**
 * Next.js App Router catch-all: runs the Express app for all /api/* requests
 * so frontend and backend are served from the same Vercel deployment.
 */
import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'

// Allow time for MongoDB cold start on first request
export const maxDuration = 60

const RESPONSE_TIMEOUT_MS = 28000

async function runExpress(req: NextRequest, pathSegments: string[]) {
  const pathname = '/api/' + (pathSegments?.join('/') || '')
  const url = pathname + (req.nextUrl.search || '')
  const body = await req.arrayBuffer().catch(() => null)
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k] = v })

  const { connectDB } = await import('../../../server/config/db.js')
  const app = (await import('../../../server/app.js')).default
  await connectDB()

  const responsePromise = new Promise<NextResponse>((resolve) => {
    const chunks: Buffer[] = []
    let statusCode = 200
    const resHeaders: Record<string, string> = {}
    let resolved = false
    const finish = (r: NextResponse) => {
      if (resolved) return
      resolved = true
      resolve(r)
    }

    const nodeRes = {
      statusCode: 200,
      setHeader(k: string, v: string | number | string[]) {
        resHeaders[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v)
      },
      getHeader() { return undefined },
      writeHead(code: number, h?: Record<string, string | string[]>) {
        statusCode = code
        if (h) Object.entries(h).forEach(([k, v]) => { resHeaders[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v) })
      },
      write(chunk: Buffer | string) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      },
      end(chunk?: Buffer | string) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        finish(new NextResponse(Buffer.concat(chunks), { status: statusCode, headers: resHeaders }))
      },
      status(code: number) {
        statusCode = code
        return nodeRes
      },
      json(body: unknown) {
        resHeaders['content-type'] = 'application/json'
        finish(new NextResponse(JSON.stringify(body), { status: statusCode, headers: resHeaders }))
      },
    }

    const nodeReq = Object.assign(
      Readable.from(body ? [new Uint8Array(body)] : []),
      {
        method: req.method,
        url,
        headers: headers as Record<string, string | string[] | undefined>,
      }
    ) as import('http').IncomingMessage

    app(nodeReq as any, nodeRes as any)
  })

  const timeoutPromise = new Promise<NextResponse>((resolve) => {
    setTimeout(() => {
      resolve(
        new NextResponse(
          JSON.stringify({ message: 'Request timeout. Try again.' }),
          { status: 504, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }, RESPONSE_TIMEOUT_MS)
  })

  return Promise.race([responsePromise, timeoutPromise])
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return runExpress(req, path ?? [])
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return runExpress(req, path ?? [])
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return runExpress(req, path ?? [])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return runExpress(req, path ?? [])
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return runExpress(req, path ?? [])
}
