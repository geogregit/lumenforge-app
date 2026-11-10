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
  const [time, setTime] = useState('09:00')
  const [officeAddress, setOfficeAddress] = useState('')
  const [routeStops, setRouteStops] = useState<any[]>([])
  const [status, setStatus] = useState('')
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

  useEffect(() => {
    if (selectedClients.length > 0 && officeAddress) buildPreview()
    else setRouteStops([])
  }, [selectedClients, officeAddress])

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

  async function buildPreview() {
    const chosen = clients.filter(c => selectedClients.includes(c.ID) && c.address)
    if (!chosen.length) return
    const withDist = await Promise.all(chosen.map(async c => ({ ...c, dist: await getMins(officeAddress, c.address) })))
    const ordered = [...withDist].sort((a, b) => a.dist - b.dist)
    const stops: any[] = []
    let loc = officeAddress
    for (const c of ordered) {
      const mins = await getMins(loc, c.address)
      stops.push({ name: c.name, address: c.address, driveMin: mins })
      loc = c.address
    }
    setRouteStops(stops)
  }

  function format(mins: number) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m} min`
    if (m === 0) return `${h} hr`
    return `${h} hr ${m} min`
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Schedule Appointment</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clients</label>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={selectAll} className="text-sm bg-gray-200 px-3 py-1 rounded">Select All</button>
          </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Week (optional)</label>
          <select value={week} onChange={e => setWeek(e.target.value)} className="w-full p-2 border text-gray-900">
            <option value="">Any week</option>
            <option value="1">Week 1</option>
            <option value="2">Week 2</option>
            <option value="3">Week 3</option>
            <option value="4">Week 4</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clients per week (optional)</label>
          <input type="number" min="1" value={perWeek} onChange={e => setPerWeek(e.target.value)} placeholder="e.g. 5" className="w-full p-2 border text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <select value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border text-gray-900">
            {timeSlots.map(slot => (
              <option key={slot.value} value={slot.value}>{slot.label}</option>
            ))}
          </select>
        </div>

        <button type="button" onClick={buildPreview} className="w-full bg-blue-600 text-white p-2">Generate Recommendation</button>
        {status && <p className="text-sm">{status}</p>}
      </div>

      {routeStops.length > 0 && (
        <div className="mt-6 p-4 border bg-white">
          <h2 className="font-medium text-gray-900 mb-3">Route Preview</h2>
          {routeStops.map((stop, i) => (
            <div key={i} className="mb-2 pb-2 border-b last:border-0 text-sm text-gray-700">
              <p className="font-medium text-gray-900">{i + 1}. {stop.name}</p>
              <p>Drive: {format(stop.driveMin)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
