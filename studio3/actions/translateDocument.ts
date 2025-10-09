import {useState} from 'react'
import {DocumentActionComponent} from 'sanity'
import {useToast} from '@sanity/ui'
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
  const [isTranslating, setIsTranslating] = useState(false)
  const toast = useToast()

  if (props.type !== 'post' && props.type !== 'category') {
    return null
  }

  const handleTranslate = async () => {
    try {
      const doc = props.draft || props.published
      if (!doc) {
        toast.push({
          status: 'error',
          title: 'No document found',
          description: 'Save the document first before translating',
        })
        return
      }

      const currentLanguage = (doc as TranslationDocument).language || 'en'
      
      const targetLanguage = window.prompt(
        `Current language: ${currentLanguage.toUpperCase()}\n\nEnter target language code:\n• en (English)\n• de (Deutsch)\n• es (Español)\n• fr (Français)\n• no (Norsk)`,
        currentLanguage === 'en' ? 'no' : 'en'
      )

      if (!targetLanguage) return

      const validLanguages = ['en', 'de', 'es', 'fr', 'no']
      if (!validLanguages.includes(targetLanguage.toLowerCase())) {
        toast.push({
          status: 'error',
          title: 'Invalid language code',
          description: `"${targetLanguage}" is not valid. Use: en, de, es, fr, no`,
        })
        return
      }

      if (targetLanguage === currentLanguage) {
        toast.push({
          status: 'warning',
          title: 'Same language',
          description: 'Target language is the same as source language',
        })
        return
      }

      const apiKey = import.meta.env.SANITY_STUDIO_OPENAI_API_KEY
      if (!apiKey) {
        toast.push({
          status: 'error',
          title: 'API key missing',
          description: 'Add SANITY_STUDIO_OPENAI_API_KEY to .env.local',
          duration: 10000,
        })
        console.error('Create a .env.local file with: SANITY_STUDIO_OPENAI_API_KEY=your-key-here')
        return
      }

      setIsTranslating(true)

      toast.push({
        status: 'info',
        title: `Translating to ${targetLanguage.toUpperCase()}...`,
        description: 'This may take a moment',
        duration: 5000,
      })

      console.log('📝 Starting translation...')
      console.log('Source language:', currentLanguage)
      console.log('Target language:', targetLanguage)
      
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true})

      console.log('📄 Translating title...')
      const translatedTitle = await translateText(
        openai,
        (doc as TranslationDocument).title || '',
        targetLanguage
      )
      console.log('✅ Title translated:', translatedTitle)

      let translatedBody = (doc as TranslationDocument).body
      if (translatedBody && Array.isArray(translatedBody)) {
        console.log(`📄 Translating ${translatedBody.length} content blocks...`)
        translatedBody = await translatePortableText(openai, translatedBody, targetLanguage)
        console.log('✅ Content blocks translated')
      }

      const languageNames: {[key: string]: string} = {
        en: 'English',
        de: 'Deutsch',
        es: 'Español',
        fr: 'Français',
        no: 'Norsk',
      }

      const translatedDoc = {
        _type: props.type,
        language: targetLanguage,
        title: translatedTitle,
        body: translatedBody,
        author: (doc as TranslationDocument).author,
        categories: (doc as TranslationDocument).categories,
        mainImage: (doc as TranslationDocument).mainImage,
        publishedAt: (doc as TranslationDocument).publishedAt,
      }

      console.log('=== 🎉 TRANSLATION COMPLETE ===')
      console.log('Title:', translatedTitle)
      console.log('Target Language:', targetLanguage)
      console.log('Full Translated Document:', JSON.stringify(translatedDoc, null, 2))
      console.log('===============================')

      toast.push({
        status: 'success',
        title: 'Translation complete!',
        description: `${languageNames[currentLanguage]} → ${languageNames[targetLanguage]}. Check console (F12) for full translation.`,
        duration: 10000,
      })

      console.log('\n📋 NEXT STEPS:')
      console.log('1. Create a new', props.type)
      console.log('2. Set language to:', languageNames[targetLanguage])
      console.log('3. Copy the translated data from console above')
      console.log('4. Paste into the new document')

    } catch (error) {
      console.error('❌ Translation error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      toast.push({
        status: 'error',
        title: 'Translation failed',
        description: errorMsg,
        duration: 10000,
      })
      
      console.error('Full error:', error)
    } finally {
      setIsTranslating(false)
    }
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
  if (!text || !text.trim()) return text

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
  let blockNum = 0

  for (const block of blocks) {
    blockNum++
    
    if (block._type === 'block' && block.children && Array.isArray(block.children)) {
      const hasText = block.children.some((child: any) => child.text && child.text.trim())

      if (hasText) {
        console.log(`  Translating block ${blockNum}/${blocks.length}...`)
        
        const translatedChildren = []
        for (const child of block.children) {
          if (child.text) {
            const translatedText = await translateText(openai, child.text, targetLanguage)
            translatedChildren.push({
              ...child,
              text: translatedText,
            })
          } else {
            translatedChildren.push(child)
          }
        }
        
        translatedBlocks.push({
          ...block,
          children: translatedChildren,
        })
      } else {
        translatedBlocks.push(block)
      }
    } else {
      translatedBlocks.push(block)
    }
  }

  return translatedBlocks
}
