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
                <span className="w-6 text-center text-lg">🏠</span>{open && <span>Dashboard</span>}
              </Link>
              <Link href="/notifications" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800" onClick={() => window.innerWidth < 768 && setOpen(false)}>
                <span className="w-6 text-center text-lg">🔔</span>{open && <span>Notifications</span>}
              </Link>
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 hover:bg-gray-800 border-t border-gray-800 shrink-0">
              <span className="w-6 text-center text-lg">🚪</span>{open && <span>Logout</span>}
            </button>
          </aside>
        )}
        <main className={`flex-1 bg-gray-50 ${!isLogin ? (open ? 'ml-64' : 'ml-14') : ''} md:ml-0 transition-all duration-300`}>
          {children}

          {!isLogin && (
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
