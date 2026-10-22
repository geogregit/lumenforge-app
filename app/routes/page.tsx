'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Routes() {
  const [clients, setClients] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [office, setOffice] = useState('')
  const [date, setDate] = useState('')
  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

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

  function getLinks() {
    if (!office || selected.length === 0) return null
    const stops = clients.filter(c => selected.includes(c.ID) && c.address)
    if (stops.length === 0) return null
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
      <h1 className="text-2xl mb-4">Routes</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select clients for route</label>
        <div className="border max-h-48 overflow-y-auto p-2 space-y-1">
          {clients.filter(c => c.address).map(c => (
            <label key={c.ID} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(c.ID)} onChange={() => toggle(c.ID)} />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Date (optional)</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border" />
      </div>
      {links && (
        <div className="flex flex-col gap-2">
          <a href={links.google} target="_blank" className="bg-blue-600 text-white text-center py-3">Open in Google Maps</a>
          <a href={links.apple} target="_blank" className="bg-gray-800 text-white text-center py-3">Open in Apple Maps</a>
        </div>
      )}
    </div>
  )
}
