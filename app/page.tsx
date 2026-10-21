'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const tiles = [
  { name: 'Schedule Appointment', href: '/book', logo: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png' },
  { name: 'Clients', href: '/clients/list', logo: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png' },
  { name: 'Outlook', href: 'https://outlook.live.com/mail/', logo: 'https://img.icons8.com/color/96/microsoft-outlook-2019.png' },
  { name: 'Teams', href: 'https://teams.microsoft.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/240px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png' },
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

  function connectOutlook() {
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
    })
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">My Apps</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
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
      <div className="mt-8">
        <button
          onClick={connectOutlook}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {connected ? 'Outlook Connected' : 'Connect Outlook'}
        </button>
      </div>
    </div>
  )
}
