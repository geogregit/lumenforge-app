'use client'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">LumenForge</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-gray-900 bg-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 font-medium"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-gray-700 text-center">{message}</p>}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 w-full text-sm text-blue-600"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </div>
    </div>
  )
}
