'use client'
import Link from 'next/link'

const tiles = [
  { name: 'Schedule Appointment', href: '/book', logo: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png' },
  { name: 'Clients', href: '/clients/list', logo: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png' },
  { name: 'Outlook', href: 'https://outlook.live.com/mail/', logo: 'https://img.icons8.com/color/96/microsoft-outlook-2019.png' },
  { name: 'Teams', href: 'https://teams.microsoft.com/', logo: 'https://logos-world.net/wp-content/uploads/2021/04/Microsoft-Teams-Logo.png' },
  { name: 'Calendar', href: 'https://outlook.live.com/calendar/', logo: 'https://img.icons8.com/color/96/microsoft-outlook-2019.png' },
]

export default function Dashboard() {
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
    </div>
  )
}
