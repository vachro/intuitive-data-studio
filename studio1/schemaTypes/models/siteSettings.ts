// studio1/schemaTypes/models/siteSettings.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'description', type: 'text'}),
    defineField({
      name: 'defaultLanguage',
      type: 'string',
      options: {list: ['nb', 'en', 'de', 'fr']},
      initialValue: 'nb',
    }),
    defineField({
      name: 'navigation',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'label', type: 'string'},
          {name: 'href',  type: 'string'},
        ],
        preview: {select: {title: 'label', subtitle: 'href'}},
      }],
    }),
  ],
})
