'use client'
import { useState, useEffect, Suspense } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

function Sidebar() {
  const [open, setOpen] = useState(true)
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

  return (
    <aside className="w-64 bg-black text-white flex flex-col min-h-screen shrink-0">
      <div className="p-4 border-b border-gray-800 font-bold text-lg">
        LumenForge
      </div>
      <nav className="flex-1 py-2">
        <Link href="/" className="block px-4 py-2 hover:bg-gray-800">🏠 Dashboard</Link>
        <Link href="/book" className="block px-4 py-2 hover:bg-gray-800">📅 Schedule</Link>
        <Link href="/routes" className="block px-4 py-2 hover:bg-gray-800">🗺️ Routes</Link>
        <Link href="/clients" className="block px-4 py-2 hover:bg-gray-800">👤 Clients</Link>
        <Link href="/settings" className="block px-4 py-2 hover:bg-gray-800">⚙️ Settings</Link>
      </nav>
      <button onClick={handleLogout} className="px-4 py-3 border-t border-gray-800 text-left hover:bg-gray-800">
        Logout
      </button>
    </aside>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-gray-50">
          <Suspense fallback={<div className="w-64 bg-black" />}>
            <Sidebar />
          </Suspense>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
