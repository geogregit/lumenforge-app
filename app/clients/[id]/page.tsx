import { Suspense } from 'react'
import ClientProfileClient from './ClientProfileClient'

export default function ClientProfilePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ClientProfileClient />
    </Suspense>
  )
}
