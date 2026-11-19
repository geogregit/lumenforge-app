'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import SessionTimeout from '@/components/SessionTimeout'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (!data.user && pathname !== '/login') router.push('/login')
    })
    if (window.innerWidth >= 768) setOpen(true)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (pathname === '/login') {
    return (
      <html lang="en">
        <body className="bg-gray-50">{children}</body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <SessionTimeout />
        <div className="flex h-screen overflow-hidden">
          <aside className={`bg-black text-white flex flex-col h-full fixed md:relative z-40 transition-all duration-200 ${open ? 'w-64' : 'w-14'}`}>
            <div className="flex items-center justify-between px-3 py-4 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Allayabode" className="h-6 w-6 object-contain" />
                {open && <span className="font-semibold text-sm">ALLAYABODE</span>}
              </div>
              <button onClick={() => setOpen(!open)} className="p-1 hover:bg-gray-800 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 py-2 overflow-hidden">
              <Link href="/" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">🏠</span>{open && <span className="text-sm">Dashboard</span>}
              </Link>
              <Link href="/book" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">📅</span>{open && <span className="text-sm">Schedule Appointment</span>}
              </Link>
              <Link href="/clients/list" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">👥</span>{open && <span className="text-sm">Clients</span>}
              </Link>
              <Link href="/clients" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">📄</span>{open && <span className="text-sm">Import Spreadsheet</span>}
              </Link>
              <Link href="/routes" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">🗺️</span>{open && <span className="text-sm">Routes</span>}
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">⚙️</span>{open && <span className="text-sm">Settings</span>}
              </Link>
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 hover:bg-gray-800 border-t border-gray-800 shrink-0">
              <span className="w-6 text-center text-lg">🚪</span>{open && <span className="text-sm">Logout</span>}
            </button>
          </aside>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
