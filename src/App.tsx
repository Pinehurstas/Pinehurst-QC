import React, { useEffect, useMemo, useState } from 'react'
import { categories, cleanlinessRatings, type ChecklistCategory, type CleanlinessRating } from './data/categories'
import { properties as seeded } from './data/properties'
import { db, storage } from './lib/firebase'
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, where } from 'firebase/firestore'
import { get, set } from 'idb-keyval'
import { ref, uploadBytes } from 'firebase/storage'

// Simple brand palette (derived from logo colors)
const brand = {
  bg: '#0a3d2e',
  accent: '#1e7a5f',
  text: '#0f172a',
  card: '#f8fafc',
}

type Property = { id: string; name: string }
type ItemStatus = 'Done' | 'Missed' | 'N/A'

type PhotoAttachment = { itemId: string; file: File; url?: string }

type InspectionRecord = {
  propertyId: string
  propertyName: string
  date: string
  inspector: string
  cleanlinessRating: CleanlinessRating
  results: { [itemId: string]: ItemStatus }
  notes?: string
  misses: number
  action?: 'Verbal Communication' | 'None'
  createdAt?: any
}

const seedProperties: Property[] = seeded

type HistoryRow = InspectionRecord & { id?: string }

function App() {
  const [view, setView] = useState<'new' | 'history'>('new')
  const [properties, setProperties] = useState<Property[]>(seedProperties)
  const [propertyId, setPropertyId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [inspector, setInspector] = useState('')
  const [rating, setRating] = useState<CleanlinessRating>('Neutral')
  const [results, setResults] = useState<Record<string, ItemStatus>>({})
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<PhotoAttachment[]>([])
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState<InspectionRecord | null>(null)
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [historyProperty, setHistoryProperty] = useState<string>('')
  const [queueCount, setQueueCount] = useState<number>(0)

  const items = useMemo(() => {
    const list: { id: string; label: string }[] = []
    categories.forEach((cat) => {
      cat.items.forEach((item) => list.push({ id: item.id, label: `${cat.name} — ${item.text}` }))
    })
    return list
  }, [])

  const misses = useMemo(() => Object.values(results).filter((v) => v === 'Missed').length, [results])
  const action: InspectionRecord['action'] = misses >= 5 ? 'Verbal Communication' : 'None'

  function setItem(id: string, status: ItemStatus) {
    setResults((prev) => ({ ...prev, [id]: status }))
  }

  async function handleAddProperty() {
    const name = prompt('New property name')?.trim()
    if (!name) return
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    setProperties((p) => [...p, { id, name }])
    setPropertyId(id)
  }

  function handlePhotoChange(itemId: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    setPhotos((p) => [...p, { itemId, file }])
  }

  async function saveOffline(record: InspectionRecord) {
    const key = `inspection:${record.propertyId}:${record.date}:${record.inspector}`
    const queue = ((await get('syncQueue')) as any[]) || []
    queue.push({ key, record })
    await set('syncQueue', queue)
  }

  async function syncNow() {
    const queue = ((await get('syncQueue')) as any[]) || []
    if (queue.length === 0) {
      alert('Nothing to sync')
      return
    }
    setSaving(true)
    try {
      for (const entry of queue) {
        const rec = entry.record as InspectionRecord
        const docRef = await addDoc(collection(db, 'inspections'), {
          ...rec,
          createdAt: serverTimestamp(),
        })
        // upload photos
        for (const p of photos.filter((ph) => rec.results[ph.itemId])) {
          const storageRef = ref(storage, `photos/${docRef.id}/${p.itemId}-${Date.now()}`)
          await uploadBytes(storageRef, p.file)
        }
      }
      await set('syncQueue', [])
      alert('Synced!')
    } catch (e) {
      console.error(e)
      alert('Sync failed; records remain queued')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!propertyId || !inspector) {
      alert('Select a property and enter inspector name')
      return
    }
    const propertyName = properties.find((p) => p.id === propertyId)?.name || ''
    const record: InspectionRecord = {
      propertyId,
      propertyName,
      date,
      inspector,
      cleanlinessRating: rating,
      results,
      notes,
      misses,
      action,
    }

    setSaving(true)
    try {
      // Save offline first
      await saveOffline(record)
      setSummary(record)
      alert('Saved offline. You can sync from the Summary when online.')
      // reset form minimally
      setResults({})
      setPhotos([])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#eef4f1', minHeight: '100vh' }}>
      <header style={{ background: brand.bg, color: 'white', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src="/logo.png" alt="PAS" width={36} height={36} />
          <h1 style={{ margin: 0, fontSize: 18 }}>Pinehurst Apartment Services QC</h1>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => setView('new')} style={{ background: view==='new'? brand.accent : '#134e4a', color: 'white', borderRadius: 6, padding: '6px 10px' }}>New Inspection</button>
            <button onClick={() => setView('history')} style={{ background: view==='history'? brand.accent : '#134e4a', color: 'white', borderRadius: 6, padding: '6px 10px' }}>History</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        {view === 'new' && (
        <section style={{ background: brand.card, borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2>New Inspection</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginBottom: 12 }}>
              <label>
                Property
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} style={{ flex: 1 }}>
                    <option value="">Select property</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddProperty}>Add Property</button>
                </div>
              </label>
              <label>
                Date
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label>
                Inspector
                <input value={inspector} onChange={(e) => setInspector(e.target.value)} placeholder="Type name" />
              </label>
              <label>
                Overall Cleanliness
                <select value={rating} onChange={(e) => setRating(e.target.value as CleanlinessRating)}>
                  {cleanlinessRatings.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>

            {categories.map((cat) => (
              <fieldset key={cat.id} style={{ margin: '16px 0', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <legend style={{ padding: '0 8px', fontWeight: 600 }}>{cat.name}</legend>
                <div style={{ display: 'grid', gap: 8 }}>
                  {cat.items.map((item) => {
                    const v = results[item.id] || ''
                    return (
                      <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 8 }}>
                        <div>{item.text}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(['Done','Missed','N/A'] as ItemStatus[]).map((s) => (
                            <label key={s} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                              <input type="radio" name={item.id} checked={v===s} onChange={() => setItem(item.id, s)} /> {s}
                            </label>
                          ))}
                        </div>
                        <div>
                          <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(item.id, e.target.files)} />
                        </div>
                        <div>
                          {/* future: per-item note */}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </fieldset>
            ))}

            <label style={{ display: 'block', marginTop: 12 }}>
              General Notes
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={{ width: '100%' }} />
            </label>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button type="submit" disabled={saving} style={{ background: brand.accent, color: 'white', padding: '8px 12px', borderRadius: 6 }}>Save Offline</button>
              <button type="button" onClick={syncNow} disabled={saving}>
                Sync Now
              </button>
            </div>
          </form>
        </section>
        )}

        {view === 'new' && summary && (
          <section style={{ background: brand.card, borderRadius: 8, padding: 16, marginTop: 16 }}>
            <h2>Summary</h2>
            <p><strong>Property:</strong> {summary.propertyName}</p>
            <p><strong>Date:</strong> {summary.date} &nbsp; <strong>Inspector:</strong> {summary.inspector}</p>
            <p><strong>Misses:</strong> {summary.misses} &nbsp; <strong>Action:</strong> {summary.action}</p>
          </section>
        )}

        {view === 'history' && (
          <section style={{ background: brand.card, borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2>Inspection History</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                Property
                <select value={historyProperty} onChange={(e) => setHistoryProperty(e.target.value)}>
                  <option value="">All properties</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
              <div style={{ marginLeft: 'auto' }}>
                Offline queued: {queueCount} &nbsp;
                <button onClick={syncNow}>Sync Now</button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {history.length === 0 && <div>No inspections yet.</div>}
              {history.map((row) => (
                <div key={row.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{row.propertyName}</div>
                    <div style={{ color: '#475569' }}>{row.date} • Inspector: {row.inspector}</div>
                    <div>Misses: {row.misses} • Action: {row.action}</div>
                  </div>
                  <div>
                    <span style={{ padding: '4px 8px', borderRadius: 6, background: row.misses >= 5 ? '#fee2e2' : '#dcfce7', color: row.misses >= 5 ? '#b91c1c' : '#166534' }}>
                      {row.misses >= 5 ? 'Failed' : 'Passed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
