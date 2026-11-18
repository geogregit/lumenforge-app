'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ClientDetail({ id }: { id: string }) {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    loadClient()
  }, [id])

  async function loadClient() {
    const { data, error } = await supabase
      .from('Clients')
      .select('*')
      .eq('ID', id)
      .single()

    if (error) {
      console.error(error)
      setError(error.message)
    } else {
      setClient(data)
      setName(data.name || '')
      setEmail(data.email || '')
      setPhone(data.phone || '')
      setAddress(data.address || '')
    }
    setLoading(false)
  }

  async function updateClient(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase
      .from('Clients')
      .update({ name, email, phone, address })
      .eq('ID', id)
    if (error) {
      alert(error.message)
    } else {
      setEditing(false)
      loadClient()
    }
  }

  async function deleteClient() {
    if (!confirm('Delete this client?')) return
    const { error } = await supabase.from('Clients').delete().eq('ID', id)
    if (error) alert(error.message)
    else router.push('/clients/list')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-500">Client not found.</p>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <Link href="/clients/list" className="text-blue-600 mt-4 inline-block">
            Back to clients
          </Link>
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
          {editing ? (
            <form onSubmit={updateClient} className="space-y-4">
              <h1 className="text-2xl font-semibold text-gray-900">Edit Client</h1>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name"
                className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Address"
                className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-md transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-semibold text-gray-900">{client.name}</h1>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={deleteClient}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700 mt-4">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {client.email || <span className="text-red-600">Missing</span>}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  {client.phone || <span className="text-red-600">Missing</span>}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {client.address || '—'}
                </p>
              </div>
            </>
          )}
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
