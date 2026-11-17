'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ClientProfileClient() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [client, setClient] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (id) load()
  }, [id])

  async function load() {
    const { data } = await supabase.from('Clients').select('*').eq('ID', id).single()
    if (data) {
      setClient(data)
      setName(data.name || '')
      setEmail(data.email || '')
      setPhone(data.phone || '')
      setAddress(data.address || '')
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('Clients').update({ name, email, phone, address }).eq('ID', id)
    if (error) setStatus(error.message)
    else {
      setEditing(false)
      setStatus('Saved')
      load()
    }
  }

  async function deleteClient() {
    const { error } = await supabase.from('Clients').delete().eq('ID', id)
    if (error) setStatus(error.message)
    else router.push('/clients')
  }

  if (!client) return <div className="p-6">Loading client...</div>

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-blue-600 mb-4">← Back to Clients</button>

      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} className="space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="Name" />
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="Email" />
          <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" placeholder="Phone" />
          <input value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded" placeholder="Address" />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="space-y-2 text-gray-700">
          <p><strong>Email:</strong> {client.email || '—'}</p>
          <p><strong>Phone:</strong> {client.phone || '—'}</p>
          <p><strong>Address:</strong> {client.address || '—'}</p>
          <div className="mt-4">
            <p className="font-medium">Visit notes, special requests, etc.</p>
            <p className="whitespace-pre-wrap text-sm mt-1">{client.notes || 'No notes yet.'}</p>
          </div>
        </div>
      )}

      <div className="mt-12 pt-6 border-t">
        <button onClick={() => setShowDelete(true)} className="text-red-600 text-sm hover:underline">
          Delete Client
        </button>
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm">
            <p className="mb-4">Are you sure you want to delete this client?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={deleteClient} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  )
}
