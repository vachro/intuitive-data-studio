import React, {useEffect, useState} from 'react'

type BundlesResponse = {
  ok: boolean
  bundles?: string[]
  error?: string
}

type ImportResponse = {
  ok: boolean
  filename?: string
  operaId?: string
  transactionId?: string
  error?: string
}

// 🔹 Same backend as translateAction
const API_BASE = 'https://mozart-api-kwzz.onrender.com'

export function OperaImporterTool() {
  const [bundles, setBundles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [busyFile, setBusyFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<ImportResponse | null>(null)

  async function loadBundles() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/api/opera/bundles`, {
        method: 'GET',
      })

      const json = (await res.json()) as BundlesResponse
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${res.status}`)
      }

      setBundles(json.bundles || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBundles([])
    } finally {
      setLoading(false)
    }
  }

  async function importBundle(filename: string) {
    setBusyFile(filename)
    setError(null)
    setLastResult(null)

    try {
      const res = await fetch(`${API_BASE}/api/opera/import-file`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({filename}),
      })

      const json = (await res.json()) as ImportResponse
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${res.status}`)
      }

      setLastResult(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusyFile(null)
    }
  }

  useEffect(() => {
    loadBundles()
  }, [])

  return (
    <div style={{padding: 16, maxWidth: 900}}>
      <h2 style={{margin: 0}}>Opera Import</h2>
      <p style={{marginTop: 8}}>
        Select a JSON bundle from the server and import it into Sanity.
      </p>

      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
        <button onClick={loadBundles} disabled={loading || !!busyFile}>
          {loading ? 'Loading…' : 'Refresh list'}
        </button>
      </div>

      {error && (
        <div style={{marginTop: 12, padding: 12, border: '1px solid #ff6b6b'}}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {lastResult?.ok && (
        <div style={{marginTop: 12, padding: 12, border: '1px solid #51cf66'}}>
          <div>
            <strong>Imported:</strong> {lastResult.filename}
          </div>
          {lastResult.operaId && (
            <div>
              <strong>Opera ID:</strong> {lastResult.operaId}
            </div>
          )}
          {lastResult.transactionId && (
            <div>
              <strong>Transaction:</strong> {lastResult.transactionId}
            </div>
          )}
        </div>
      )}

      <div style={{marginTop: 16}}>
        {bundles.length === 0 && !loading ? (
          <div style={{opacity: 0.8}}>No bundles found.</div>
        ) : (
          <ul style={{paddingLeft: 16}}>
            {bundles.map((f) => (
              <li key={f} style={{marginBottom: 8}}>
                <button
                  onClick={() => importBundle(f)}
                  disabled={!!busyFile}
                  style={{marginRight: 8}}
                >
                  {busyFile === f ? 'Importing…' : 'Import'}
                </button>
                <code>{f}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
