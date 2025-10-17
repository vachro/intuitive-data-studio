import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {schemaTypes} from './schemaTypes'
import {translateAction} from './plugins/translateAction'

export default defineConfig({
  name: 'default',
  title: 'Mozart Portal',

  projectId: 'yzx3bbg2',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    documentInternationalization({
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'de', title: 'Deutsch'},
        {id: 'es', title: 'Español'},
        {id: 'fr', title: 'Français'},
        {id: 'no', title: 'Norsk'},
      ],
      schemaTypes: ['post', 'category'],
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'post') {
        // inject client from context
        return [translateAction(context.getClient), ...prev]
      }
      return prev
    },
  },

  server: {
    port: 5000,
    hostname: '0.0.0.0',
  },
})
