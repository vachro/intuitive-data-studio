import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'operaCharacter',
  title: 'Opera character',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'opera',
      title: 'Opera',
      type: 'reference',
      to: [{type: 'opera'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'defaultVoiceType',
      title: 'Default voice type',
      type: 'string',
      options: {list: ['Soprano', 'Mezzo-soprano', 'Contralto', 'Tenor', 'Baritone', 'Bass', 'Choir']},
    }),
    defineField({name: 'description', title: 'Description', type: 'blockContent'}),
    defineField({name: 'icon', title: 'Icon', type: 'image', description: 'Small figure icon for UI chips.'}),
  ],
})