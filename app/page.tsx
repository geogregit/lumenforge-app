'use client'
import Link from 'next/link'

export default function Dashboard() {
  const tiles = [
    { href: '/book', title: 'Schedule', icon: '📅', color: 'bg-blue-600' },
    { href: '/routes', title: 'Routes', icon: '🗺️', color: 'bg-green-600' },
    { href: '/clients', title: 'Clients', icon: '👤', color: 'bg-purple-600' },
    { href: '/settings', title: 'Settings', icon: '⚙️', color: 'bg-gray-700' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
        {tiles.map(tile => (
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
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Quick Links</h2>
        <div className="flex gap-6">
          <a href="https://outlook.office.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
            <img src="https://img.icons8.com/color/96/microsoft-outlook-2019.png" alt="Outlook" className="w-16 h-16" />
            <span className="text-sm text-gray-700">Outlook</span>
          </a>
          <a href="https://teams.microsoft.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
            <img src="https://img.icons8.com/fluency/96/microsoft-teams-2019.png" alt="Teams" className="w-16 h-16" />
            <span className="text-sm text-gray-700">Teams</span>
          </a>
        </div>
      </div>
    </div>
  )
}
