'use client'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Loading...')
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      setStatus(error ? error.message : 'Check your email to confirm')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setStatus(error.message)
      else router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Allayabode" className="h-12" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">ALLAYABODE</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded" required />
          <button type="submit" className="w-full bg-black text-white p-3 rounded font-medium">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full mt-4 text-sm text-gray-600">
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
        {status && <p className="mt-4 text-sm text-center text-gray-700">{status}</p>}
      </div>
    </div>
  )
}
