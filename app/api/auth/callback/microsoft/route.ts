import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const userId = request.nextUrl.searchParams.get('state')
  if (!code || !userId) {
    return NextResponse.redirect(new URL('/?error=missing_params', request.url))
  }

  const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()
  if (!tokens.access_token) {
    return NextResponse.redirect(new URL('/?error=token_failed', request.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('user_tokens').upsert({
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
  })

  if (error) {
    console.error(error)
    return NextResponse.redirect(new URL('/?error=db_failed', request.url))
  }

  return NextResponse.redirect(new URL('/?connected=outlook', request.url))
}
