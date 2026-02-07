import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { OperaImporterTool } from './plugins/operaImporterTool'
import { documentInternationalization } from '@sanity/document-internationalization'
import { schemaTypes } from './schemaTypes'
import { translateAction } from './plugins/translateAction'
import { postsGroupedStructure } from './structure/postsGroupedStructure'
import { operaStructure } from './structure/operaStructure'






export default defineConfig({
  name: 'default',
  title: 'Mozart Portal',

  projectId: 'yzx3bbg2',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Opera Import')
              .child(S.component(OperaImporterTool).title('Opera Import')),

            S.divider(),
            // ✅ Keep existing items
            S.documentTypeListItem('translation.metadata').title('Translation metadata'),
            S.documentTypeListItem('post').title('Post'),
            postsGroupedStructure(S), // ✅ New grouped view
            S.documentTypeListItem('author').title('Author'),
            S.documentTypeListItem('category').title('Category'),
            S.divider(),
            operaStructure(S),
          ]),
    }),
    visionTool(),
    documentInternationalization({
      supportedLanguages: [
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
      ],
      schemaTypes: ['post', 'category'],
    }),
  ],

  schema: {
    types: schemaTypes,
  },

document: {
  actions: (prev, context) => {
    const { schemaType, getClient } = context;

    if (schemaType === "post") {
      return [translateAction(getClient), ...prev];
    }

    return prev;
  },
},



  server: {
    port: 5000,
    hostname: '0.0.0.0',
  },
})
