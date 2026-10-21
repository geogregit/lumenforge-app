'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Book() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState('')
  const [busyTimes, setBusyTimes] = useState<string[]>([])
  const [officeAddress, setOfficeAddress] = useState('')
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
    if (!selectedClient || !date || !time) return
    const client = clients.find(c => c.ID === selectedClient)
    setStatus('Booking...')
    try {
      const res = await fetch('https://lumenforge-prod.app.n8n.cloud/webhook/ed413225-6b24-4ccf-8f52-b1f2db33e41b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: client.name, email: client.email, date, time })
      })
      if (res.ok) {
        setStatus('Appointment booked!')
        alert('Appointment booked successfully')
        checkAvailability(date)
      }
    } catch (err) { setStatus('Error') }
  }

  const selected = clients.find(c => c.ID === selectedClient)
  const showRoute = selected && selected.address && officeAddress && date && time

  function getLeaveBy() {
    if (!time) return ''
    const [h, m] = time.split(':').map(Number)
    const leave = new Date()
    leave.setHours(h, m - 30, 0, 0) // simple 30 min buffer
    let lh = leave.getHours()
    const lm = leave.getMinutes().toString().padStart(2, '0')
    const ampm = lh < 12 ? 'AM' : 'PM'
    lh = lh % 12 || 12
    return `${lh}:${lm} ${ampm}`
  }

  function getMapLinks() {
    if (!showRoute) return null
    const origin = encodeURIComponent(officeAddress)
    const dest = encodeURIComponent(selected.address)
    const google = `https://www.google.com/maps/dir/${origin}/${dest}`
    const apple = `https://maps.apple.com/?saddr=${origin}&daddr=${dest}`
    return { google, apple }
  }

  const links = getMapLinks()

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Schedule Appointment</h1>
      <form onSubmit={handleBook} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="w-full p-2 border text-gray-900 bg-white">
            <option value="">Select client</option>
            {clients.map(c => <option key={c.ID} value={c.ID}>{c.name}</option>)}
          </select>
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
        <button type="submit" className="w-full bg-blue-600 text-white p-2">Book Appointment</button>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </form>

      {showRoute && (
        <div className="mt-8 p-4 border bg-white">
          <h2 className="font-medium text-gray-900 mb-3">Route Preview</h2>
          <p className="text-sm text-gray-700 mb-1"><strong>Client:</strong> {selected.name}</p>
          <p className="text-sm text-gray-700 mb-1"><strong>Address:</strong> {selected.address}</p>
          <p className="text-sm text-gray-700 mb-1"><strong>Appointment:</strong> {timeSlots.find(s => s.value === time)?.label}</p>
          <p className="text-sm text-gray-900 mb-4"><strong>Leave office by:</strong> {getLeaveBy()}</p>
          {links && (
            <div className="flex flex-col gap-2">
              <a href={links.google} target="_blank" className="bg-blue-600 text-white text-center py-2">Open in Google Maps</a>
              <a href={links.apple} target="_blank" className="bg-gray-800 text-white text-center py-2">Open in Apple Maps</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
