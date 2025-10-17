import { DocumentActionProps, DocumentActionComponent } from 'sanity'

/**
 * Sanity Document Action for server-side AI translation
 * Calls external translation API which handles:
 * - fetching from Sanity
 * - translation via OpenAI
 * - creating the translated document back in Sanity
 */
export const translateAction = (getClient: any): DocumentActionComponent =>
  (props: DocumentActionProps) => {
    const { id, type } = props
    if (type !== 'post') return null

    return {
      label: 'Translate with AI',
      disabled: false,
      onHandle: async () => {
        try {
          const targetLang =
            window.prompt('Translate to (fr, de, es, no):')?.trim().toLowerCase() || 'fr'

          if (!targetLang) {
            alert('Translation cancelled — no target language selected.')
            return
          }

          // Inform the user early
          alert(`Starting translation to ${targetLang.toUpperCase()}.\nThis may take 1–2 minutes.`)

          console.log(`[TranslateAction] Calling server to translate ${id} → ${targetLang}`)

          const res = await fetch('https://mozart-api-kwzz.onrender.com/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: id, targetLang }),
          })

          if (!res.ok) {
            const errText = await res.text()
            console.error('[TranslateAction] API error:', errText)
            alert(`Translation failed: ${res.statusText}`)
            return
          }

          const data = await res.json()
          console.log('[TranslateAction] Translation complete:', data)

          if (data.success) {
            alert(`✅ Translation completed!\n\nNew document: ${data.result.title}`)
          } else {
            alert(`⚠️ Translation did not complete successfully.`)
          }

          props.onComplete()
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          console.error('[TranslateAction] Unexpected error:', message)
          alert(`An unexpected error occurred: ${message}`)
        }
      },
    }
  }
