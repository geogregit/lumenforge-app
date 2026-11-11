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
          <button type="button" onClick={selectAll} className="text-sm bg-gray-200 px-3 py-1 rounded 
