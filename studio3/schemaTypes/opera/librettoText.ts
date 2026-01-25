import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'librettoText',
  title: 'Libretto text',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string'}),

    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {list: ['German', 'Italian', 'Latin', 'French', 'Other']},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'text',
      title: 'Libretto (original)',
      type: 'text',
      description: 'Store as plain text for searchability and clean rendering in your UI.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'sourceAttribution',
      title: 'Source attribution',
      type: 'string',
      description: 'Short citation: edition/site + editor + year where applicable.',
    }),

    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
    }),

    defineField({
      name: 'rights',
      title: 'Rights / notes',
      type: 'text',
      description: 'Internal notes about reuse permissions, edition constraints, or editorial choices.',
    }),
  ],

  preview: {
    select: {title: 'title', subtitle: 'language'},
  },
})