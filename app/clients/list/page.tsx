'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientList() {
  const [clients, setClients] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*')
    setClients(data || [])
  }

  async function updateClient(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('Clients').update({ name, email }).eq('ID', editing.ID)
    if (error) alert(error.message)
    else {
      setEditing(null)
      setName('')
      setEmail('')
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
    setName(client.name)
    setEmail(client.email)
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4">Clients</h1>
      <Link href="/clients" className="inline-block mb-4 bg-green-600 text-white px-4 py-2">Add Clients</Link>

      {editing && (
        <form onSubmit={updateClient} className="space-y-4 mb-8 p-4 border">
          <h2 className="font-medium">Edit Client</h2>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border" required />
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border" required />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-green-600 text-white p-2">Update</button>
            <button type="button" onClick={() => { setEditing(null); setName(''); setEmail('') }} className="px-4 border">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {clients.length === 0 && <p className="text-gray-500">No clients yet</p>}
        {clients.map(c => (
          <div key={c.ID} className="flex items-center justify-between p-3 border bg-white">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-600">{c.email}{c.phone ? ` • ${c.phone}` : ''}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startEdit(c)} className="text-blue-600 text-sm font-medium">Edit</button>
              <button onClick={() => deleteClient(c.ID)} className="text-red-600 text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
