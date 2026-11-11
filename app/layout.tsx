'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setOpen(!isMobile)
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (pathname === '/login') return <>{children}</>

  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="flex h-screen">
          <aside className={`fixed inset-y-0 left-0 z-30 bg-black text-white flex flex-col transition-all duration-300 ${open ? 'w-64' : 'w-14'} md:relative`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
              {open && <span className="font-bold text-lg">LumenForge</span>}
              <button onClick={() => setOpen(!open)} className="p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 py-2 overflow-y-auto">
              <Link href="/" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">🏠</span>
                {open && <span className="text-sm">Dashboard</span>}
              </Link>
              <Link href="/notifications" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">🔔</span>
                {open && <span className="text-sm">Notifications</span>}
              </Link>
            </nav>

            <div className="border-t border-gray-800 p-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm shrink-0">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                {open && (
                  <div className="text-xs min-w-0">
                    <p className="font-medium truncate">{user?.email?.split('@')[0]}</p>
                    <p className="text-gray-400 truncate">{user?.email}</p>
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className="mt-2 w-full text-left text-xs text-gray-400 hover:text-white">
                {open ? 'Logout' : '↪'}
              </button>
            </div>
          </aside>

          <main className={`flex-1 overflow-auto transition-all duration-300 ${open ? 'md:ml-0' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
