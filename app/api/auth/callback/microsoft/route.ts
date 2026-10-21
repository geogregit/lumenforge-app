import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=not_logged_in', request.url))
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

  await supabase.from('user_tokens').upsert({
    user_id: user.id,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
  })

  return NextResponse.redirect(new URL('/?connected=outlook', request.url))
}
