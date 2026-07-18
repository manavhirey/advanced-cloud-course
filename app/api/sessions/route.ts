import { NextResponse } from 'next/server'
import { addSession } from '@/lib/api'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const r = addSession(body)
  return NextResponse.json(r.body, { status: r.status })
}
