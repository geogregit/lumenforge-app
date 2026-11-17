'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*').order('name')
    setClients(data || [])
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <Link href="/clients/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Client
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search clients..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm p-2 border rounded-lg mb-6"
      />

      <div className="space-y-3">
        {filtered.map(client => (
          <Link
            key={client.ID}
            href={`/clients/${client.ID}`}
            className="block bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="font-medium text-gray-900">{client.name}</div>
            <div className="text-sm text-gray-600">
              {client.email} {client.phone && `• ${client.phone}`}
            </div>
            {client.address && <div className="text-sm text-gray-500 mt-1">{client.address}</div>}
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500">No clients found.</p>
        )}
      </div>
    </div>
  )
}
