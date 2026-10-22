import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  if (!from || !to || !key) {
    return NextResponse.json({ error: 'Missing params or key' }, { status: 400 })
  }

  try {
    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'routes.duration'
      },
      body: JSON.stringify({
        origin: { address: from },
        destination: { address: to },
        travelMode: 'DRIVE'
      })
    })
    const data = await res.json()
    const duration = data.routes?.[0]?.duration
    if (duration) {
      const seconds = parseInt(duration.replace('s', ''))
      return NextResponse.json({ minutes: Math.round(seconds / 60) })
    }
    return NextResponse.json({ error: data.error?.message || 'No route' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { origin, destinations } = await request.json()
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  if (!origin || !destinations?.length || !key) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  try {
    const intermediates = destinations.map((addr: string) => ({ address: addr }))
    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'routes.duration,routes.optimizedIntermediateWaypointIndex'
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: origin },
        intermediates,
        travelMode: 'DRIVE',
        optimizeWaypointOrder: true
      })
    })
    const data = await res.json()
    const route = data.routes?.[0]
    if (route) {
      const seconds = parseInt(route.duration?.replace('s', '') || '0')
      return NextResponse.json({
        totalMinutes: Math.round(seconds / 60),
        order: route.optimizedIntermediateWaypointIndex || destinations.map((_: any, i: number) => i)
      })
    }
    return NextResponse.json({ error: data.error?.message || 'No route' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
