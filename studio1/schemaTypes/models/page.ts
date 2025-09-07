// studio1/schemaTypes/models/page.ts
import {defineType, defineField} from 'sanity'
import {DocumentsIcon} from '@sanity/icons'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: r => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: r => r.required()}),
    defineField({
      name: 'chapters',
      title: 'Chapters (display order = array order)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'chapter'}]}],
      validation: r => r.min(1),
    }),
    defineField({
      name: 'language',
      type: 'string',
      options: {list: ['nb', 'en', 'de', 'fr']},
      initialValue: 'nb',
      validation: r => r.required(),
    }),
    defineField({name: 'translationKey', type: 'string', validation: r => r.required()}),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {name: 'title', type: 'string'},
        {name: 'description', type: 'text'},
      ],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'language'}},
})
