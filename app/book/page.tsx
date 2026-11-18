'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Book() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [confirmation, setConfirmation] = useState('email')
  const [status, setStatus] = useState('')
  const [busyTimes, setBusyTimes] = useState<string[]>([])
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

  useEffect(() => { loadClients() }, [])
  useEffect(() => { if (date) checkAvailability(date) }, [date])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedClients.length === 0 || !date || !time) {
      setStatus('Please select clients, date, and time')
      return
    }
    setStatus('Generating recommendation...')
    // Add your existing booking logic here
    setTimeout(() => setStatus('Recommendation ready'), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Schedule Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Clients</label>
            <div className="space-y-3">
              {clients.map(client => {
                const selected = selectedClients.includes(client.ID)
                return (
                  <button
                    key={client.ID}
                    type="button"
                    onClick={() => toggleClient(client.ID)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 transform hover:-translate-y-0.5 ${
                      selected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        {client.phone && (
                          <p className="text-sm text-gray-500">{client.phone}</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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
              })}
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
      </div>
    </div>
  )
}
