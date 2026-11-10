'use client'
import Link from 'next/link'
import { useState } from 'react'

type AppItem = {
  id: string
  name: string
  href: string
  icon: string
  external?: boolean
}

export default function Dashboard() {
  const [apps] = useState<AppItem[]>([
    { id: '1', name: 'Schedule Appointment', href: '/book', icon: 'https://img.icons8.com/color/96/calendar.png' },
    { id: '2', name: 'Clients', href: '/clients/list', icon: 'https://img.icons8.com/ios/96/user.png' },
    { id: '3', name: 'Routes', href: '/routes', icon: 'https://img.icons8.com/color/96/map.png' },
    { id: '4', name: 'Outlook', href: 'https://outlook.office.com', icon: 'https://img.icons8.com/color/96/microsoft-outlook-2019.png', external: true },
    { id: '5', name: 'Teams', href: 'https://teams.microsoft.com', icon: 'https://img.icons8.com/fluency/96/microsoft-teams-2019.png', external: true },
    { id: '6', name: 'Microsoft 365', href: 'https://www.office.com', icon: 'https://img.icons8.com/fluency/96/microsoft-365.png', external: true },
    { id: '7', name: 'Calendar', href: 'https://calendar.google.com', icon: 'https://img.icons8.com/color/96/calendar.png', external: true },
  ])

  const [selected, setSelected] = useState<AppItem | null>(null)
  const [showRequest, setShowRequest] = useState(false)
  const [requestName, setRequestName] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [sent, setSent] = useState('')

  function sendRequest() {
    if (!requestName.trim()) return
    const subject = encodeURIComponent('App Request: ' + requestName)
    const body = encodeURIComponent(`Please add this app to the dashboard:\n\n${requestName}`)
    window.location.href = `mailto:green.george@live.com?subject=${subject}&body=${body}`
    setSent('Request opened in your email app')
    setRequestName('')
    setShowRequest(false)
    setTimeout(() => setSent(''), 4000)
  }

  function sendSuggestion() {
    if (!suggestion.trim()) return
    const subject = encodeURIComponent('LumenForge Suggestion')
    const body = encodeURIComponent(suggestion)
    window.location.href = `mailto:green.george@live.com?subject=${subject}&body=${body}`
    setSent('Suggestion opened in your email app')
    setSuggestion('')
    setTimeout(() => setSent(''), 4000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">My Apps</h1>
          <button onClick={() => setShowRequest(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Request App
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="relative bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
              <button
                onClick={() => setSelected(app)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 text-lg leading-none"
              >
                •••
              </button>
              {app.external ? (
                <a href={app.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center w-full">
                  <img src={app.icon} alt={app.name} className="w-16 h-16 mb-3 object-contain" />
                  <span className="text-sm font-medium text-gray-800">{app.name}</span>
                </a>
              ) : (
                <Link href={app.href} className="flex flex-col items-center text-center w-full">
                  <img src={app.icon} alt={app.name} className="w-16 h-16 mb-3 object-contain" />
                  <span className="text-sm font-medium text-gray-800">{app.name}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Suggestion box */}
        <div className="mt-16 max-w-md">
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
      </div>

      {/* Side panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelected(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-500 text-2xl">×</button>
            <div className="flex flex-col items-center mb-6 mt-4">
              <img src={selected.icon} alt="" className="w-16 h-16 mb-4" />
              <h2 className="text-xl font-semibold">{selected.name}</h2>
            </div>
            <a
              href={selected.href}
              target={selected.external ? '_blank' : undefined}
              className="block w-full text-center border border-gray-300 rounded-lg py-2 mb-6 hover:bg-gray-50"
            >
              Launch App
            </a>
            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded">This app is managed by your admin.</p>
          </div>
        </div>
      )}

      {/* Request app modal */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center" onClick={() => setShowRequest(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Request an App</h3>
            <input
              placeholder="App name (e.g. Slack, Zoom, etc.)"
              value={requestName}
              onChange={e => setRequestName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={sendRequest} className="flex-1 bg-blue-600 text-white py-2 rounded">Send Request</button>
              <button onClick={() => setShowRequest(false)} className="flex-1 border py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
