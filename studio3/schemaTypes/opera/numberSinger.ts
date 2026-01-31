// schemaTypes/opera/numberSinger.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'numberSinger',
  title: 'Singer',
  type: 'object',
  fields: [
    defineField({
      name: 'character',
      title: 'Character',
      type: 'reference',
      to: [{type: 'operaCharacter'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      
      name: 'voiceType',
      title: 'Voice type',
      type: 'string',
      options: {
        list: [
          'Soprano',
          'Mezzo-soprano',
          'Contralto',
          'Tenor',
          'Baritone',
          'Bass',
          'Choir',
          'Treble'
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
})