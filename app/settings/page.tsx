'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const [officeAddress, setOfficeAddress] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('office_address').eq('id', user.id).single()
      if (data?.office_address) setOfficeAddress(data.office_address)
    }
    load()
  }, [])

  async function saveAddress() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').upsert({ id: user.id, office_address: officeAddress })
    setMessage(error ? error.message : 'Office address saved')
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="p-4 sm:p-10 max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Office Address</h2>
        <input
          type="text"
          value={officeAddress}
          onChange={e => setOfficeAddress(e.target.value)}
          placeholder="123 Main St, City, State ZIP"
          className="w-full border border-gray-300 px-3 py-2 text-gray-900 bg-white mb-3"
        />
        <button onClick={saveAddress} className="bg-blue-600 text-white px-4 py-2">
          Save Address
        </button>
        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </div>

      <div className="bg-white shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Account</h2>
        <p className="text-sm text-gray-700 mb-4">Email: {email}</p>
        <button onClick={logout} className="bg-gray-800 text-white px-4 py-2">
          Log Out
        </button>
      </div>
    </div>
  )
}
