'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
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
          <div className={`bg-black text-white flex flex-col relative ${open ? 'w-64' : 'w-16'}`}>
            <div className="p-4 flex items-center justify-between border-b border-gray-800">
              {open && <div className="font-bold">LumenForge</div>}
              <button onClick={() => setOpen(!open)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <Link href="/" className="flex items-center py-3 px-4 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                {open && <span className="ml-3">Dashboard</span>}
              </Link>
              <Link href="/book" className="flex items-center py-3 px-4 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
                {open && <span className="ml-3">Schedule</span>}
              </Link>
              <Link href="/notifications" className="flex items-center py-3 px-4 hover:bg-gray-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                {open && <span className="ml-3">Notifications</span>}
              </Link>
            </div>
            <button onClick={() => setOpen(!open)} className="absolute top-1/2 -right-4 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow">
              {open ? '<' : '>'}
            </button>
            <div className="border-t border-gray-700 p-4">
              <Link href="/settings" className="flex items-center">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                {open && (
                  <div className="ml-3 text-xs">
                    <div>{user?.email?.split('@')[0]}</div>
                    <div className="text-gray-400">{user?.email}</div>
                  </div>
                )}
              </Link>
              {open && <button onClick={handleLogout} className="mt-3 text-xs text-gray-400 hover:text-white">Logout</button>}
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
