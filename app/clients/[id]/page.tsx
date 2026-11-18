'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function ClientDetail() {
  const params = useParams()
  const id = params?.id as string
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (id) loadClient()
  }, [id])

  async function loadClient() {
    const { data, error } = await supabase
      .from('Clients')
      .select('*')
      .eq('ID', id)
      .single()
    if (!error) setClient(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-500">Client not found.</p>
          <Link href="/clients/list" className="text-blue-600 mt-4 inline-block">Back to clients</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/clients/list" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Back to clients
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">{client.name}</h1>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Email:</span> {client.email || <span className="text-red-600">Missing</span>}</p>
            <p><span className="font-medium">Phone:</span> {client.phone || <span className="text-red-600">Missing</span>}</p>
            <p><span className="font-medium">Address:</span> {client.address || '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Future Visits</h2>
          <p className="text-sm text-gray-500">No upcoming visits yet.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Visits</h2>
          <p className="text-sm text-gray-500">No past visits yet.</p>
        </div>
      </div>
    </div>
  )
}
