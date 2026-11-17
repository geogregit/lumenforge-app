'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const [status, setStatus] = useState('')
  const [summary, setSummary] = useState('')
  const supabase = createClient()

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*').order('name')
    setClients(data || [])
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) {
      setStatus('Name and email required')
      return
    }
    const payload = { name, email, phone, address, notes }
    let error
    if (editing) {
      const res = await supabase.from('Clients').update(payload).eq('ID', editing.ID)
      error = res.error
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await supabase.from('Clients').insert({ ...payload, user_ID: user?.id })
      error = res.error
    }
    if (error) setStatus(error.message)
    else {
      setStatus(editing ? 'Updated' : 'Added')
      resetForm()
      loadClients()
    }
    setTimeout(() => setStatus(''), 3000)
  }

  function startEdit(client: any) {
    setEditing(client)
    setName(client.name || '')
    setEmail(client.email || '')
    setPhone(client.phone || '')
    setAddress(client.address || '')
    setNotes(client.notes || '')
    setSummary('')
  }

  function resetForm() {
    setEditing(null)
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setNotes('')
    setSummary('')
  }

  async function deleteClient(id: any) {
    if (!confirm('Delete this client?')) return
    const { error } = await supabase.from('Clients').delete().eq('ID', id)
    if (error) setStatus(error.message)
    else loadClients()
  }

  function generateSummary() {
    if (!notes.trim()) {
      setSummary('No notes to summarize')
      return
    }
    // Simple summary for now (can be swapped for AI later)
    const lines = notes.split('\n').filter(l => l.trim())
    const bullets = lines.slice(0, 5).map(l => `• ${l.trim()}`).join('\n')
    setSummary(bullets || notes.slice(0, 200))
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Clients</h1>

      <form onSubmit={saveClient} className="bg-white border rounded-lg p-5 mb-8 space-y-3">
        <h2 className="font-medium text-gray-900">{editing ? 'Edit Client' : 'Add Client'}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border rounded px-3 py-2 text-gray-900" required />
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2 text-gray-900" required />
          <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="border rounded px-3 py-2 text-gray-900" />
          <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="border rounded px-3 py-2 text-gray-900" />
        </div>
        <textarea
          placeholder="Notes (ramp, shower handles, special requests, etc.)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full border rounded px-3 py-2 text-gray-900 h-24"
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editing ? 'Update' : 'Add Client'}</button>
          {editing && <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">Cancel</button>}
        </div>
        {status && <p className="text-sm text-green-600">{status}</p>}
      </form>

      <div className="space-y-4">
        {clients.map(client => (
          <div key={client.ID} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{client.name}</h3>
                <p className="text-sm text-gray-600">{client.email} {client.phone && `• ${client.phone}`}</p>
                {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(client)} className="text-blue-600 text-sm">Edit</button>
                <button onClick={() => deleteClient(client.ID)} className="text-red-600 text-sm">Delete</button>
              </div>
            </div>
            {client.notes && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && notes && (
        <div className="mt-6 bg-white border rounded-lg p-4">
          <button onClick={generateSummary} className="bg-gray-800 text-white px-4 py-2 rounded text-sm mb-2">Generate Summary</button>
          {summary && <pre className="text-sm text-gray-800 bg-gray-50 p-3 rounded whitespace-pre-wrap">{summary}</pre>}
        </div>
      )}
    </div>
  )
}
