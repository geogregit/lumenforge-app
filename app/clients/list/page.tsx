'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientList() {
  const [clients, setClients] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*')
    setClients(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Clients</h1>
          <Link
            href="/clients"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:shadow-lg transition"
          >
            Add Clients
          </Link>
        </div>

        <div className="space-y-4">
          {clients.map(client => (
            <Link
              key={client.ID}
              href={`/clients/${client.ID}`}
              className="block p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div>
                <p className="font-semibold text-gray-900 text-lg">{client.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {client.email || <span className="text-red-600">Missing email</span>}
                  {client.phone && ` • ${client.phone}`}
                  {!client.phone && client.email && <span className="text-red-600"> • Missing phone</span>}
                </p>
                {client.address && (
                  <p className="text-sm text-gray-500 mt-1">{client.address}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {clients.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No clients yet.</p>
        )}
      </div>
    </div>
  )
}
