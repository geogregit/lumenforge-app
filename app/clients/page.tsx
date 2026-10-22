'use client'
import { createClient } from '@/lib/supabase'
import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'

export default function ImportClients() {
  const [status, setStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('Processing...')
    const { data: { user } } = await supabase.auth.getUser()
    let rows: any[] = []
    if (file.name.endsWith('.csv')) {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      rows = lines.slice(1).map(line => {
        const vals = line.split(',')
        const obj: any = {}
        headers.forEach((h, i) => obj[h] = vals[i]?.trim())
        return {
          name: obj.name,
          email: obj.email,
          phone: obj.phone,
          address: obj.address,
          user_ID: user?.id
        }
      }).filter(r => r.name && r.email)
    } else {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet)
      rows = json.map((r: any) => ({
        name: r.Name || r.name,
        email: r.Email || r.email,
        phone: r.Phone || r.phone,
        address: r.Address || r.address,
        user_ID: user?.id
      })).filter(r => r.name && r.email)
    }
    const { error } = await supabase.from('Clients').insert(rows)
    if (error) { setStatus('Upload failed'); alert(error.message) }
    else { setStatus(`Added ${rows.length} clients`) }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4 text-gray-900">Import Spreadsheet</h1>
      <div className="p-4 border">
        <h2 className="font-medium mb-2 text-gray-900">Upload spreadsheet</h2>
        <p className="text-sm text-gray-600 mb-3">CSV or Excel (.xlsx) with columns: Name, Email (Phone and Address optional)</p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} className="w-full bg-blue-600 text-white p-2">Upload File</button>
        {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  )
}
