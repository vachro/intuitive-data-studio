// plugins/translateAction.ts
import { DocumentActionProps, DocumentActionComponent } from 'sanity'

export const translateAction = (getClient: any): DocumentActionComponent =>
  (props: DocumentActionProps) => {
    const { id, type } = props
    if (type !== 'post') return null

    let supportedLanguages: { id: string; title: string }[] = []

    try {
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

    if (!supportedLanguages.length) {
      supportedLanguages = [
        { id: 'no', title: 'Norsk' },
        { id: 'sv', title: 'Svenska' },
        { id: 'da', title: 'Dansk' },
        { id: 'fi', title: 'Suomi' },
        { id: 'en', title: 'English' },
        { id: 'de', title: 'Deutsch' },
        { id: 'fr', title: 'Français' },
        { id: 'es', title: 'Español' },
        { id: 'it', title: 'Italiano' },
        { id: 'pt', title: 'Português' },
        { id: 'nl', title: 'Nederlands' },
        { id: 'pl', title: 'Polski' },
        { id: 'cs', title: 'Čeština' },
        { id: 'sk', title: 'Slovenčina' },
        { id: 'ru', title: 'Русский' },
        { id: 'tr', title: 'Türkçe' },
        { id: 'ja', title: '日本語' },
        { id: 'zh', title: '中文' },
        { id: 'ko', title: '한국어' },
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

          alert(`Starting translation to ${langName}.\nYou can safely navigate away — translation continues in background.`)

          console.log(`[TranslateAction] Queuing translation for ${id} → ${targetLang}`)

          // Fire-and-forget pattern — don't await the fetch result
          fetch('https://mozart-api-kwzz.onrender.com/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: id, targetLang }),
          }).then(res => {
            if (!res.ok) {
              console.warn('[TranslateAction] Background translation response not OK:', res.status)
            }
          }).catch(err => {
            console.warn('[TranslateAction] Background translation may still succeed:', err)
          })

          // Return immediately — no long wait
          props.onComplete()

        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          console.error('[TranslateAction] Unexpected error:', message)
          alert(`An unexpected error occurred: ${message}`)
          props.onComplete()
        }
      },
    }
  }
