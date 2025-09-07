import {defineType, defineField} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

export default defineType({
  name: 'chapter',
  title: 'Chapter',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: r => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: r => r.required()}),
    defineField({name: 'subtitle', type: 'string'}),
    defineField({name: 'hero', title: 'Hero image', type: 'imageWithCaption'}),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}, {type: 'image', options: {hotspot: true}}],
      validation: r => r.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Section background',
      type: 'string',
      options: {
        list: [
          {title: 'Background (lys stripe)', value: 'background'},
          {title: 'Card (mørkere stripe)', value: 'card'},
        ],
        layout: 'radio',
      },
      initialValue: 'background',
    }),
    defineField({name: 'order', type: 'number'}),
    // Lettvekts i18n
    defineField({
      name: 'language',
      type: 'string',
      options: {list: ['nb', 'en', 'de', 'fr']},
      initialValue: 'nb',
      validation: r => r.required(),
    }),
    defineField({
      name: 'translationKey',
      title: 'Translation key',
      type: 'string',
      description: 'Samme verdi på tvers av språk for å binde oversettelser.',
      validation: r => r.required(),
    }),
  ],
  preview: {
    select: {title: 'title', media: 'hero.image', subtitle: 'language'},
  },
})
