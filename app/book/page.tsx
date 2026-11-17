'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Book() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notifyBy, setNotifyBy] = useState<'email' | 'text' | 'both'>('email')
  const [status, setStatus] = useState('')
  const [busyTimes, setBusyTimes] = useState<string[]>([])
  const [recommendation, setRecommendation] = useState<any[]>([])
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

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*')
    setClients(data || [])
  }

  async function loadOffice() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('office_address').eq('id', user.id).single()
    setOfficeAddress(data?.office_address || '')
  }

  function toggleClient(id: string) {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function checkAvailability(selectedDate: string) {
    try {
      const res = await fetch('https://lumenforge-prod.app.n8n.cloud/webhook/bab90c6e-d5b9-49b2-8271-ca3029af1eee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      })
      const data = await res.json()
      setBusyTimes(data.unavailableTimes || [])
    } catch {
      setBusyTimes([])
    }
  }

  async function generateRecommendation() {
    if (!date || selectedClients.length === 0) {
      setStatus('Select clients and a date')
      return
    }
    if (!officeAddress) {
      setStatus('Set your office address in Settings first')
      return
    }
    setStatus('Generating...')
    // Simple sequential times starting from selected time or 8:00
    const start = time || '08:00'
    let [h, m] = start.split(':').map(Number)
    let currentMins = h * 60 + m
    const rec: any[] = []
    for (const id of selectedClients) {
      const client = clients.find(c => c.ID === id)
      if (!client) continue
      const leave = currentMins
      const arrive = leave + 30 // placeholder; real drive comes from Routes page
      rec.push({
        clientId: id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        date,
        time: `${Math.floor(currentMins / 60).toString().padStart(2, '0')}:${(currentMins % 60).toString().padStart(2, '0')}`,
        leaveBy: `${Math.floor(leave / 60)}:${(leave % 60).toString().padStart(2, '0')}`,
        arriveBy: `${Math.floor(arrive / 60)}:${(arrive % 60).toString().padStart(2, '0')}`
      })
      currentMins += 90
    }
    setRecommendation(rec)
    setStatus('')
  }

  async function bookAll() {
    if (recommendation.length === 0) return
    setStatus('Booking...')
    for (const appt of recommendation) {
      try {
        await fetch('https://lumenforge-prod.app.n8n.cloud/webhook/ed413225-6b24-4ccf-8f52-b1f2db33e41b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: appt.clientId,
            name: appt.name,
            email: appt.email,
            phone: appt.phone,
            date: appt.date,
            time: appt.time,
            notifyBy
          })
        })
      } catch {
        setStatus('Error booking some appointments')
        return
      }
    }
    setStatus('Appointments booked')
    setRecommendation([])
    setSelectedClients([])
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Schedule Appointment</h1>

      {!officeAddress && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          Office address not set. <a href="/settings" className="text-blue-600 underline">Set it in Settings</a> for accurate routes.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Clients</label>
          <div className="border max-h-40 overflow-y-auto p-2 space-y-1 mt-1">
            {clients.map(c => (
              <label key={c.ID} className="flex items-center gap-2 text-sm text-gray-900">
                <input type="checkbox" checked={selectedClients.includes(c.ID)} onChange={() => toggleClient(c.ID)} />
                {c.name} {c.phone ? `(${c.phone})` : ''}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={date} onChange={e => { setDate(e.target.value); checkAvailability(e.target.value) }} className="w-full p-2 border text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
          <select value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border text-gray-900">
            <option value="">Select time</option>
            {timeSlots.map(slot => (
              <option key={slot.value} value={slot.value} disabled={busyTimes.includes(slot.value)}>
                {slot.label} {busyTimes.includes(slot.value) ? '(unavailable)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send confirmation by</label>
          <select value={notifyBy} onChange={e => setNotifyBy(e.target.value as any)} className="w-full p-2 border text-gray-900">
            <option value="email">Email only</option>
            <option value="text">Text only</option>
            <option value="both">Email and text</option>
          </select>
        </div>

        <button onClick={generateRecommendation} className="w-full bg-blue-600 text-white p-2">Generate Recommendation</button>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>

      {recommendation.length > 0 && (
        <div className="mt-6 p-4 border bg-white">
          <h2 className="font-medium text-gray-900 mb-2">Recommended Schedule</h2>
          <p className="text-xs text-gray-600 mb-3">These appointments will be added to your calendar. Confirmation {notifyBy === 'text' ? 'texts' : notifyBy === 'both' ? 'emails and texts' : 'emails'} will be sent.</p>
          {recommendation.map((r, i) => (
            <div key={i} className="mb-2 text-sm text-gray-800">
              {i + 1}. {r.name}<br />
              Date: {r.date} &nbsp; Time: {r.time}<br />
              Leave office by: {r.leaveBy} &nbsp; Arrive by: {r.arriveBy}
            </div>
          ))}
          <button onClick={bookAll} className="w-full bg-green-600 text-white p-2 mt-3">Book All Appointments & Send {notifyBy === 'text' ? 'Texts' : notifyBy === 'both' ? 'Emails & Texts' : 'Emails'}</button>
        </div>
      )}
    </div>
  )
}
