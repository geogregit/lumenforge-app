'use client'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link href="/book" className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">📅</div>
          <p className="font-medium text-gray-900">Schedule</p>
        </Link>

        <Link href="/routes" className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="font-medium text-gray-900">Routes</p>
        </Link>

        <Link href="/clients" className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">👤</div>
          <p className="font-medium text-gray-900">Clients</p>
        </Link>

        <Link href="/settings" className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">⚙️</div>
          <p className="font-medium text-gray-900">Settings</p>
        </Link>

        <a href="https://outlook.office.com" target="_blank" className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition">
          <img src="https://img.icons8.com/fluency/96/microsoft-outlook-2019.png" alt="Outlook" className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium text-gray-900">Outlook</p>
        </a>

        <a href="https://teams.microsoft.com" target="_blank" className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition">
          <img src="https://img.icons8.com/fluency/96/microsoft-teams-2019.png" alt="Teams" className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium text-gray-900">Teams</p>
        </a>
      </div>
    </div>
  )
}
