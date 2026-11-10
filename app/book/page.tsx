'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Book() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [manualName, setManualName] = useState('')
  const [month, setMonth] = useState('')
  const [week, setWeek] = useState('')
  const [perWeek, setPerWeek] = useState('')
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

    for (const client of ordered) {
      const drive = await getMins(officeAddress, client.address)
      const arrive = currentMins
      const leave = arrive - drive - 10
      recs.push({
        client,
        time: formatTime(arrive),
        timeValue: `${Math.floor(arrive / 60).toString().padStart(2, '0')}:${(arrive % 60).toString().padStart(2, '0')}`,
        driveMin: drive,
        leaveBy: formatTime(leave)
      })
      currentMins += 60
    }

    setRecommendations(recs)
    setStatus('')
  }

  async function bookAll() {
    if (recommendations.length === 0) return
    setBooking(true)
    setStatus('Booking appointments...')

    try {
      for (const rec of recommendations) {
        await fetch('https://lumenforge-prod.app.n8n.cloud/webhook/ed413225-6b24-4ccf-8f52-b1f2db33e41b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: rec.client.name,
            email: rec.client.email,
            date: month ? `${month}-01` : new Date().toISOString().slice(0, 10),
            time: rec.timeValue
          })
        })
      }
      setStatus('Appointments booked and confirmation emails sent!')
      setRecommendations([])
      setSelectedClients([])
    } catch (err) {
      setStatus('Error booking some appointments')
    }
    setBooking(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Schedule Appointment</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clients</label>
          <button type="button" onClick={selectAll} className="text-sm bg-gray-200 px-3 py-1 rounded mb-2">Select All</button>
          <div className="border max-h-40 overflow-y-auto p-2 space-y-1">
            {clients.map(c => (
              <label key={c.ID} className="flex items-center gap-2 text-sm text-gray-900">
                <input type="checkbox" checked={selectedClients.includes(c.ID)} onChange={() => toggleClient(c.ID)} />
                {c.name}
              </label>
            ))}
          </div>
          <input
            placeholder="Or type a client name"
            value={manualName}
            onChange={e => setManualName(e.target.value)}
            className="w-full mt-2 p-2 border text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-full p-2 border text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
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
          <h2 className="font-medium text-gray-900 mb-3">Recommended Schedule</h2>
          {recommendations.map((rec, i) => (
            <div key={i} className="mb-3 pb-3 border-b last:border-0 text-sm">
              <p className="font-medium text-gray-900">{i + 1}. {rec.client.name}</p>
              <p className="text-gray-700">Book at: {rec.time}</p>
              <p className="text-gray-700">Leave office by: {rec.leaveBy}</p>
              <p className="text-gray-700">Drive: {rec.driveMin} min</p>
            </div>
          ))}
          <button
            onClick={bookAll}
            disabled={booking}
            className="w-full bg-green-600 text-white p-2 mt-2 disabled:opacity-50"
          >
            {booking ? 'Booking...' : 'Book All Appointments'}
          </button>
        </div>
      )}
    </div>
  )
}
