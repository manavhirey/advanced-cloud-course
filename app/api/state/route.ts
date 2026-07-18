import { NextResponse } from 'next/server'
import { getState } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const r = getState()
  return NextResponse.json(r.body, { status: r.status })
}
