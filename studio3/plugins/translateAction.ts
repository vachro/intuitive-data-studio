// plugins/translateAction.ts
import { DocumentActionProps, DocumentActionComponent } from 'sanity'

/**
 * Sanity Document Action for server-side AI translation
 * - Uses the language list from sanity.config.ts (documentInternationalization.supportedLanguages)
 * - Calls the external translation API
 */
export const translateAction = (getClient: any): DocumentActionComponent =>
  (props: DocumentActionProps) => {
    const { id, type } = props
    if (type !== 'post') return null

    // Prøv å hente språklisten fra Sanity-config hvis tilgjengelig
    let supportedLanguages: { id: string; title: string }[] = []

    try {
      // Dette er litt hacky men fungerer i Sanity context (globalThis.SanityConfig kan brukes)
      const sanityConfig =
        (globalThis as any).__sanity_config__ ||
        (window as any).__sanity_config__ ||
        {}

      supportedLanguages =
        sanityConfig?.plugins
          ?.find((p: any) => p.name === '@sanity/document-internationalization')
          ?.options?.supportedLanguages || []
    } catch {
      supportedLanguages = []
    }

    // fallback hvis config ikke kan hentes
    if (!supportedLanguages.length) {
      supportedLanguages = [
        { id: 'en', title: 'English' },
        { id: 'no', title: 'Norsk' },
        { id: 'fr', title: 'Français' },
        { id: 'de', title: 'Deutsch' },
        { id: 'es', title: 'Español' },
      ]
    }

    return {
      label: 'Translate with AI',
      disabled: false,
      onHandle: async () => {
        try {
          const langList = supportedLanguages
            .map((l) => `  ${l.id.padEnd(3)} → ${l.title}`)
            .join('\n')

          const targetLang =
            window
              .prompt(
                `🌍 Select target language:\n\n${langList}\n\nEnter the language code (e.g. "fr"):`,
              )
              ?.trim()
              .toLowerCase() || ''

          if (!targetLang) {
            alert('Translation cancelled — no target language selected.')
            return
          }

          const match = supportedLanguages.find((l) => l.id === targetLang)
          const langName = match ? match.title : targetLang.toUpperCase()

          alert(`Starting translation to ${langName}.\nThis may take 1–2 minutes.`)

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
