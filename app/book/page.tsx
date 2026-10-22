'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Book() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState('')
  const [busyTimes, setBusyTimes] = useState<string[]>([])
  const [officeAddress, setOfficeAddress] = useState('')
  const [driveStatus, setDriveStatus] = useState('')
  const [routeStops, setRouteStops] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<'closest' | 'furthest'>('closest')
  const supabase = createClient()

  const timeSlots: { label: string; value: string }[] = []
  for (let hour = 8; hour <= 16; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 16 && minute > 0) break
      const h12 = hour % 12 || 12
      const m = minute.toString().padStart(2, '0')
      const ampm = hour < 12 ? 'AM' : 'PM'
      const value = `${hour.toString().padStart(2, '0')}:${m}`
      timeSlots.push({ label: `${h12}:${m} ${ampm}`, value })
    }
  }

  useEffect(() => {
    loadClients()
    loadOffice()
  }, [])

  useEffect(() => {
    if (date) checkAvailability(date)
  }, [date])

  useEffect(() => {
    if (selectedClients.length > 0 && officeAddress && time) {
      buildRouteDetails()
    } else {
      setRouteStops([])
      setDriveStatus('')
    }
  }, [selectedClients, officeAddress, clients, time, sortBy])

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

  async function getSegmentMinutes(from: string, to: string): Promise<number> {
    try {
      const res = await fetch(`/api/drive-time?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      const data = await res.json()
      return data.minutes || 0
    } catch {
      return 0
    }
  }

  function formatTime(totalMins: number) {
    const mins = ((totalMins % 1440) + 1440) % 1440
    const h = Math.floor(mins / 60)
    const m = mins % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const displayH = h % 12 || 12
    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  async function buildRouteDetails() {
    setDriveStatus('Calculating route...')
    const selected = clients.filter(c => selectedClients.includes(c.ID) && c.address)
    if (selected.length === 0) {
      setDriveStatus('')
      return
    }

    const withDist = await Promise.all(selected.map(async c => ({
      ...c,
      dist: await getSegmentMinutes(officeAddress, c.address)
    })))
    const ordered = [...withDist].sort((a, b) => sortBy === 'closest' ? a.dist - b.dist : b.dist - a.dist)

    const stops: any[] = []
    let currentLocation = officeAddress
    let [h, m] = time.split(':').map(Number)
    let currentMins = h * 60 + m

    for (const client of ordered) {
      const mins = await getSegmentMinutes(currentLocation, client.address)
      const departMins = currentMins - mins - 10
      stops.push({
        name: client.name,
        address: client.address,
        driveMin: mins,
        departBy: formatTime(departMins),
        arriveAt: formatTime(currentMins)
      })
      currentLocation = client.address
      currentMins = currentMins + 60
    }

    setRouteStops(stops)
    setDriveStatus('')
  }

  async function checkAvailability(selectedDate: string) {
    try {
      const res = await fetch('https://lumenforge-prod.app.n8n.cloud/webhook/bab90c6e-d5b9-49b2-8271-ca3029af1eee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      })
      const data = await res.json()
      const times = (Array.isArray(data) ? data : data.data || []).map((e: any) => {
        const start = e.start?.dateTime || e.start
        if (!start) return null
        return start.slice(11, 16)
      }).filter(Boolean)
      setBusyTimes(times)
    } catch (err) {
      console.error(err)
      setBusyTimes([])
    }
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault()
    if (selectedClients.length === 0 || !date || !time) return
    setStatus('Booking...')
    try {
      for (const id of selectedClients) {
        const client = clients.find(c => c.ID === id)
        await fetch('https://lumenforge-prod.app.n8n.cloud/webhook/ed413225-6b24-4ccf-8f52-b1f2db33e41b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: client.name, email: client.email, date, time })
        })
      }
      setStatus('Appointments booked!')
      alert('Appointments booked successfully')
      checkAvailability(date)
    } catch (err) { setStatus('Error') }
  }

  function toggleClient(id: string) {
    setSelectedClients(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  function formatMinutes(mins: number) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m} min`
    if (m === 0) return `${h} hr`
    return `${h} hr ${m} min`
  }

  function getMapLinks() {
    if (routeStops.length === 0 || !officeAddress) return null
    const origin = encodeURIComponent(officeAddress)
    if (routeStops.length === 1) {
      const dest = encodeURIComponent(routeStops[0].address)
      return {
        google: `https://www.google.com/maps/dir/${origin}/${dest}`,
        apple: `https://maps.apple.com/?saddr=${origin}&daddr=${dest}`
      }
    }
    const waypoints = routeStops.map(s => encodeURIComponent(s.address)).join('/')
    return {
      google: `https://www.google.com/maps/dir/${origin}/${waypoints}`,
      apple: `https://maps.apple.com/?saddr=${origin}&daddr=${waypoints}`
    }
  }

  const links = getMapLinks()
  const showRoute = selectedClients.length > 0 && officeAddress && date && time

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Schedule Appointment</h1>
      <form onSubmit={handleBook} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clients (select one or more)</label>
          <div className="border max-h-40 overflow-y-auto p-2 space-y-1">
            {clients.map(c => (
              <label key={c.ID} className="flex items-center gap-2 text-sm text-gray-900">
                <input type="checkbox" checked={selectedClients.includes(c.ID)} onChange={() => toggleClient(c.ID)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border text-gray-900 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <select value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border text-gray-900 bg-white">
            <option value="">Select time</option>
            {timeSlots.map(slot => (
              <option key={slot.value} value={slot.value} disabled={busyTimes.includes(slot.value)}>
                {slot.label} {busyTimes.includes(slot.value) ? '(unavailable)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort route by</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full p-2 border text-gray-900 bg-white">
            <option value="closest">Closest to office first</option>
            <option value="furthest">Furthest from office first</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2">Book Appointment{selectedClients.length > 1 ? 's' : ''}</button>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </form>

      {showRoute && (
        <div className="mt-8 p-4 border bg-white">
          <h2 className="font-medium text-gray-900 mb-3">Route Preview</h2>
          {driveStatus && <p className="text-sm text-gray-500 mb-2">{driveStatus}</p>}
          {routeStops.map((stop, i) => (
            <div key={i} className="mb-3 pb-3 border-b last:border-0">
              <p className="text-sm font-medium text-gray-900">{i + 1}. {stop.name}</p>
              <p className="text-sm text-gray-700">Drive: {formatMinutes(stop.driveMin)}</p>
              <p className="text-sm text-gray-700">Leave previous by: {stop.departBy}</p>
            </div>
          ))}
          {links && (
            <div className="flex flex-col gap-2 mt-4">
              <a href={links.google} target="_blank" className="bg-blue-600 text-white text-center py-2">Open in Google Maps</a>
              <a href={links.apple} target="_blank" className="bg-gray-800 text-white text-center py-2">Open in Apple Maps</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
