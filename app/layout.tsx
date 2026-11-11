'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    setOpen(window.innerWidth >= 768)
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
          <div className={`fixed top-0 left-0 h-full bg-black text-white z-40 transition-all duration-200 ${open ? 'w-64' : 'w-16'} flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              {open && <span className="font-bold">LumenForge</span>}
              <button onClick={() => setOpen(!open)} className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="flex-1 py-4">
              <Link href="/" className="flex items-center px-4 py-3 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="text-xl">🏠</span>
                {open && <span className="ml-3">Dashboard</span>}
              </Link>
              <Link href="/notifications" className="flex items-center px-4 py-3 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="text-xl">🔔</span>
                {open && <span className="ml-3">Notifications</span>}
              </Link>
            </div>

            <div className="border-t border-gray-700 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                {open && (
                  <div className="ml-3 text-xs">
                    <div>{user?.email?.split('@')[0]}</div>
                    <div className="text-gray-400">{user?.email}</div>
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className="mt-3 text-xs text-gray-400 hover:text-white">
                {open ? 'Logout' : 'Out'}
              </button>
            </div>
          </div>

          <div className={`flex-1 ${open ? 'ml-64' : 'ml-16'} transition-all duration-200`}>
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
