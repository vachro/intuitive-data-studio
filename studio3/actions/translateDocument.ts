import { DocumentActionComponent } from 'sanity'
import { TranslateIcon } from '@sanity/icons'

interface TranslationDocument {
  _id: string
  _type: string
  language?: string
  title?: string
  body?: any[]
  [key: string]: any
}

let isTranslating = false

export const translateDocumentAction: DocumentActionComponent = (props) => {
  if (props.type !== 'post' && props.type !== 'category') return null

  const handleTranslate = async () => {
    if (isTranslating) {
      alert('Translation already in progress. Please wait...')
      return
    }

    isTranslating = true
    try {
      const doc = (props.draft || props.published) as TranslationDocument
      if (!doc) {
        alert('No document found. Save the document first before translating.')
        return
      }

      const currentLanguage = doc.language || 'en'
      const targetLanguage = window.prompt(
        `Current language: ${currentLanguage.toUpperCase()}\n\nEnter target language code:\n• en • de • es • fr • no`,
        currentLanguage === 'en' ? 'no' : 'en'
      )
      if (!targetLanguage) return

      const valid = ['en', 'de', 'es', 'fr', 'no']
      if (!valid.includes(targetLanguage.toLowerCase())) {
        alert(`Invalid language code: "${targetLanguage}". Use: en, de, es, fr, no`)
        return
      }

      if (targetLanguage === currentLanguage) {
        alert('Target language is the same as source language.')
        return
      }

      console.log(`🌐 Translating to ${targetLanguage.toUpperCase()}...`)

      // 1️⃣ Extract text content
      const texts: string[] = []
      const structure: { blockIndex: number; childIndex: number }[] = []

      if (typeof doc.title === 'string' && doc.title.trim()) {
        texts.push(doc.title)
        structure.push({ blockIndex: -1, childIndex: -1 })
      }

      if (Array.isArray(doc.body)) {
        doc.body.forEach((block, bIndex) => {
          if (block._type === 'block' && Array.isArray(block.children)) {
            block.children.forEach((child: any, cIndex: number) => {
              if (typeof child.text === 'string' && child.text.trim()) {
                texts.push(child.text)
                structure.push({ blockIndex: bIndex, childIndex: cIndex })
              }
            })
          }
        })
      }

      if (texts.length === 0) {
        alert('No text to translate.')
        return
      }

      // 2️⃣ Send to your OpenAI API proxy
      const prompt = `
Translate each of the following ${texts.length} text items to idiomatic ${targetLanguage}. 
Return a JSON array exactly like: {"results": ["...", "...", "..."]}.
Do not add commentary or formatting. Items:
${JSON.stringify(texts)}
`

      const response = await fetch('https://mozart-api-kwzz.onrender.com/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (!data?.ok || !data.data) {
        console.error('Unexpected response from API:', data)
        alert('Translation failed — invalid API response. Check console.')
        return
      }

      const parsed = JSON.parse(data.data)
      const translatedResults: string[] = parsed.results || []
      let translatedTitle = doc.title
      let translatedBody = Array.isArray(doc.body) ? structuredClone(doc.body) : []

      structure.forEach((pos, i) => {
        const translated = translatedResults[i] || ''
        if (pos.blockIndex === -1) {
          translatedTitle = translated
        } else if (
          translatedBody[pos.blockIndex]?._type === 'block' &&
          translatedBody[pos.blockIndex].children[pos.childIndex]
        ) {
          translatedBody[pos.blockIndex].children[pos.childIndex].text = translated
        }
      })

      // 3️⃣ Resulting document
      const translatedDoc = {
        _type: props.type,
        language: targetLanguage,
        title: translatedTitle,
        body: translatedBody,
        author: doc.author,
        categories: doc.categories,
        mainImage: doc.mainImage,
        publishedAt: doc.publishedAt,
      }

      console.log('✅ Translation complete:')
      console.log(JSON.stringify(translatedDoc, null, 2))
      alert('Translation complete! See console (F12) for the result.')
    } catch (error) {
      console.error('❌ Translation error:', error)
      alert(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      isTranslating = false
    }
  }

  return { label: 'Translate with AI', icon: TranslateIcon, onHandle: handleTranslate }
}
