'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const tiles = [
  { name: 'Schedule Appointment', href: '/book', logo: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png' },
  { name: 'Clients', href: '/clients/list', logo: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png' },
  { name: 'Outlook', href: 'https://outlook.live.com/mail/', logo: 'https://img.icons8.com/color/96/microsoft-outlook-2019.png' },
  { name: 'Teams', href: 'https://teams.microsoft.com/', logo: 'https://img.icons8.com/fluency/96/microsoft-teams-2019.png' },
  { name: 'Calendar', href: 'https://outlook.live.com/calendar/', logo: 'https://img.icons8.com/color/96/microsoft-outlook-2019.png' },
]

export default function Dashboard() {
  const [connected, setConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('user_tokens').select('id').eq('user_id', user.id).single()
      setConnected(!!data)
    }
    check()
  }, [])

  async function connectOutlook() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in first')
      return
    }
    const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI
    if (!clientId || !redirectUri) {
      alert('Missing Microsoft config')
      return
    }
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'offline_access Mail.Send Calendars.ReadWrite User.Read',
      response_mode: 'query',
      state: user.id,
    })
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`
  }

  return (
    <div className="p-4 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">My Apps</h1>
        <button
          onClick={connectOutlook}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm sm:text-base"
        >
          {connected ? 'Outlook Connected' : 'Connect Outlook'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tiles.map(tile => (
          <Link
            key={tile.name}
            href={tile.href}
            target={tile.href.startsWith('http') ? '_blank' : undefined}
            className="bg-white shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center"
          >
            <img src={tile.logo} alt={tile.name} className="w-12 h-12 mb-3 object-contain" />
            <span className="text-sm font-medium text-gray-700">{tile.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
