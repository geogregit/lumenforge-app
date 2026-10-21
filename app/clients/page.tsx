'use client'
import { createClient } from '@/lib/supabase'
import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'

export default function Clients() {
  const [status, setStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('Uploading...')
    let rows: any[] = []
    const { data: { user } } = await supabase.auth.getUser()

    if (file.name.endsWith('.csv')) {
      const text = await file.text()
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) { setStatus('File needs a header and at least one row'); return }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row: any = { user_ID: user?.id }
        headers.forEach((h, i) => {
          if (h === 'name') row.name = values[i]
          if (h === 'email') row.email = values[i]
          if (h === 'phone') row.phone = values[i]
          if (h === 'address') row.address = values[i]
        })
        return row
      }).filter(r => r.name && r.email)
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
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
    } else {
      setStatus('Please upload a CSV or Excel file')
      return
    }

    const { error } = await supabase.from('Clients').insert(rows)
    if (error) { setStatus('Upload failed'); alert(error.message) }
    else { setStatus(`Added ${rows.length} clients`) }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-4">Import Spreadsheet</h1>
      <div className="p-4 border">
        <h2 className="font-medium mb-2">Upload spreadsheet</h2>
        <p className="text-sm text-gray-600 mb-3">CSV or Excel (.xlsx) with columns: Name, Email (Phone and Address optional)</p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} className="w-full bg-blue-600 text-white p-2">Upload File</button>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>
    </div>
  )
}
