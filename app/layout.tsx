'use client'
import './globals.css'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const isLogin = pathname === '/login'

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setOpen(!isMobile)
  }, [])

  useEffect(() => {
    if (isLogin) return
    let timeout: NodeJS.Timeout
    const logout = async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }
    const reset = () => {
      clearTimeout(timeout)
      timeout = setTimeout(logout, 15 * 60 * 1000)
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
          <aside className={`bg-black text-white transition-all duration-300 fixed md:relative z-20 h-screen ${open ? 'w-64' : 'w-14'} flex flex-col overflow-hidden`}>
            <div className="p-4 flex items-center justify-between">
              {open && <span className="font-bold text-lg">LumenForge</span>}
              <button onClick={() => setOpen(!open)} className="p-2 hover:bg-gray-800 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
              <Link href="/" className="block px-3 py-2 hover:bg-gray-800 rounded whitespace-nowrap" onClick={() => window.innerWidth < 768 && setOpen(false)}>{open ? 'Dashboard' : '🏠'}</Link>
              <Link href="/book" className="block px-3 py-2 hover:bg-gray-800 rounded whitespace-nowrap" onClick={() => window.innerWidth < 768 && setOpen(false)}>{open ? 'Schedule Appointment' : '📅'}</Link>
              <Link href="/clients/list" className="block px-3 py-2 hover:bg-gray-800 rounded whitespace-nowrap" onClick={() => window.innerWidth < 768 && setOpen(false)}>{open ? 'Clients' : '👤'}</Link>
              <Link href="/clients" className="block px-3 py-2 pl-8 text-sm hover:bg-gray-800 rounded whitespace-nowrap" onClick={() => window.innerWidth < 768 && setOpen(false)}>{open ? 'Import Spreadsheet' : '📄'}</Link>
              <Link href="/routes" className="block px-3 py-2 hover:bg-gray-800 rounded whitespace-nowrap" onClick={() => window.innerWidth < 768 && setOpen(false)}>{open ? 'Routes' : '🗺️'}</Link>
              <a href="https://outlook.office.com" target="_blank" className="block px-3 py-2 hover:bg-gray-800 rounded whitespace-nowrap">{open ? 'Outlook' : '📧'}</a>
              <a href="https://teams.microsoft.com" target="_blank" className="block px-3 py-2 hover:bg-gray-800 rounded whitespace-nowrap">{open ? 'Teams' : '💬'}</a>
              <a href="https://calendar.google.com" target="_blank" className="block px-3 py-2 hover:bg-gray-800 rounded whitespace-nowrap">{open ? 'Calendar' : '📆'}</a>
              <Link href="/settings" className="block px-3 py-2 hover:bg-gray-800 rounded whitespace-nowrap" onClick={() => window.innerWidth < 768 && setOpen(false)}>{open ? 'Settings' : '⚙️'}</Link>
            </nav>
            <button onClick={handleLogout} className="p-4 text-left hover:bg-gray-800 whitespace-nowrap">{open ? 'Logout' : '🚪'}</button>
          </aside>
        )}
        <main className={`flex-1 bg-gray-50 ${!isLogin ? (open ? 'ml-64' : 'ml-14') : ''} md:ml-0 transition-all duration-300`}>{children}</main>
      </body>
    </html>
  )
}
