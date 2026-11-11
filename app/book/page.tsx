'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Book() {
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
  const [apptDate, setApptDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [sortBy, setSortBy] = useState<'closest' | 'furthest'>('closest')
  const [officeAddress, setOfficeAddress] = useState('')
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [booking, setBooking] = useState(false)
  const supabase = createClient()

  const timeSlots = []
  for (let hour = 8; hour <= 16; hour++) {
    timeSlots.push({ label: `${hour > 12 ? hour - 12 : hour}:00 ${hour < 12 ? 'AM' : 'PM'}`, value: `${hour.toString().padStart(2, '0')}:00` })
    if (hour < 16) timeSlots.push({ label: `${hour > 12 ? hour - 12 : hour}:30 ${hour < 12 ? 'AM' : 'PM'}`, value: `${hour.toString().padStart(2, '0')}:30` })
  }

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
      const { error } = await supabase.from('Clients').update({
        name: fullName,
        email,
        phone: phone || null,
        address: fullAddress || null
      }).eq('ID', editing.ID)
      if (error) alert(error.message)
    } else {
      const { error } = await supabase.from('Clients').insert({
        name: fullName,
        email,
        phone: phone || null,
        address: fullAddress || null,
        user_ID: user?.id
      })
      if (error) alert(error.message)
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

  function formatDate(dateStr: string) {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  function roundTo30(mins: number) {
    const remainder = mins % 30
    return remainder === 0 ? mins : mins + (30 - remainder)
  }

  async function generateRecommendation() {
    setStatus('Calculating...')
    const chosen = clients.filter(c => selectedClients.includes(c.ID) && c.address)
    if (chosen.length === 0) {
      setStatus('Select at least one client with an address')
      return
    }

    const withDist = await Promise.all(chosen.map(async c => ({
      ...c,
      dist: await getMins(officeAddress, c.address)
    })))
    const ordered = [...withDist].sort((a, b) => sortBy === 'closest' ? a.dist - b.dist : b.dist - a.dist)

    let [h, m] = startTime.split(':').map(Number)
    let currentMins = h * 60 + m
    const recs: any[] = []
    let prevAddress = officeAddress

    for (let i = 0; i < ordered.length; i++) {
      const client = ordered[i]
      const drive = await getMins(prevAddress, client.address)
      const leaveMins = currentMins
      let arriveMins = leaveMins + drive + 10
      arriveMins = roundTo30(arriveMins)
      recs.push({
        client,
        time: formatTime(arriveMins),
        timeValue: `${Math.floor(arriveMins / 60).toString().padStart(2, '0')}:${(arriveMins % 60).toString().padStart(2, '0')}`,
        driveMin: drive,
        leaveBy: formatTime(leaveMins),
        isFirst: i === 0
      })
      prevAddress = client.address
      currentMins = arriveMins + 60
    }

    setRecommendations(recs)
    setStatus('')
  }

  async function bookAll() {
    if (recommendations.length === 0) return
    setBooking(true)
    setStatus('Booking appointments...')

    const { data: { user } } = await supabase.auth.getUser()
    const dateToUse = apptDate || new Date().toISOString().slice(0, 10)

    try {
      for (const rec of recommendations) {
        await fetch('https://lumenforge-prod.app.n8n.cloud/webhook/ed413225-6b24-4ccf-8f52-b1f2db33e41b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: rec.client.name,
            email: rec.client.email,
            date: dateToUse,
            time: rec.timeValue
          })
        })

        await supabase.from('appointments').insert({
          user_id: user?.id,
          client_id: rec.client.ID,
          client_name: rec.client.name,
          client_email: rec.client.email,
          client_address: rec.client.address,
          appointment_date: dateToUse,
          appointment_time: rec.timeValue
        })
      }
      setStatus('Appointments booked! Calendar events added and confirmation emails sent.')
      setRecommendations([])
      setSelectedClients([])
    } catch (err) {
      setStatus('Error booking some appointments')
    }
    setBooking(false)
  }

  const displayDate = apptDate ? formatDate(apptDate) : 'the selected date'

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Schedule Appointment</h1>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Clients</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Appointment date</label>
          <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="w-full p-2 border text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leave office at</label>
          <select value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border text-gray-900">
            {timeSlots.map(slot => (
              <option key={slot.value} value={slot.value}>{slot.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort route by</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full p-2 border text-gray-900">
            <option value="closest">Closest to office first</option>
            <option value="furthest">Furthest from office first</option>
          </select>
        </div>

        <button type="button" onClick={generateRecommendation} className="w-full bg-blue-600 text-white p-2">
          Generate Recommendation
        </button>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6 p-4 border bg-white">
          <h2 className="font-medium text-gray-900 mb-1">Recommended Schedule</h2>
          <p className="text-sm text-gray-600 mb-1">
            These appointments will be added to your calendar.
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Confirmation emails will be sent to each client with the date and time below.
          </p>
          {recommendations.map((rec, i) => (
            <div key={i} className="mb-3 pb-3 border-b last:border-0 text-sm">
              <p className="font-medium text-gray-900">{i + 1}. {rec.client.name}</p>
              <p className="text-gray-700">Date: {displayDate}</p>
              <p className="text-gray-700">Time: {rec.time}</p>
              <p className="text-gray-700">{rec.isFirst ? 'Leave office by' : 'Leave previous by'}: {rec.leaveBy}</p>
              <p className="text-gray-700">Drive: {rec.driveMin} min</p>
            </div>
          ))}
          <button
            onClick={bookAll}
            disabled={booking}
            className="w-full bg-green-600 text-white p-2 mt-2 disabled:opacity-50"
          >
            {booking ? 'Booking...' : 'Book All Appointments & Send Emails'}
          </button>
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
