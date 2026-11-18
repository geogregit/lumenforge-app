'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Book() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [confirmation, setConfirmation] = useState('email')
  const [status, setStatus] = useState('')
  const [busyTimes, setBusyTimes] = useState<string[]>([])
  const [stops, setStops] = useState<any[]>([])
  const [officeAddress, setOfficeAddress] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
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

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    loadClients()
    loadOffice()
  }, [])

  useEffect(() => {
    if (date) checkAvailability(date)
  }, [date])

  async function loadOffice() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('office_address').eq('id', user.id).single()
    setOfficeAddress(data?.office_address || '')
  }

  async function loadClients() {
    const { data } = await supabase.from('Clients').select('*')
    setClients(data || [])
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
    } catch (err) {
      console.error(err)
    }
  }

  function toggleClient(id: string) {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function getMins(from: string, to: string) {
    try {
      const res = await fetch('/api/drive-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: from, destination: to })
      })
      const data = await res.json()
      return data.minutes || 20
    } catch {
      return 20
    }
  }

  function format(mins: number) {
    const h = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    if (h === 0) return `${m} min`
    return `${h}h ${m}m`
  }

  function formatTime(timeStr: string) {
    const [h, m] = timeStr.split(':').map(Number)
    const h12 = h % 12 || 12
    const ampm = h < 12 ? 'AM' : 'PM'
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedClients.length === 0 || !date || !time) {
      setStatus('Please select clients, date, and time')
      return
    }
    if (!officeAddress) {
      setStatus('Add your office address in Settings first')
      return
    }

    setStatus('Calculating best route...')
    setStops([])
    setShowConfirm(false)

    const selected = clients.filter(c => selectedClients.includes(c.ID) && c.address)
    if (selected.length === 0) {
      setStatus('Selected clients need addresses for routing')
      return
    }

    const withDist = await Promise.all(
      selected.map(async (c) => ({
        ...c,
        dist: await getMins(officeAddress, c.address)
      }))
    )
    const ordered = [...withDist].sort((a, b) => a.dist - b.dist)

    let appointmentTime = time
    const preview: any[] = []

    for (let i = 0; i < ordered.length; i++) {
      const client = ordered[i]
      const from = i === 0 ? officeAddress : ordered[i - 1].address
      const drive = await getMins(from, client.address)

      const leaveBy = i === 0
        ? subtractMinutes(appointmentTime, drive)
        : appointmentTime

      const arriveAt = addMinutes(leaveBy, drive)

      preview.push({
        name: client.name,
        address: client.address,
        driveMin: drive,
        appointmentTime: formatTime(appointmentTime),
        leaveBy: formatTime(leaveBy),
        arriveAt: formatTime(arriveAt),
        isFirst: i === 0,
        rawTime: appointmentTime,
        clientId: client.ID
      })

      appointmentTime = addMinutes(appointmentTime, 60)
    }

    setStops(preview)
    setShowConfirm(true)
    setStatus('')
  }

  async function confirmSchedule() {
    setStatus('Scheduling appointments...')
    try {
      // Send each appointment to your booking webhook
      for (const stop of stops) {
        await fetch('https://lumenforge-prod.app.n8n.cloud/webhook/ed413225-6b24-4ccf-8f52-b1f2db33e41b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: stop.clientId,
            date,
            time: stop.rawTime,
            confirmation
          })
        })
      }
      setStatus('Appointments scheduled successfully')
      setShowConfirm(false)
      setStops([])
      setSelectedClients([])
    } catch (err) {
      setStatus('Failed to schedule. Try again.')
    }
  }

  function addMinutes(timeStr: string, mins: number) {
    const [h, m] = timeStr.split(':').map(Number)
    const total = h * 60 + m + mins
    const nh = Math.floor(total / 60) % 24
    const nm = total % 60
    return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`
  }

  function subtractMinutes(timeStr: string, mins: number) {
    const [h, m] = timeStr.split(':').map(Number)
    let total = h * 60 + m - mins
    if (total < 0) total += 24 * 60
    const nh = Math.floor(total / 60) % 24
    const nm = total % 60
    return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Schedule Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clients</label>

            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full mb-3 p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="max-h-72 overflow-y-auto space-y-3 pr-1 border border-gray-200 rounded-2xl p-3 bg-white">
              {filteredClients.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No clients found</p>
              ) : (
                filteredClients.map(client => {
                  const selected = selectedClients.includes(client.ID)
                  const missingPhone = !client.phone
                  const missingEmail = !client.email
                  return (
                    <button
                      key={client.ID}
                      type="button"
                      onClick={() => toggleClient(client.ID)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        selected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          {missingPhone && (
                            <p className="text-sm text-red-600 mt-0.5">Missing phone number</p>
                          )}
                          {missingEmail && (
                            <p className="text-sm text-red-600">Missing email</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {selected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start time</label>
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select time</option>
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value} disabled={busyTimes.includes(slot.value)}>
                  {slot.label} {busyTimes.includes(slot.value) ? '(unavailable)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send confirmation by</label>
            <select
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="email">Email only</option>
              <option value="sms">SMS only</option>
              <option value="both">Email + SMS</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition"
          >
            Generate Recommendation
          </button>

          {status && <p className="text-sm text-center text-gray-600">{status}</p>}
        </form>

        {/* Recommendation preview + confirm button */}
        {stops.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Route</h2>
            {stops.map((s, i) => (
              <div key={i} className="mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0">
                <p className="font-medium text-gray-900">{i + 1}. {s.name}</p>
                <p className="text-sm text-gray-900 font-medium mt-1">Appointment: {s.appointmentTime}</p>
                <p className="text-sm text-gray-600">Drive: {format(s.driveMin)}</p>
                <p className="text-sm text-gray-600">
                  {s.isFirst ? 'Leave office by' : 'Leave by'}: {s.leaveBy}
                </p>
                <p className="text-sm text-gray-600">Arrive: {s.arriveAt}</p>
              </div>
            ))}

            {showConfirm && (
              <button
                onClick={confirmSchedule}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition"
              >
                Confirm & Schedule Appointments
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
