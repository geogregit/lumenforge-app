'use client'
import Link from 'next/link'

export default function Dashboard() {
  const apps = [
    { name: 'Schedule Appointment', href: '/book', icon: 'https://img.icons8.com/color/96/calendar.png' },
    { name: 'Clients', href: '/clients/list', icon: 'https://img.icons8.com/ios/96/user.png' },
    { name: 'Routes', href: '/routes', icon: 'https://img.icons8.com/color/96/map.png' },
    { name: 'Outlook', href: 'https://outlook.office.com', icon: 'https://img.icons8.com/color/96/microsoft-outlook-2019.png', external: true },
    { name: 'Teams', href: 'https://teams.microsoft.com', icon: 'https://img.icons8.com/fluency/96/microsoft-teams-2019.png', external: true },
    { name: 'Calendar', href: 'https://calendar.google.com', icon: 'https://img.icons8.com/color/96/calendar.png', external: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">My Apps</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {apps.map((app) => (
            app.external ? (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow text-center"
              >
                <img src={app.icon} alt={app.name} className="w-16 h-16 mb-3 object-contain" />
                <span className="text-sm font-medium text-gray-800">{app.name}</span>
              </a>
            ) : (
              <Link
                key={app.name}
                href={app.href}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow text-center"
              >
                <img src={app.icon} alt={app.name} className="w-16 h-16 mb-3 object-contain" />
                <span className="text-sm font-medium text-gray-800">{app.name}</span>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
