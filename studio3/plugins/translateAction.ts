import { DocumentActionProps, DocumentActionComponent } from 'sanity'

/**
 * Deler opp Sanity Portable Text-body i flere deler slik at hver del holder seg under ca. 250k tegn
 */
function splitBodyArray(body: any[], maxChars = 250_000) {
  const chunks: any[][] = []
  let current: any[] = []
  let length = 0

  for (const block of body) {
    const text = JSON.stringify(block)
    if (length + text.length > maxChars && current.length > 0) {
      chunks.push(current)
      current = []
      length = 0
    }
    current.push(block)
    length += text.length
  }

  if (current.length > 0) chunks.push(current)
  return chunks
}

/**
 * Tar et Sanity-dokument og returnerer en ny versjon som:
 * - fjerner alle systemfelter (som starter med "_")
 * - beholder alt annet
 * - lar oss overskrive enkelte felt med "overrides"
 */
function inheritSanityDoc(doc: Record<string, any>, overrides: Record<string, any> = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(doc).filter(([key]) =>
      key === "_type" ? true : !key.startsWith("_")
    )
  )
  return { ...cleaned, ...overrides }
}

/**
 * Sanity Document Action for AI-oversettelse
 */
export const translateAction = (getClient: any): DocumentActionComponent =>
  (props: DocumentActionProps) => {
    const { id, type } = props
    if (type !== 'post') return null

    return {
      label: 'Translate with AI',
      disabled: false,
      onHandle: async () => {
        const client = getClient({ apiVersion: '2023-10-01' })
        const doc = await client.fetch(`*[_id == $id][0]`, { id })

        if (!doc?.body) {
          alert('This document has no body content to translate.')
          return
        }

        const body = doc.body
        const targetLang = window.prompt('Translate to (fr, de, es, no):')?.trim().toLowerCase() || 'fr'
        const chunks = splitBodyArray(body)

        const allTranslated: any[] = []
        for (let i = 0; i < chunks.length; i++) {
          console.log(`Translating chunk ${i + 1}/${chunks.length} (${chunks[i].length} blocks)`)

          const res = await fetch("https://mozart-api-kwzz.onrender.com/api/translate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: chunks[i], targetLang }),
          })

          if (!res.ok) {
            console.error('Translation API error:', res.statusText)
            alert(`Translation failed for chunk ${i + 1}. Check console for details.`)
            return
          }

          const { translated } = await res.json()
          allTranslated.push(...translated)
        }

        // Arv hele dokumentet, men overskriv språk, tittel og body
        const translatedDoc = inheritSanityDoc(doc, {
          language: targetLang,
          title: `${doc.title} (${targetLang})`,
          body: allTranslated,
        })

        await client.create(translatedDoc)

        await props.onComplete()
      },
    }
  }
