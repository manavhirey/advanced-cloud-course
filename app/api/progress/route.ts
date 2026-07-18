import { NextResponse } from 'next/server'
import { applyProgress } from '@/lib/api'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const r = applyProgress(body)
  return NextResponse.json(r.body, { status: r.status })
}
