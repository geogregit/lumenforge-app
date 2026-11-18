'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Routes() {
  const [clients, setClients] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
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

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function generateRoute() {
    if (selected.length === 0) return
    setLoading(true)
    const ordered = clients.filter(c => selected.includes(c.ID))
    setPreview(ordered)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Routes</h1>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Clients</label>
            <Link
              href="/clients"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg shadow transition"
            >
              Add Client
            </Link>
          </div>

          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full mb-3 p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="max-h-72 overflow-y-auto space-y-3 pr-1 border border-gray-200 rounded-2xl p-3 bg-white">
            {filteredClients.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No clients found</p>
            ) : (
              filteredClients.map(client => {
                const isSelected = selected.includes(client.ID)
                const missingPhone = !client.phone
                const missingEmail = !client.email
                return (
                  <button
                    key={client.ID}
                    type="button"
                    onClick={() => toggleClient(client.ID)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        {missingPhone && (
                          <p className="text-sm text-red-600 mt-0.5">Missing phone number</p>
                        )}
                        {missingEmail && (
                          <p className="text-sm text-red-600">Missing email</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
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
