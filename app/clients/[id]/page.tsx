'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ClientProfile() {
  const params = useParams()
  const id = params.id as string
  const [client, setClient] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (id) loadClient()
  }, [id])

  async function loadClient() {
    const { data } = await supabase.from('Clients').select('*').eq('ID', id).single()
    if (data) {
      setClient(data)
      setNotes(data.notes || '')
    }
  }

  async function saveNotes() {
    const { error } = await supabase.from('Clients').update({ notes }).eq('ID', id)
    setStatus(error ? error.message : 'Notes saved')
    setTimeout(() => setStatus(''), 3000)
    loadClient()
  }

  function generateSummary() {
    if (!notes.trim()) {
      setSummary('No notes to summarize')
      return
    }
    const lines = notes.split('\n').filter(l => l.trim())
    const bullets = lines.slice(0, 6).map(l => `• ${l.trim()}`).join('\n')
    setSummary(bullets || notes.slice(0, 300))
  }

  if (!client) return <div className="p-6 text-gray-900">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <Link href="/clients" className="text-blue-600 text-sm mb-4 inline-block">← Back to Clients</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">{client.name}</h1>
      <p className="text-gray-600 mb-1">{client.email}</p>
      {client.phone && <p className="text-gray-600 mb-1">{client.phone}</p>}
      {client.address && <p className="text-gray-600 mb-6">{client.address}</p>}

      <div className="bg-white border rounded-lg p-5">
        <h2 className="font-medium text-gray-900 mb-3">Notes</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full border rounded px-3 py-2 text-gray-900 h-40"
          placeholder="Ramp, shower handles, special requests, visit notes..."
        />
        <div className="flex gap-2 mt-3">
          <button onClick={saveNotes} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Save Notes</button>
          <button onClick={generateSummary} className="bg-gray-800 text-white px-4 py-2 rounded text-sm">Generate Summary</button>
        </div>
        {status && <p className="text-sm text-green-600 mt-2">{status}</p>}
        {summary && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-500 mb-1">Summary</p>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">{summary}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
