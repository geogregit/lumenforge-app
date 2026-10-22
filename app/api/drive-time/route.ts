import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  if (!from || !to || !key) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(from)}&destinations=${encodeURIComponent(to)}&key=${key}`
    const res = await fetch(url)
    const data = await res.json()
    const element = data.rows?.[0]?.elements?.[0]
    if (element?.status === 'OK' && element.duration?.value) {
      return NextResponse.json({ minutes: Math.round(element.duration.value / 60) })
    }
    return NextResponse.json({ error: element?.status || 'Failed' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
