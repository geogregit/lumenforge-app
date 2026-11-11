'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (pathname === '/login') return <>{children}</>

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex">
          <div className="w-64 bg-black text-white min-h-screen p-4">
            <div className="font-bold mb-6">LumenForge</div>
            <Link href="/" className="block py-2">Dashboard</Link>
            <Link href="/notifications" className="block py-2">Notifications</Link>
            <button onClick={handleLogout} className="mt-4 text-xs">Logout</button>
          </div>
          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
