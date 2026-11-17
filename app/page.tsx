'use client'
import Link from 'next/link'

export default function Dashboard() {
  const tiles = [
    { href: '/book', title: 'Schedule', icon: '📅', color: 'bg-blue-600' },
    { href: '/routes', title: 'Routes', icon: '🗺️', color: 'bg-green-600' },
    { href: '/clients', title: 'Clients', icon: '👤', color: 'bg-purple-600' },
    { href: '/settings', title: 'Settings', icon: '⚙️', color: 'bg-gray-700' },
    { href: 'https://outlook.office.com', title: 'Outlook', icon: '📧', color: 'bg-blue-500', external: true },
    { href: 'https://teams.microsoft.com', title: 'Teams', icon: '💬', color: 'bg-indigo-600', external: true },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
        {tiles.map(tile => (
          tile.external ? (
            <a
              key={tile.href}
              href={tile.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
            >
              <div className={`${tile.color} text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {tile.icon}
              </div>
              <span className="text-lg font-medium text-gray-900">{tile.title}</span>
            </a>
          ) : (
            <Link
              key={tile.href}
              href={tile.href}
              className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
            >
              <div className={`${tile.color} text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {tile.icon}
              </div>
              <span className="text-lg font-medium text-gray-900">{tile.title}</span>
            </Link>
          )
        ))}
      </div>
    </div>
  )
}
