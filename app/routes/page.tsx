'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Routes() {
  const [clients, setClients] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [office, setOffice] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('08:00')
  const [stops, setStops] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'closest' | 'furthest'>('closest')
  const supabase = createClient()

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (selected.length > 0 && office && time) buildPreview()
    else setStops([])
  }, [selected, office, time, sortBy])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase.from('profiles').select('office_address').eq('id', user.id).single()
    if (prof?.office_address) setOffice(prof.office_address)
    const { data } = await supabase.from('Clients').select('*')
    setClients(data || [])
  }

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
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
    setLoading(true)
    const chosen = clients.filter(c => selected.includes(c.ID) && c.address)
    if (!chosen.length) { setLoading(false); return }

    const withDist = await Promise.all(chosen.map(async c => ({
      ...c,
      dist: await getMins(office, c.address)
    })))
    const ordered = [...withDist].sort((a, b) => sortBy === 'closest' ? a.dist - b.dist : b.dist - a.dist)

    const result: any[] = []
    let loc = office
    let [h, m] = time.split(':').map(Number)
    let currentMins = h * 60 + m

    for (let i = 0; i < ordered.length; i++) {
      const c = ordered[i]
      const mins = await getMins(loc, c.address)
      const departMins = currentMins - mins - 10
      result.push({
        name: c.name,
        address: c.address,
        driveMin: mins,
        departBy: formatTime(departMins),
        arriveAt: formatTime(currentMins),
        isFirst: i === 0
      })
      loc = c.address
      currentMins += 60
    }
    setStops(result)
    setLoading(false)
  }

  function format(mins: number) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m} min`
    if (m === 0) return `${h} hr`
    return `${h} hr ${m} min`
  }

  function getLinks() {
    if (!office || stops.length === 0) return null
    const origin = encodeURIComponent(office)
    const waypoints = stops.map(s => encodeURIComponent(s.address)).join('/')
    return {
      google: `https://www.google.com/maps/dir/${origin}/${waypoints}`,
      apple: `https://maps.apple.com/?saddr=${origin}&daddr=${waypoints}`
    }
  }

  const links = getLinks()

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Routes</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select clients for route</label>
        <div className="border max-h-48 overflow-y-auto p-2 space-y-1">
          {clients.filter(c => c.address).map(c => (
            <label key={c.ID} className="flex items-center gap-2 text-sm text-gray-900">
              <input type="checkbox" checked={selected.includes(c.ID)} onChange={() => toggle(c.ID)} />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Date (optional)</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border text-gray-900 bg-white" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border text-gray-900 bg-white" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort route by</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full p-2 border text-gray-900 bg-white">
          <option value="closest">Closest to office first</option>
          <option value="furthest">Furthest from office first</option>
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-2">Calculating...</p>}
      {stops.length > 0 && (
        <div className="mb-4 p-4 border bg-white">
          <h2 className="font-medium text-gray-900 mb-2">Route Preview</h2>
          {stops.map((s, i) => (
            <div key={i} className="mb-2 pb-2 border-b last:border-0 text-sm text-gray-700">
              <p className="font-medium text-gray-900">{i + 1}. {s.name}</p>
              <p>Drive: {format(s.driveMin)}</p>
              <p>{s.isFirst ? 'Leave office by' : 'Leave previous by'}: {s.departBy}</p>
              <p>Arrive by: {s.arriveAt}</p>
            </div>
          ))}
        </div>
      )}

      {links && (
        <div className="flex flex-col gap-2">
          <a href={links.google} target="_blank" className="bg-blue-600 text-white text-center py-3">Open in Google Maps</a>
          <a href={links.apple} target="_blank" className="bg-gray-800 text-white text-center py-3">Open in Apple Maps</a>
        </div>
      )}
    </div>
  )
}
