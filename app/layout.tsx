'use client'
import './globals.css'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const supabase = createClient()
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        {!isLogin && (
          <aside className={`relative bg-black text-white transition-all duration-300 flex flex-col ${open ? 'w-56' : 'w-0'}`}>
            <button
              onClick={() => setOpen(!open)}
              className="absolute -right-4 top-6 w-8 h-8 bg-black border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-800 z-10 text-sm"
            >
              {open ? '‹' : '›'}
            </button>
            {open && (
              <div className="p-4 flex flex-col gap-2 h-full">
                <Link href="/" className="font-semibold text-lg mb-4">LumenForge</Link>
                <Link href="/" className="p-2 hover:bg-gray-800 rounded">Dashboard</Link>
                <Link href="/book" className="p-2 hover:bg-gray-800 rounded">Schedule Appointment</Link>
                <Link href="/clients/list" className="p-2 hover:bg-gray-800 rounded">Clients</Link>
                <Link href="/clients" className="p-2 pl-6 hover:bg-gray-800 rounded text-sm">Import Spreadsheet</Link>
                <a href="https://outlook.live.com/mail/" target="_blank" className="p-2 hover:bg-gray-800 rounded">Outlook</a>
                <a href="https://teams.microsoft.com/" target="_blank" className="p-2 hover:bg-gray-800 rounded">Teams</a>
                <a href="https://outlook.live.com/calendar/" target="_blank" className="p-2 hover:bg-gray-800 rounded">Calendar</a>
                <button onClick={logout} className="mt-auto p-2 text-left hover:bg-gray-800 rounded text-sm">Logout</button>
              </div>
            )}
          </aside>
        )}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
