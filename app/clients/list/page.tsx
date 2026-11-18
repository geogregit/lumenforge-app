'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientList() {
  const [clients, setClients] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*')
    setClients(data || [])
  }

  async function updateClient(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase
      .from('Clients')
      .update({ name, email, phone, address })
      .eq('ID', editing.ID)
    if (error) alert(error.message)
    else {
      setEditing(null)
      setName('')
      setEmail('')
      setPhone('')
      setAddress('')
      loadClients()
    }
  }

  async function deleteClient(id: any) {
    if (!confirm('Delete this client?')) return
    const { error } = await supabase.from('Clients').delete().eq('ID', id)
    if (error) alert(error.message)
    else loadClients()
  }

  function startEdit(client: any) {
    setEditing(client)
    setName(client.name || '')
    setEmail(client.email || '')
    setPhone(client.phone || '')
    setAddress(client.address || '')
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

        {editing && (
          <form onSubmit={updateClient} className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Edit Client</h2>
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
                onClick={() => setEditing(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {clients.map(client => (
            <div
              key={client.ID}
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
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
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => startEdit(client)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteClient(client.ID)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {clients.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No clients yet.</p>
        )}
      </div>
    </div>
  )
}
