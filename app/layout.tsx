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
        <div className="flex min-h-screen">
          <div className="w-64 bg-black text-white flex flex-col">
            <div className="p-4 font-bold">LumenForge</div>
            <div className="flex-1">
              <Link href="/" className="block py-2 px-4 hover:bg-gray-800">Dashboard</Link>
              <Link href="/notifications" className="block py-2 px-4 hover:bg-gray-800">Notifications</Link>
            </div>
            <div className="border-t border-gray-700 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="ml-3 text-xs">
                  <div>{user?.email?.split('@')[0]}</div>
                  <div className="text-gray-400">{user?.email}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="mt-3 text-xs text-gray-400 hover:text-white">Logout</button>
            </div>
          </div>
          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
