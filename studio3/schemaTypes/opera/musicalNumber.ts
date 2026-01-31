import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'musicalNumber',
  title: 'Musical number',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Original title of the musical number.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'opera',
      title: 'Opera',
      type: 'reference',
      to: [{type: 'opera'}],
      description: 'The opera this musical number belongs to.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'act',
      title: 'Act',
      type: 'number',
      description: 'Act in which this number appears.',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'orderInOpera',
      title: 'Order in opera',
      type: 'number',
      description: 'Sequential order of the number within the opera.',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'singers',
      title: 'Who sings',
      type: 'array',
      description: 'Characters performing this number and their voice types.',
      of: [{type: 'numberSinger'}],
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: 'libretto',
      title: 'Libretto (original text)',
      type: 'reference',
      to: [{type: 'librettoText'}],
      description:
        'Reference to the original libretto text. Stored separately for sourcing, rights, and language handling.',
    }),

    defineField({
      name: 'meaningSummary',
      title: 'Meaning summary (English)',
      type: 'blockContent',
      description:
        'Brief explanation of what is being sung and why it matters dramatically.',
    }),

    defineField({
      name: 'appearsInBeatAnchor',
      title: 'Appears in story beat (anchorId)',
      type: 'string',
      description:
        'Anchor ID of the story beat where this number appears (used for deep linking). Example: "queen-request".',
    }),
  ],

  orderings: [
    {
      title: 'Order in opera',
      name: 'orderInOperaAsc',
      by: [{field: 'orderInOpera', direction: 'asc'}],
    },
  ],

  preview: {
    select: {
      title: 'title',
      operaTitle: 'opera.title',
      act: 'act',
      order: 'orderInOpera',
    },
    prepare({title, operaTitle, act, order}) {
      const parts = []
      if (operaTitle) parts.push(operaTitle)
      if (act) parts.push(`Act ${act}`)
      if (order) parts.push(`#${order}`)

      return {
        title,
        subtitle: parts.join(' · '),
      }
    },
  },
})