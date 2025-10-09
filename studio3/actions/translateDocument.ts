import {useCallback, useState} from 'react'
import {DocumentActionComponent, useDocumentOperation} from 'sanity'
import {TranslateIcon} from '@sanity/icons'
import {translationConfig} from '../translationConfig'

interface TranslationDocument {
  _id: string
  _type: string
  language?: string
  title?: string
  body?: any[]
  [key: string]: any
}

export const translateDocumentAction: DocumentActionComponent = (props) => {
  const {publish, patch} = useDocumentOperation(props.id, props.type)
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = useCallback(async () => {
    const doc = props.draft || props.published
    if (!doc) return

    const currentLanguage = (doc as TranslationDocument).language || 'en'
    
    const targetLanguage = window.prompt(
      `Current language: ${currentLanguage}\nEnter target language code (en, de, es, fr, no):`,
      currentLanguage === 'en' ? 'no' : 'en'
    )

    if (!targetLanguage || targetLanguage === currentLanguage) {
      return
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      alert('OpenAI API key not found. Please add OPENAI_API_KEY to your environment variables.')
      return
    }

    setIsTranslating(true)

    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true})

      const translatedTitle = await translateText(
        openai,
        (doc as TranslationDocument).title || '',
        targetLanguage
      )

      let translatedBody = (doc as TranslationDocument).body
      if (translatedBody && Array.isArray(translatedBody)) {
        translatedBody = await translatePortableText(openai, translatedBody, targetLanguage)
      }

      const languageNames: {[key: string]: string} = {
        en: 'English',
        de: 'Deutsch',
        es: 'Español',
        fr: 'Français',
        no: 'Norsk',
      }

      const newDocId = `${props.id.split('.')[0]}.${targetLanguage}`
      
      const translatedDoc = {
        _type: props.type,
        _id: newDocId,
        language: targetLanguage,
        title: translatedTitle,
        body: translatedBody,
        'translation.metadata': {
          _type: 'translation.metadata',
          translations: [
            {
              _key: targetLanguage,
              value: {
                _type: 'reference',
                _ref: newDocId,
              },
            },
          ],
        },
      }

      const shouldCreateNew = window.confirm(
        `Translation complete!\n\nTarget: ${languageNames[targetLanguage] || targetLanguage}\nTitle: ${translatedTitle}\n\nOpen browser console to see full translation, then create new document?`
      )

      if (shouldCreateNew) {
        console.log('=== TRANSLATED DOCUMENT ===')
        console.log('Title:', translatedTitle)
        console.log('Target Language:', targetLanguage)
        console.log('Full Document:', JSON.stringify(translatedDoc, null, 2))
        console.log('=========================')
        
        window.open(`/structure/${props.type}`, '_blank')
        
        alert(
          `Translation saved to console!\n\n1. Open browser DevTools (F12)\n2. Find the translated content in console\n3. Create new ${languageNames[targetLanguage]} document\n4. Copy/paste the translated title and content`
        )
      }
    } catch (error) {
      console.error('Translation error:', error)
      alert(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTranslating(false)
    }
  }, [props, publish, patch])

  if (props.type !== 'post' && props.type !== 'category') {
    return null
  }

  return {
    label: isTranslating ? 'Translating...' : 'Translate with AI',
    icon: TranslateIcon,
    disabled: isTranslating,
    onHandle: handleTranslate,
  }
}

async function translateText(
  openai: any,
  text: string,
  targetLanguage: string
): Promise<string> {
  if (!text) return text

  const response = await openai.chat.completions.create({
    model: translationConfig.model,
    temperature: translationConfig.temperature,
    messages: [
      {role: 'system', content: translationConfig.systemPrompt},
      {
        role: 'user',
        content: `Translate to ${targetLanguage}:\n\n${text}`,
      },
    ],
  })

  return response.choices[0]?.message?.content || text
}

async function translatePortableText(
  openai: any,
  blocks: any[],
  targetLanguage: string
): Promise<any[]> {
  const translatedBlocks = []

  for (const block of blocks) {
    if (block._type === 'block' && block.children) {
      const textToTranslate = block.children
        .map((child: any) => child.text)
        .join('')

      if (textToTranslate.trim()) {
        const translatedText = await translateText(openai, textToTranslate, targetLanguage)
        
        const translatedBlock = {
          ...block,
          children: [
            {
              ...block.children[0],
              text: translatedText,
            },
          ],
        }
        translatedBlocks.push(translatedBlock)
      } else {
        translatedBlocks.push(block)
      }
    } else {
      translatedBlocks.push(block)
    }
  }

  return translatedBlocks
}
