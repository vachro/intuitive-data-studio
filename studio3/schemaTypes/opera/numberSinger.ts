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
  // 👇 This logic fixes the list display
  preview: {
    select: {
      // This grabs the 'name' field from the referenced 'operaCharacter' document
      characterName: 'character.name',
      voice: 'voiceType',
    },
    prepare({characterName, voice}) {
      return {
        title: characterName || 'No character selected',
        subtitle: voice,
      }
    },
  },
})