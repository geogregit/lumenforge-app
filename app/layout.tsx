'use client'
import './globals.css'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const isLogin = pathname === '/login'

  useEffect(() => {
    if (isLogin) return
    let timeout: NodeJS.Timeout
    const logout = async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }
    const reset = () => {
      clearTimeout(timeout)
      timeout = setTimeout(logout, 15 * 60 * 1000) // 15 minutes
    }
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, reset))
    reset()
    return () => {
      clearTimeout(timeout)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [isLogin, router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen">
        {!isLogin && (
          <aside className={`bg-black text-white transition-all duration-300 ${open ? 'w-64' : 'w-16'} flex flex-col`}>
            <div className="p-4 flex items-center justify-between">
              {open && <span className="font-bold text-lg">LumenForge</span>}
              <button onClick={() => setOpen(!open)} className="p-1 hover:bg-gray-800 rounded">
                {open ? '◀' : '▶'}
              </button>
            </div>
            <nav className="flex-1 px-2 space-y-1">
              <Link href="/" className="block px-3 py-2 hover:bg-gray-800 rounded">Dashboard</Link>
              <Link href="/book" className="block px-3 py-2 hover:bg-gray-800 rounded">Schedule Appointment</Link>
              <Link href="/clients/list" className="block px-3 py-2 hover:bg-gray-800 rounded">Clients</Link>
              <Link href="/clients" className="block px-3 py-2 pl-8 text-sm hover:bg-gray-800 rounded">Import Spreadsheet</Link>
              <a href="https://outlook.office.com" target="_blank" className="block px-3 py-2 hover:bg-gray-800 rounded">Outlook</a>
              <a href="https://teams.microsoft.com" target="_blank" className="block px-3 py-2 hover:bg-gray-800 rounded">Teams</a>
              <a href="https://calendar.google.com" target="_blank" className="block px-3 py-2 hover:bg-gray-800 rounded">Calendar</a>
              <Link href="/settings" className="block px-3 py-2 hover:bg-gray-800 rounded">Settings</Link>
            </nav>
            <button onClick={handleLogout} className="p-4 text-left hover:bg-gray-800">Logout</button>
          </aside>
        )}
        <main className="flex-1 bg-gray-50">{children}</main>
      </body>
    </html>
  )
}
