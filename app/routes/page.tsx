'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Routes() {
  const [clients, setClients] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [startTime, setStartTime] = useState('08:00')
  const [sortBy, setSortBy] = useState<'closest' | 'furthest'>('closest')
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*')
    setClients(data || [])
  }

  function toggleClient(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function selectAll() {
    if (selected.length === clients.length) {
      setSelected([])
    } else {
      setSelected(clients.map(c => c.ID))
    }
  }

  async function generateRoute() {
    if (selected.length === 0) return
    setLoading(true)
    // Placeholder for route generation logic
    // In a real implementation this would call your drive-time API
    const ordered = clients.filter(c => selected.includes(c.ID))
    setPreview(ordered)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Routes</h1>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Clients</h2>
            <Link
              href="/clients"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg shadow transition"
            >
              Add Client
            </Link>
          </div>

          <button
            onClick={selectAll}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded-lg mb-3 transition"
          >
            {selected.length === clients.length ? 'Deselect All' : 'Select All'}
          </button>

          <div className="space-y-3">
            {clients.map(client => (
              <label
                key={client.ID}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(client.ID)}
                  onChange={() => toggleClient(client.ID)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.address || 'No address'}</p>
                </div>
                <Link
                  href={`/clients/${client.ID}`}
                  onClick={e => e.stopPropagation()}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </Link>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Appointments</h2>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500">
            No booked appointments yet
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort route by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'closest' | 'furthest')}
              className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="closest">Closest to office first</option>
              <option value="furthest">Furthest from office first</option>
            </select>
          </div>

          <button
            onClick={generateRoute}
            disabled={selected.length === 0 || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl shadow-md transition"
          >
            {loading ? 'Generating...' : 'Generate Route'}
          </button>
        </div>

        {preview.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Route Preview</h2>
            <div className="space-y-3">
              {preview.map((stop, i) => (
                <div key={stop.ID} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="font-semibold text-gray-900">{i + 1}. {stop.name}</p>
                  <p className="text-sm text-gray-500">{stop.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
