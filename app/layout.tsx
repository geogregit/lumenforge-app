'use client'
import { useState, useEffect, Suspense } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

function Sidebar() {
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (pathname === '/login') return null

  const isActive = (path: string) => pathname === path ? 'bg-gray-800' : ''

  return (
    <aside className={`fixed md:relative z-40 bg-black text-white flex flex-col transition-all duration-300 ${open ? 'w-64' : 'w-14'} h-screen md:h-auto`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {open && <span className="font-bold text-lg">LumenForge</span>}
        <button onClick={() => setOpen(!open)} className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-2 overflow-hidden">
        <Link href="/" className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-800 ${isActive('/')}`} onClick={() => window.innerWidth < 768 && setOpen(false)}>
          <span className="w-6 text-center text-lg">🏠</span>{open && <span className="text-sm">Dashboard</span>}
        </Link>
        <Link href="/book" className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-800 ${isActive('/book')}`} onClick={() => window.innerWidth < 768 && setOpen(false)}>
          <span className="w-6 text-center text-lg">📅</span>{open && <span className="text-sm">Schedule</span>}
        </Link>
        <Link href="/routes" className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-800 ${isActive('/routes')}`} onClick={() => window.innerWidth < 768 && setOpen(false)}>
          <span className="w-6 text-center text-lg">🗺️</span>{open && <span className="text-sm">Routes</span>}
        </Link>
        <Link href="/clients" className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-800 ${isActive('/clients')}`} onClick={() => window.innerWidth < 768 && setOpen(false)}>
          <span className="w-6 text-center text-lg">👤</span>{open && <span className="text-sm">Clients</span>}
        </Link>
        <Link href="/settings" className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-800 ${isActive('/settings')}`} onClick={() => window.innerWidth < 768 && setOpen(false)}>
          <span className="w-6 text-center text-lg">⚙️</span>{open && <span className="text-sm">Settings</span>}
        </Link>
      </nav>

      <div className="border-t border-gray-800 shrink-0">
        <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-3 px-3 py-3 w-full hover:bg-gray-800">
          <span className="w-6 text-center text-lg">👤</span>
          {open && <span className="text-sm truncate">{user?.email || 'Account'}</span>}
        </button>
        {userMenu && open && (
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800">
            Logout
          </button>
        )}
      </div>
    </aside>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex min-h-screen">
          <Suspense fallback={<div className="w-14 bg-black" />}>
            <Sidebar />
          </Suspense>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
