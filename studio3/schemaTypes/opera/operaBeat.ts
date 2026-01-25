import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'operaBeat',
  title: 'Opera beat',
  type: 'object',
  fields: [
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      description: 'Used for deep-links and “jump to beat” from the Numbers tab.',
    }),

    defineField({
      name: 'title',
      title: 'Beat title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'act',
      title: 'Act',
      type: 'number',
      description: '1, 2, 3...',
    }),

    defineField({
      name: 'illustration',
      title: 'Illustration',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string', title: 'Alternative text'},
        {name: 'caption', type: 'string', title: 'Caption'},
      ],
    }),

    defineField({
      name: 'story',
      title: 'Story text',
      type: 'blockContent',
      description: 'Prose narrative for this beat.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'inlineNumbers',
      title: 'Inline musical numbers',
      type: 'array',
      description: 'Shown as small 🎵 pills within/under the beat.',
      of: [{type: 'reference', to: [{type: 'musicalNumber'}]}],
    }),

    defineField({
      name: 'notes',
      title: 'Optional notes',
      type: 'blockContent',
      description: 'Staging notes, interpretation, trivia. Keep it optional.',
    }),
  ],
})