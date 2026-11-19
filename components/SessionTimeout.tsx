'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export default function SessionTimeout() {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }, TIMEOUT_MS)
  }

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return null
}
