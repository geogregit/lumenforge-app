'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Routes() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [sortBy, setSortBy] = useState<'closest' | 'furthest'>('closest')
  const [officeAddress, setOfficeAddress] = useState('')
  const [stops, setStops] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadClients()
    loadOffice()
  }, [])

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*')
    setClients(data || [])
  }

  async function loadOffice() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('office_address').eq('id', user.id).single()
    if (data?.office_address) setOfficeAddress(data.office_address)
  }

  function openEdit(client: any) {
    const nameParts = (client.name || '').split(' ')
    setFirstName(nameParts[0] || '')
    setLastName(nameParts.slice(1).join(' ') || '')
    setEmail(client.email || '')
    setPhone(client.phone || '')
    const addrParts = (client.address || '').split(',').map((s: string) => s.trim())
    setStreet(addrParts[0] || '')
    setCity(addrParts[1] || '')
    setState(addrParts[2] || '')
    setZip(addrParts[3] || '')
    setEditing(client)
    setShowAdd(true)
  }

  async function saveClient() {
    if (!firstName || !lastName || !email) {
      alert('First name, last name, and email are required')
      return
    }
    const fullName = `${firstName} ${lastName}`.trim()
    const fullAddress = [street, city, state, zip].filter(Boolean).join(', ')
    const { data: { user } } = await supabase.auth.getUser()

    if (editing) {
      await supabase.from('Clients').update({
        name: fullName,
        email,
        phone: phone || null,
        address: fullAddress || null
      }).eq('ID', editing.ID)
    } else {
      await supabase.from('Clients').insert({
        name: fullName,
        email,
        phone: phone || null,
        address: fullAddress || null,
        user_ID: user?.id
      })
    }
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setStreet('')
    setCity('')
    setState('')
    setZip('')
    setEditing(null)
    setShowAdd(false)
    loadClients()
  }

  function toggleClient(id: string) {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  function selectAll() {
    setSelectedClients(clients.map(c => c.ID))
  }

  async function getMins(from: string, to: string) {
    try {
      const res = await fetch(`/api/drive-time?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      const data = await res.json()
      return data.minutes || 0
    } catch { return 0 }
  }

  function formatTime(totalMins: number) {
    const mins = ((totalMins % 1440) + 1440) % 1440
    const h = Math.floor(mins / 60)
    const m = mins % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const displayH = h % 12 || 12
    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  async function buildPreview() {
    setStatus('Calculating...')
    const chosen = clients.filter(c => selectedClients.includes(c.ID) && c.address)
    if (chosen.length === 0) {
      setStatus('Select at least one client with an address')
      setStops([])
      return
    }

    const withDist = await Promise.all(chosen.map(async c => ({
      ...c,
      dist: await getMins(officeAddress, c.address)
    })))
    const ordered = [...withDist].sort((a, b) => sortBy === 'closest' ? a.dist - b.dist : b.dist - a.dist)

    let [h, m] = startTime.split(':').map(Number)
    let currentMins = h * 60 + m
    const result: any[] = []
    let prev = officeAddress

    for (let i = 0; i < ordered.length; i++) {
      const c = ordered[i]
      const drive = await getMins(prev, c.address)
      const leave = currentMins
      const arrive = leave + drive + 10
      result.push({
        name: c.name,
        driveMin: drive,
        leaveBy: formatTime(leave),
        arriveAt: formatTime(arrive),
        isFirst: i === 0
      })
      prev = c.address
      currentMins = arrive + 60
    }
    setStops(result)
    setStatus('')
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Routes</h1>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Select clients for route</label>
            <button type="button" onClick={() => { setEditing(null); setShowAdd(true) }} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
              Add Client
            </button>
          </div>
          <button type="button" onClick={selectAll} className="text-sm bg-gray-200 px-3 py-1 rounded mb-2">Select All</button>
          <div className="border max-h-48 overflow-y-auto p-2 space-y-1">
            {clients.map(c => (
              <div key={c.ID} className="flex items-center justify-between text-sm text-gray-900">
                <label className="flex items-center gap-2 flex-1">
                  <input type="checkbox" checked={selectedClients.includes(c.ID)} onChange={() => toggleClient(c.ID)} />
                  {c.name}
                </label>
                <button onClick={() => openEdit(c)} className="text-blue-600 text-xs">Edit</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date (optional)</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort route by</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full p-2 border text-gray-900">
            <option value="closest">Closest to office first</option>
            <option value="furthest">Furthest from office first</option>
          </select>
        </div>

        <button onClick={buildPreview} className="w-full bg-blue-600 text-white p-2">Generate Route</button>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>

      {stops.length > 0 && (
        <div className="mt-6 p-4 border bg-white">
          <h2 className="font-medium text-gray-900 mb-3">Route Preview</h2>
          {stops.map((s, i) => (
            <div key={i} className="mb-3 pb-3 border-b last:border-0 text-sm">
              <p className="font-medium text-gray-900">{i + 1}. {s.name}</p>
              <p className="text-gray-700">Drive: {s.driveMin} min</p>
              <p className="text-gray-700">{s.isFirst ? 'Leave office by' : 'Leave previous by'}: {s.leaveBy}</p>
              <p className="text-gray-700">Arrive by: {s.arriveAt}</p>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Client' : 'Add Client'}</h3>
            <input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
            <input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
            <input placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
            <input placeholder="Street address" value={street} onChange={e => setStreet(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
            <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
            <input placeholder="State" value={state} onChange={e => setState(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
            <input placeholder="Zip code" value={zip} onChange={e => setZip(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
            <div className="flex gap-2">
              <button onClick={saveClient} className="flex-1 bg-blue-600 text-white py-2 rounded">{editing ? 'Save' : 'Add'}</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 border py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
