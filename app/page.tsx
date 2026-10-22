'use client'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Apps</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/book" className="block p-6 bg-white border rounded-lg text-center hover:shadow">
          <img src="https://img.icons8.com/color/96/calendar.png" alt="" className="mx-auto mb-2 w-16 h-16" />
          <p className="text-gray-900">Schedule Appointment</p>
        </Link>
        <Link href="/clients/list" className="block p-6 bg-white border rounded-lg text-center hover:shadow">
          <img src="https://img.icons8.com/ios/96/user.png" alt="" className="mx-auto mb-2 w-16 h-16" />
          <p className="text-gray-900">Clients</p>
        </Link>
        <Link href="/routes" className="block p-6 bg-white border rounded-lg text-center hover:shadow">
          <img src="https://img.icons8.com/color/96/map.png" alt="" className="mx-auto mb-2 w-16 h-16" />
          <p className="text-gray-900">Routes</p>
        </Link>
        <a href="https://outlook.office.com" target="_blank" className="block p-6 bg-white border rounded-lg text-center hover:shadow">
          <img src="https://img.icons8.com/color/96/microsoft-outlook-2019.png" alt="" className="mx-auto mb-2 w-16 h-16" />
          <p className="text-gray-900">Outlook</p>
        </a>
        <a href="https://teams.microsoft.com" target="_blank" className="block p-6 bg-white border rounded-lg text-center hover:shadow">
          <img src="https://img.icons8.com/fluency/96/microsoft-teams-2019.png" alt="" className="mx-auto mb-2 w-16 h-16" />
          <p className="text-gray-900">Teams</p>
        </a>
        <a href="https://calendar.google.com" target="_blank" className="block p-6 bg-white border rounded-lg text-center hover:shadow">
          <img src="https://img.icons8.com/color/96/calendar.png" alt="" className="mx-auto mb-2 w-16 h-16" />
          <p className="text-gray-900">Calendar</p>
        </a>
      </div>
    </div>
  )
}
