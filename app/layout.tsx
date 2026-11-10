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
  const [suggestion, setSuggestion] = useState('')
  const [sent, setSent] = useState('')

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

  function sendSuggestion() {
    if (!suggestion.trim()) return
    const subject = encodeURIComponent('LumenForge Suggestion')
    const body = encodeURIComponent(suggestion)
    window.location.href = `mailto:green.george@live.com?subject=${subject}&body=${body}`
    setSent('Opened in your email app')
    setSuggestion('')
    setTimeout(() => setSent(''), 4000)
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen">
        {!isLogin && (
          <aside className={`bg-black text-white transition-all duration-300 fixed md:relative z-20 h-screen ${open ? 'w-64' : 'w-14'} flex flex-col`}>
            <div className="p-3 flex items-center justify-between border-b border-gray-800 shrink-0">
              {open && <span className="font-bold text-lg">LumenForge</span>}
              <button onClick={() => setOpen(!open)} className="p-2 hover:bg-gray-800 rounded ml-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 py-2">
              <Link href="/" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {open && <span>Dashboard</span>}
              </Link>
              <Link href="/notifications" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {open && <span>Notifications</span>}
              </Link>
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 hover:bg-gray-800 border-t border-gray-800 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {open && <span>Logout</span>}
            </button>
          </aside>
        )}
        <main className={`flex-1 bg-gray-50 ${!isLogin ? (open ? 'ml-64' : 'ml-14') : ''} md:ml-0 transition-all duration-300`}>
          {children}

          {!isLogin && pathname !== '/' && (
            <div className="max-w-md mx-auto px-6 pb-10 mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Have a suggestion?</h2>
              <textarea
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
                placeholder="Tell me what to improve or add..."
                className="w-full border rounded-lg p-3 text-sm h-24 mb-2"
              />
              <button onClick={sendSuggestion} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
                Send Suggestion
              </button>
              {sent && <p className="text-sm text-green-600 mt-2">{sent}</p>}
            </div>
          )}
        </main>
      </body>
    </html>
  )
}
