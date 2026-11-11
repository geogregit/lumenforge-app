'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [office, setOffice] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(false)
  const [showConnect, setShowConnect] = useState(false)
  const [connectApp, setConnectApp] = useState('')
  const [credUser, setCredUser] = useState('')
  const [credPass, setCredPass] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setEmail(user.email || '')
    const { data } = await supabase.from('profiles').select('office_address, full_name').eq('id', user.id).single()
    if (data?.full_name) {
      const parts = data.full_name.split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
    }
    if (data?.office_address) setOffice(data.office_address)
  }

  async function saveProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const fullName = `${firstName} ${lastName}`.trim()
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      office_address: office
    })
    setStatus(error ? error.message : 'Saved')
    setEditing(false)
    setTimeout(() => setStatus(''), 3000)
  }

  async function endAllSessions() {
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
  }

  function openConnect(appName: string) {
    setConnectApp(appName)
    setCredUser('')
    setCredPass('')
    setShowConnect(true)
  }

  function submitConnect() {
    if (!credUser || !credPass) {
      alert('Enter username and password')
      return
    }
    const subject = encodeURIComponent(`Connect ${connectApp}`)
    const body = encodeURIComponent(`Please connect ${connectApp} for this account.\n\nUsername: ${credUser}`)
    window.location.href = `mailto:green.george@live.com?subject=${subject}&body=${body}`
    setShowConnect(false)
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Account</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="bg-green-600 text-white px-4 py-2 rounded text-sm">Edit Profile</button>
        ) : (
          <button onClick={saveProfile} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Save Changes</button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <section className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-3 font-medium">Personal Information</div>
          <div className="p-5 space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">First name</span>
              {editing ? (
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className="border rounded px-2 py-1 w-40 text-gray-900" />
              ) : (
                <span className="text-gray-900">{firstName || '—'}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last name</span>
              {editing ? (
                <input value={lastName} onChange={e => setLastName(e.target.value)} className="border rounded px-2 py-1 w-40 text-gray-900" />
              ) : (
                <span className="text-gray-900">{lastName || '—'}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Primary email</span>
              <span className="text-gray-900">{email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Office address</span>
              {editing ? (
                <input value={office} onChange={e => setOffice(e.target.value)} className="border rounded px-2 py-1 w-40 text-gray-900" />
              ) : (
                <span className="text-gray-900 text-right max-w-[160px] truncate">{office || '—'}</span>
              )}
            </div>
          </div>
        </section>

        {/* Security Methods */}
        <section className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-3 font-medium">Security Methods</div>
          <div className="p-5 space-y-4 text-sm">
            <p className="text-gray-600">Manage how you sign in to LumenForge.</p>
            <div className="flex justify-between items-center border-t pt-3">
              <span>Password</span>
              <button onClick={() => window.location.href = 'mailto:green.george@live.com?subject=Password Reset'} className="border px-3 py-1 rounded text-xs">Reset</button>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span>Email verification</span>
              <span className="text-green-600 text-xs">Verified</span>
            </div>
            <div className="border-t pt-3">
              <button onClick={endAllSessions} className="text-red-600 text-sm">End all sessions</button>
            </div>
          </div>
        </section>
      </div>

      {/* Integrations */}
      <section className="bg-white border rounded-lg mt-6 overflow-hidden">
        <div className="bg-gray-700 text-white px-4 py-3 font-medium">Apps to Integrate</div>
        <div className="p-5 text-sm space-y-3">
          <div className="flex justify-between items-center">
            <span>Outlook / Microsoft 365</span>
            <button onClick={() => openConnect('Outlook')} className="border px-3 py-1 rounded text-xs">Connect</button>
          </div>
          <div className="flex justify-between items-center">
            <span>Google Calendar</span>
            <button onClick={() => openConnect('Google Calendar')} className="border px-3 py-1 rounded text-xs">Connect</button>
          </div>
          <div className="flex justify-between items-center">
            <span>Slack</span>
            <button onClick={() => openConnect('Slack')} className="border px-3 py-1 rounded text-xs">Connect</button>
          </div>
          <div className="flex justify-between items-center">
            <span>Teams</span>
            <button onClick={() => openConnect('Teams')} className="border px-3 py-1 rounded text-xs">Connect</button>
          </div>
          <div className="flex justify-between items-center">
            <span>Zoom</span>
            <button onClick={() => openConnect('Zoom')} className="border px-3 py-1 rounded text-xs">Connect</button>
          </div>
        </div>
      </section>

      {status && <p className="text-sm text-green-600 mt-4">{status}</p>}

      {/* Connect credentials popup */}
      {showConnect && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowConnect(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Connect {connectApp}</h3>
            <p className="text-sm text-gray-600 mb-4">Enter your credentials so LumenForge can access this app.</p>
            <input placeholder="Username or email" value={credUser} onChange={e => setCredUser(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
            <input type="password" placeholder="Password" value={credPass} onChange={e => setCredPass(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
            <div className="flex gap-2">
              <button onClick={submitConnect} className="flex-1 bg-blue-600 text-white py-2 rounded">Connect</button>
              <button onClick={() => setShowConnect(false)} className="flex-1 border py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
