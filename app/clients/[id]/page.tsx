import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ClientDetail({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: client, error } = await supabase
    .from('Clients')
    .select('*')
    .eq('ID', params.id)
    .single()

  if (error || !client) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/clients/list" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Back to clients
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">{client.name}</h1>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium">Email:</span>{' '}
              {client.email || <span className="text-red-600">Missing</span>}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{' '}
              {client.phone || <span className="text-red-600">Missing</span>}
            </p>
            <p>
              <span className="font-medium">Address:</span> {client.address || '—'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Future Visits</h2>
          <p className="text-sm text-gray-500">No upcoming visits yet.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Visits</h2>
          <p className="text-sm text-gray-500">No past visits yet.</p>
        </div>
      </div>
    </div>
  )
}
